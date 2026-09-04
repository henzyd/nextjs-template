"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useSessionBootstrap } from "@/features/auth/hooks/use-session-bootstrap";
import type { SessionState } from "@/features/auth/types";

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const state = useSessionBootstrap();
  return (
    <SessionContext.Provider value={state}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionState {
  const state = useContext(SessionContext);
  if (state === null) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return state;
}
