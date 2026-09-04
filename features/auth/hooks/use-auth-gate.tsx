"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "@/features/auth/hooks/use-session";

interface AuthGateContextValue {
  ensureAuth: (action?: () => void) => boolean;
}

const AuthGateContext = createContext<AuthGateContextValue | null>(null);

export function AuthGateProvider({
  children,
  message = "Sign in to continue with this action.",
}: {
  children: ReactNode;
  message?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();

  const ensureAuth = useCallback(
    (action?: () => void) => {
      if (session === "authenticated") {
        action?.();
        return true;
      }
      setOpen(true);
      return false;
    },
    [session]
  );

  const navigate = (path: string) => {
    setOpen(false);
    router.push(`${path}?origin=${encodeURIComponent(pathname)}`);
  };

  return (
    <AuthGateContext.Provider value={{ ensureAuth }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign in required</DialogTitle>
            <DialogDescription>{message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => navigate("/sign-up")}>
              Create account
            </Button>
            <Button onClick={() => navigate("/login")}>Sign in</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthGateContext.Provider>
  );
}

export function useAuthGate(): AuthGateContextValue {
  const value = useContext(AuthGateContext);
  if (!value) {
    throw new Error("useAuthGate must be used within AuthGateProvider");
  }
  return value;
}
