"use client";

import type { ReactNode } from "react";
import { AuthGateProvider } from "@/components/providers/auth-gate-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { TanstackQueryProvider } from "@/components/providers/tanstack-query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { DemoModeIndicator } from "@/components/shared/demo-mode-indicator";
import { OfflineBanner } from "@/components/shared/offline-banner";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <TanstackQueryProvider>
        <SessionProvider>
          <AuthGateProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </AuthGateProvider>
        </SessionProvider>
        <OfflineBanner />
        <DemoModeIndicator />
        <Toaster />
      </TanstackQueryProvider>
    </ThemeProvider>
  );
}
