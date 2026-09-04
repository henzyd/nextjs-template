import type { AxiosRequestConfig } from "axios";
import publicHttp, { privateHttp } from "@/lib/config/axios";
import { AUTH_ENDPOINTS } from "@/features/auth/constants";
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
    const response = await publicHttp.post<MessageResponse>(
      AUTH_ENDPOINTS.backend.signup,
      data
    );
    return response.data;
  }

  static async verifyEmail(data: VerifyEmailInput): Promise<MessageResponse> {
    const response = await publicHttp.post<MessageResponse>(
      AUTH_ENDPOINTS.backend.verifyEmail,
      data
    );
    return response.data;
  }

  static async resendVerification(
    data: ResendVerificationInput
  ): Promise<MessageResponse> {
    const response = await publicHttp.post<MessageResponse>(
      AUTH_ENDPOINTS.backend.resendVerification,
      data
    );
    return response.data;
  }

  static login(data: LoginInput): Promise<LoginResponse> {
    return bridgeRequest<LoginResponse>(AUTH_ENDPOINTS.bridge.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  static async logout(): Promise<void> {
    await bridgeRequest(AUTH_ENDPOINTS.bridge.logout, { method: "POST" });
  }

  static refresh(): Promise<RefreshResponse> {
    return bridgeRequest<RefreshResponse>(AUTH_ENDPOINTS.bridge.refresh, {
      method: "POST",
    });
  }

  static async getMe(config?: AxiosRequestConfig): Promise<MeResponse> {
    const response = await privateHttp.get<MeResponse>(
      AUTH_ENDPOINTS.backend.me,
      config
    );
    return response.data;
  }

  static async forgotPassword(
    data: ForgotPasswordInput
  ): Promise<MessageResponse> {
    const response = await publicHttp.post<MessageResponse>(
      AUTH_ENDPOINTS.backend.forgotPassword,
      data
    );
    return response.data;
  }

  static async resetPassword(
    data: ResetPasswordInput
  ): Promise<MessageResponse> {
    const response = await publicHttp.post<MessageResponse>(
      AUTH_ENDPOINTS.backend.resetPassword,
      data
    );
    return response.data;
  }
}
