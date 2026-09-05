import axios, { type InternalAxiosRequestConfig } from "axios";
import axiosRetry from "axios-retry";
import { AUTH_ENDPOINTS } from "@/features/auth/constants";
import {
  getAccessToken,
  setMemoryAccessToken,
} from "@/features/auth/utils/access-token";
import { getLoginRedirectPath } from "@/features/auth/utils/route-guards";
import { setSessionState } from "@/features/auth/utils/session-state";
import { getQueryClient } from "@/lib/config/query-client";
import { QUERY_KEYS } from "@/lib/utils/query-keys";

const REQUEST_TIMEOUT_MS = 15_000;

function createHttpClient() {
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      common: { Accept: "application/json" },
      post: { "Content-Type": "application/json" },
    },
  });
}

const publicHttp = createHttpClient();
export const privateHttp = createHttpClient();

let refreshPromise: Promise<string | null> | null = null;
let logoutPromise: Promise<void> | null = null;

export function setAccessToken(token: string | null): void {
  setMemoryAccessToken(token);

  if (token) {
    privateHttp.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete privateHttp.defaults.headers.common.Authorization;
  }
}

export { getAccessToken };

export function clearAccessToken(): void {
  setAccessToken(null);
}

async function refreshAccessToken(): Promise<string | null> {
  refreshPromise ??= fetch(AUTH_ENDPOINTS.bridge.refresh, {
    method: "POST",
    credentials: "same-origin",
  })
    .then(async (response) => {
      if (!response.ok) return null;
      const payload = (await response.json()) as { accessToken?: unknown };
      if (typeof payload.accessToken !== "string") return null;
      setAccessToken(payload.accessToken);
      return payload.accessToken;
    })
    .catch(() => null)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

async function clearSessionAndRedirect(): Promise<void> {
  clearAccessToken();
  setSessionState("unauthenticated");

  if (typeof window === "undefined") return;

  getQueryClient().removeQueries({ queryKey: QUERY_KEYS.auth.all });
  logoutPromise ??= fetch(AUTH_ENDPOINTS.bridge.logout, {
    method: "POST",
    credentials: "same-origin",
  })
    .catch(() => undefined)
    .then(() => undefined)
    .finally(() => {
      logoutPromise = null;
    });
  await logoutPromise;

  window.location.assign(
    getLoginRedirectPath(window.location.pathname, window.location.search)
  );
}

privateHttp.interceptors.request.use((request) => {
  const token = getAccessToken();
  if (token) request.headers.Authorization = `Bearer ${token}`;
  return request;
});

type AuthRetryConfig = InternalAxiosRequestConfig & { _authRetry?: boolean };

privateHttp.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || !error.config) {
      return Promise.reject(error);
    }

    const request = error.config as AuthRetryConfig;
    if (error.response?.status !== 401) return Promise.reject(error);
    if (request._authRetry) {
      await clearSessionAndRedirect();
      return Promise.reject(error);
    }

    request._authRetry = true;
    const token = await refreshAccessToken();
    if (!token) {
      await clearSessionAndRedirect();
      return Promise.reject(error);
    }

    request.headers.Authorization = `Bearer ${token}`;
    return privateHttp.request(request);
  }
);

function configureRetry(client: ReturnType<typeof createHttpClient>): void {
  axiosRetry(client, {
    retries: 1,
    retryDelay: axiosRetry.exponentialDelay,
    shouldResetTimeout: true,
    retryCondition: (error) => {
      if (axios.isCancel(error)) return false;
      const status = error.response?.status ?? 0;
      if (status >= 400 && status < 500) return false;
      return axiosRetry.isNetworkError(error) || status >= 500;
    },
  });
}

configureRetry(publicHttp);
configureRetry(privateHttp);

export default publicHttp;
