"use client";

import { useEffect, useRef } from "react";
import { LoaderCircle, MailCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useResendVerification,
  useVerifyEmail,
} from "@/features/auth/hooks/use-auth";
import { getAuthErrorData } from "@/features/auth/utils/auth-errors";

function TokenVerification({ token }: { token: string }) {
  const router = useRouter();
  const started = useRef(false);
  const verification = useVerifyEmail({
    onSuccess: () => router.replace("/login?verified=1"),
  });

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    verification.mutate({ token });
  }, [token, verification]);

  if (verification.isError) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Verification failed</CardTitle>
          <p className="text-muted-foreground text-sm">
            {getAuthErrorData(verification.error)?.message ??
              "The verification link is invalid or has expired."}
          </p>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/sign-up">Back to account creation</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="text-muted-foreground flex items-center gap-3 text-sm">
      <LoaderCircle className="text-primary size-5 animate-spin" aria-hidden />
      Verifying your email…
    </div>
  );
}

function InboxNotice({ email, reset }: { email: string; reset: boolean }) {
  const resend = useResendVerification();

  return (
    <Card className="w-full max-w-md text-center">
      <CardHeader className="items-center">
        <span className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-full">
          <MailCheck className="size-6" aria-hidden />
        </span>
        <CardTitle className="pt-3 text-2xl">Check your inbox</CardTitle>
        <p className="text-muted-foreground text-sm leading-6">
          {reset
            ? "Follow the password reset link we sent."
            : "Follow the verification link to activate your account."}
        </p>
        {email && <p className="text-sm font-medium">{email}</p>}
      </CardHeader>
      <CardContent className="space-y-3">
        <Button asChild className="w-full">
          <Link href="/login">Back to sign in</Link>
        </Button>
        {reset ? (
          <Button asChild variant="ghost" className="w-full">
            <Link href="/forgot-password">Request another reset link</Link>
          </Button>
        ) : (
          email && (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              isLoading={resend.isPending}
              onClick={() => resend.mutate({ email })}
            >
              Resend verification link
            </Button>
          )
        )}
      </CardContent>
    </Card>
  );
}

export function VerifyEmailView() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email") ?? "";
  const reset = searchParams.get("mode") === "reset";

  return token ? (
    <TokenVerification token={token} />
  ) : (
    <InboxNotice email={email} reset={reset} />
  );
}
