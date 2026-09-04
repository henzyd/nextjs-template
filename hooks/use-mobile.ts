"use client";

import { useMemo, useSyncExternalStore } from "react";

export function useIsMobile(breakpoint = 768): boolean {
  const [subscribe, getSnapshot] = useMemo(
    () => [
      (callback: () => void) => {
        const query = window.matchMedia(`(max-width: ${breakpoint}px)`);
        query.addEventListener("change", callback);
        return () => query.removeEventListener("change", callback);
      },
      () => window.matchMedia(`(max-width: ${breakpoint}px)`).matches,
    ],
    [breakpoint]
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
