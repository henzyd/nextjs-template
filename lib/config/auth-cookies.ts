import "server-only";

const configuredCookieName = process.env.AUTH_COOKIE_NAME?.trim();

export const AUTH_COOKIE_NAME = configuredCookieName || "app_auth";

export const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};
