import { NextResponse, type NextRequest } from "next/server";
import { AUTH_ENDPOINTS } from "@/features/auth/constants";
import {
  getAppUrl,
  getBackendUrl,
  readJson,
  separateCredential,
} from "@/features/auth/server/auth-bridge";
import { AUTH_COOKIE_NAME, authCookieOptions } from "@/lib/config/auth-cookies";

function loginError(request: NextRequest): NextResponse {
  return NextResponse.redirect(
    getAppUrl("/login?error=google_failed", request)
  );
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) return loginError(request);

  try {
    const backendResponse = await fetch(
      getBackendUrl(AUTH_ENDPOINTS.backend.googleExchange),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        cache: "no-store",
      }
    );

    if (!backendResponse.ok) return loginError(request);

    const payload = await readJson(backendResponse);
    const { credential } = separateCredential(payload);
    if (!credential) return loginError(request);

    const response = NextResponse.redirect(getAppUrl("/", request));
    response.cookies.set(AUTH_COOKIE_NAME, credential, authCookieOptions);
    return response;
  } catch {
    return loginError(request);
  }
}
