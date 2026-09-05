export const AUTH_ENDPOINTS = {
  bridge: {
    google: "/api/auth/google",
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    refresh: "/api/auth/refresh",
  },
  backend: {
    forgotPassword: "/auth/forgot-password",
    google: "/auth/google",
    googleExchange: "/auth/google/exchange",
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
    refresh: "/auth/refresh",
    resendVerification: "/auth/resend-verification",
    resetPassword: "/auth/reset-password",
    signup: "/auth/signup",
    verifyEmail: "/auth/verify-email",
  },
} as const;

export const ACCOUNT_INACTIVE_MESSAGE =
  "Account is inactive. Please contact support.";
export const ACCOUNT_SUSPENDED_MESSAGE =
  "Account is suspended. Please contact support.";

export function isGoogleAuthEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true" &&
    process.env.NEXT_PUBLIC_DEMO_MODE !== "true"
  );
}
