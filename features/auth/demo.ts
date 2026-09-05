import type {
  LoginResponse,
  MeResponse,
  MessageResponse,
  RefreshResponse,
  UserProfile,
} from "@/features/auth/types";
import { demoDelay } from "@/lib/utils/demo";

export const DEMO_AUTH_CREDENTIALS = {
  email: "demo.user@example.test",
  password: "DemoPass1!",
} as const;

const DEMO_ACCESS_TOKEN = "synthetic-demo-access-token";

const DEMO_USER: UserProfile = {
  id: "demo-user",
  email: DEMO_AUTH_CREDENTIALS.email,
  firstName: "Demo",
  lastName: "User",
  role: "member",
  status: "active",
};

async function message(message: string): Promise<MessageResponse> {
  await demoDelay();
  return { message };
}

export const demoAuthAdapter = {
  async signup(): Promise<MessageResponse> {
    return message("Demo account created.");
  },
  async verifyEmail(): Promise<MessageResponse> {
    return message("Demo email verified.");
  },
  async resendVerification(): Promise<MessageResponse> {
    return message("Demo verification sent.");
  },
  async login(): Promise<LoginResponse> {
    await demoDelay();
    return { accessToken: DEMO_ACCESS_TOKEN, user: DEMO_USER };
  },
  async logout(): Promise<void> {
    await demoDelay();
  },
  async refresh(): Promise<RefreshResponse> {
    await demoDelay();
    return { accessToken: DEMO_ACCESS_TOKEN };
  },
  async getMe(): Promise<MeResponse> {
    await demoDelay();
    return DEMO_USER;
  },
  async forgotPassword(): Promise<MessageResponse> {
    return message("Demo reset instructions sent.");
  },
  async resetPassword(): Promise<MessageResponse> {
    return message("Demo password reset.");
  },
} as const;
