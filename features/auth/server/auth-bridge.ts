import "server-only";
import type { NextRequest } from "next/server";

type JsonObject = Record<string, unknown>;

function requireAbsoluteUrl(name: "API_BASE_URL" | "APP_URL"): URL {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);

  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error(`${name} must use HTTP or HTTPS`);
  }
  return url;
}

export function getBackendUrl(path: string): string {
  return new URL(path, requireAbsoluteUrl("API_BASE_URL")).toString();
}

export function getAppUrl(path: string, request?: NextRequest): URL {
  if (process.env.APP_URL) {
    return new URL(path, requireAbsoluteUrl("APP_URL"));
  }

  if (process.env.NODE_ENV !== "production" && request) {
    return new URL(path, request.nextUrl.origin);
  }

  throw new Error("APP_URL is not configured");
}

export async function readJson(response: Response): Promise<JsonObject> {
  const value: unknown = await response.json().catch(() => ({}));
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : {};
}

export function separateCredential(payload: JsonObject): {
  credential: string | null;
  safePayload: JsonObject;
} {
  const { refreshToken, authToken, ...safePayload } = payload;
  const credential =
    typeof refreshToken === "string"
      ? refreshToken
      : typeof authToken === "string"
        ? authToken
        : null;

  return { credential, safePayload };
}

export function jsonResponse(
  payload: JsonObject,
  init: ResponseInit = {}
): Response {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store");
  return Response.json(payload, { ...init, headers });
}
