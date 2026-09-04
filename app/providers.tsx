"use client";

import { useState, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "@/components/ui/sonner";
import { AuthGateProvider } from "@/features/auth/hooks/use-auth-gate";
import { SessionProvider } from "@/features/auth/hooks/use-session";
import { getQueryClient } from "@/lib/config/query-client";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(getQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <AuthGateProvider>{children}</AuthGateProvider>
      </SessionProvider>
      <Toaster />
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
