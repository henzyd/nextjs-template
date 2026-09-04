import { AUTH_ENDPOINTS } from "@/features/auth/constants";

export function startGoogleSignIn(): void {
  window.location.assign(AUTH_ENDPOINTS.bridge.google);
}
