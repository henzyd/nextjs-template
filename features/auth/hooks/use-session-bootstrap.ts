"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { AuthService } from "@/features/auth/services/auth.api";
import type { SessionState } from "@/features/auth/types";
import {
  getSessionState,
  setSessionState,
  subscribeToSession,
} from "@/features/auth/utils/session-state";
import { clearAccessToken, setAccessToken } from "@/lib/config/axios";
import { QUERY_KEYS } from "@/lib/utils/query-keys";

let bootstrapPromise: Promise<SessionState> | null = null;

async function bootstrap(queryClient: QueryClient): Promise<SessionState> {
  try {
    const { accessToken } = await AuthService.refresh();
    setAccessToken(accessToken);

    await queryClient.fetchQuery({
      queryKey: QUERY_KEYS.auth.me,
      queryFn: ({ signal }) => AuthService.getMe({ signal }),
      staleTime: 5 * 60 * 1000,
    });

    return "authenticated";
  } catch {
    clearAccessToken();
    queryClient.removeQueries({ queryKey: QUERY_KEYS.auth.all });
    return "unauthenticated";
  }
}

export function useSessionBootstrap(): SessionState {
  const queryClient = useQueryClient();
  const state = useSyncExternalStore<SessionState>(
    subscribeToSession,
    getSessionState,
    () => "pending" as const
  );

  useEffect(() => {
    if (getSessionState() !== "pending") return;

    bootstrapPromise ??= bootstrap(queryClient);
    void bootstrapPromise.then(setSessionState);
  }, [queryClient]);

  return state;
}
