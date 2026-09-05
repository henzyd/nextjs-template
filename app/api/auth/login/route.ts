import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { AUTH_ENDPOINTS } from "@/features/auth/constants";
import {
  getBackendUrl,
  jsonResponse,
  readJson,
  separateCredential,
} from "@/features/auth/server/auth-bridge";
import { AUTH_COOKIE_NAME, authCookieOptions } from "@/lib/config/auth-cookies";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body: unknown = await request.json();
    const backendResponse = await fetch(
      getBackendUrl(AUTH_ENDPOINTS.backend.login),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      }
    );
    const payload = await readJson(backendResponse);
    const { credential, safePayload } = separateCredential(payload);

    if (!backendResponse.ok) {
      return jsonResponse(safePayload, { status: backendResponse.status });
    }

    if (!credential || typeof safePayload.accessToken !== "string") {
      return jsonResponse(
        { message: "The authentication service returned an invalid response." },
        { status: 502 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, credential, authCookieOptions);
    return jsonResponse(safePayload);
  } catch {
    return jsonResponse(
      { message: "The authentication service is unavailable." },
      { status: 502 }
    );
  }
}
