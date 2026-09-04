import { cookies } from "next/headers";
import { AUTH_ENDPOINTS } from "@/features/auth/constants";
import {
  getBackendUrl,
  jsonResponse,
} from "@/features/auth/server/auth-bridge";
import { AUTH_COOKIE_NAME } from "@/lib/config/auth-cookies";

export async function POST(): Promise<Response> {
  const cookieStore = await cookies();
  const credential = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  try {
    if (credential) {
      await fetch(getBackendUrl(AUTH_ENDPOINTS.backend.logout), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: credential }),
        cache: "no-store",
      });
    }
  } catch {
    // Backend revocation is best-effort; local credential removal is mandatory.
  } finally {
    cookieStore.delete(AUTH_COOKIE_NAME);
  }

  return jsonResponse({ success: true });
}
