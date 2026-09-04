import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_ENDPOINTS } from "@/features/auth/constants";
import { getAppUrl, getBackendUrl } from "@/features/auth/server/auth-bridge";
import { AUTH_COOKIE_NAME } from "@/lib/config/auth-cookies";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const cookieStore = await cookies();

  try {
    if (cookieStore.has(AUTH_COOKIE_NAME)) {
      return NextResponse.redirect(getAppUrl("/", request));
    }

    return NextResponse.redirect(getBackendUrl(AUTH_ENDPOINTS.backend.google));
  } catch {
    return NextResponse.redirect(
      getAppUrl("/login?error=google_failed", request)
    );
  }
}
