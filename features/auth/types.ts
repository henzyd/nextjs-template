export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  role?: string;
  status?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
}

export interface VerifyEmailInput {
  token: string;
}

export interface ResendVerificationInput {
  email: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: UserProfile;
}

export interface RefreshResponse {
  accessToken: string;
}

export type MeResponse = UserProfile;

export interface MessageResponse {
  message: string;
}

export type SessionState = "pending" | "authenticated" | "unauthenticated";
