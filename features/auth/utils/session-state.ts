import type { SessionState } from "@/features/auth/types";

let state: SessionState = "pending";
const listeners = new Set<() => void>();

export function getSessionState(): SessionState {
  return state;
}

export function setSessionState(nextState: SessionState): void {
  if (state === nextState) return;
  state = nextState;
  listeners.forEach((listener) => listener());
}

export function subscribeToSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
