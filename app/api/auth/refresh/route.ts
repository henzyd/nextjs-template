import { cookies } from "next/headers";
import { AUTH_ENDPOINTS } from "@/features/auth/constants";
import {
  getBackendUrl,
  jsonResponse,
  readJson,
  separateCredential,
} from "@/features/auth/server/auth-bridge";
import { AUTH_COOKIE_NAME, authCookieOptions } from "@/lib/config/auth-cookies";

export async function POST(): Promise<Response> {
  const cookieStore = await cookies();
  const credential = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!credential) {
    return jsonResponse({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const backendResponse = await fetch(
      getBackendUrl(AUTH_ENDPOINTS.backend.refresh),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: credential }),
        cache: "no-store",
      }
    );

    if (!backendResponse.ok) {
      cookieStore.delete(AUTH_COOKIE_NAME);
      return jsonResponse({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = await readJson(backendResponse);
    const { credential: rotatedCredential, safePayload } =
      separateCredential(payload);

    if (typeof safePayload.accessToken !== "string") {
      cookieStore.delete(AUTH_COOKIE_NAME);
      return jsonResponse(
        { message: "The authentication service returned an invalid response." },
        { status: 502 }
      );
    }

    if (rotatedCredential) {
      cookieStore.set(AUTH_COOKIE_NAME, rotatedCredential, authCookieOptions);
    }

    return jsonResponse(safePayload);
  } catch {
    return jsonResponse(
      { message: "The authentication service is unavailable." },
      { status: 502 }
    );
  }
}
