import type { AxiosRequestConfig } from "axios";
import { AUTH_ENDPOINTS } from "@/features/auth/constants";
import { demoAuthAdapter } from "@/features/auth/demo";
import type {
  ForgotPasswordInput,
  LoginInput,
  LoginResponse,
  MeResponse,
  MessageResponse,
  RefreshResponse,
  ResendVerificationInput,
  ResetPasswordInput,
  SignupInput,
  VerifyEmailInput,
} from "@/features/auth/types";
import publicHttp, { privateHttp } from "@/lib/config/axios";
import { isDemoMode } from "@/lib/utils/demo";

async function bridgeRequest<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...init,
  });
  const payload: unknown = await response.json().catch(() => ({}));

  if (!response.ok) {
    const data = payload && typeof payload === "object" ? payload : {};
    const error = new Error("The request could not be completed.");
    Object.assign(error, { response: { status: response.status, data } });
    throw error;
  }

  return payload as T;
}

export class AuthService {
  static async signup(data: SignupInput): Promise<MessageResponse> {
    if (isDemoMode()) return demoAuthAdapter.signup();
    const response = await publicHttp.post<MessageResponse>(
      AUTH_ENDPOINTS.backend.signup,
      data
    );
    return response.data;
  }

  static async verifyEmail(data: VerifyEmailInput): Promise<MessageResponse> {
    if (isDemoMode()) return demoAuthAdapter.verifyEmail();
    const response = await publicHttp.post<MessageResponse>(
      AUTH_ENDPOINTS.backend.verifyEmail,
      data
    );
    return response.data;
  }

  static async resendVerification(
    data: ResendVerificationInput
  ): Promise<MessageResponse> {
    if (isDemoMode()) return demoAuthAdapter.resendVerification();
    const response = await publicHttp.post<MessageResponse>(
      AUTH_ENDPOINTS.backend.resendVerification,
      data
    );
    return response.data;
  }

  static login(data: LoginInput): Promise<LoginResponse> {
    if (isDemoMode()) return demoAuthAdapter.login();
    return bridgeRequest<LoginResponse>(AUTH_ENDPOINTS.bridge.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  static async logout(): Promise<void> {
    if (isDemoMode()) return demoAuthAdapter.logout();
    await bridgeRequest(AUTH_ENDPOINTS.bridge.logout, { method: "POST" });
  }

  static refresh(): Promise<RefreshResponse> {
    if (isDemoMode()) return demoAuthAdapter.refresh();
    return bridgeRequest<RefreshResponse>(AUTH_ENDPOINTS.bridge.refresh, {
      method: "POST",
    });
  }

  static async getMe(config?: AxiosRequestConfig): Promise<MeResponse> {
    if (isDemoMode()) return demoAuthAdapter.getMe();
    const response = await privateHttp.get<MeResponse>(
      AUTH_ENDPOINTS.backend.me,
      config
    );
    return response.data;
  }

  static async forgotPassword(
    data: ForgotPasswordInput
  ): Promise<MessageResponse> {
    if (isDemoMode()) return demoAuthAdapter.forgotPassword();
    const response = await publicHttp.post<MessageResponse>(
      AUTH_ENDPOINTS.backend.forgotPassword,
      data
    );
    return response.data;
  }

  static async resetPassword(
    data: ResetPasswordInput
  ): Promise<MessageResponse> {
    if (isDemoMode()) return demoAuthAdapter.resetPassword();
    const response = await publicHttp.post<MessageResponse>(
      AUTH_ENDPOINTS.backend.resetPassword,
      data
    );
    return response.data;
  }
}
