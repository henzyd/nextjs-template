"use client";

import { Form, Formik } from "formik";
import { ArrowRight, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormField } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleButton } from "@/components/ui/google-button";
import {
  ACCOUNT_INACTIVE_MESSAGE,
  ACCOUNT_SUSPENDED_MESSAGE,
  isGoogleAuthEnabled,
} from "@/features/auth/constants";
import { DEMO_AUTH_CREDENTIALS } from "@/features/auth/demo";
import { useLogin } from "@/features/auth/hooks";
import { loginSchema } from "@/features/auth/schemas";
import { startGoogleSignIn } from "@/features/auth/utils/google";
import { getSafeReturnPath } from "@/features/auth/utils/route-guards";
import { isDemoMode } from "@/lib/utils/demo";

const oauthErrors: Record<string, string> = {
  google_failed: "Google sign-in failed. Please try again.",
  account_suspended: ACCOUNT_SUSPENDED_MESSAGE,
  account_inactive: ACCOUNT_INACTIVE_MESSAGE,
};

const initialValues = isDemoMode()
  ? { ...DEMO_AUTH_CREDENTIALS }
  : { email: "", password: "" };

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnPath = getSafeReturnPath(searchParams.get("origin"));
  const notice = oauthErrors[searchParams.get("error") ?? ""];
  const verified = searchParams.get("verified") === "1";
  const login = useLogin({ onSuccess: () => router.push(returnPath) });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <p className="text-muted-foreground text-sm">
          Sign in to continue to your account.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {verified && (
          <p className="border-success/30 bg-success/10 text-success rounded-xl border px-3 py-2 text-sm">
            Email verified. You can now sign in.
          </p>
        )}
        {notice && (
          <p className="border-destructive/30 bg-destructive/5 text-destructive rounded-xl border px-3 py-2 text-sm">
            {notice}
          </p>
        )}
        <Formik
          initialValues={initialValues}
          validationSchema={loginSchema}
          validateOnBlur={false}
          onSubmit={async (values) => {
            try {
              await login.mutateAsync({
                email: values.email.trim(),
                password: values.password,
              });
            } catch {
              // Mutation callbacks surface the error.
            }
          }}
        >
          {({ isSubmitting, values }) => (
            <Form className="space-y-4">
              <FormField
                name="email"
                label="Email address"
                type="email"
                autoComplete="email"
                required
                hideAsterisk
                startAdornment={<Mail className="size-4" aria-hidden />}
              />
              <FormField
                name="password"
                label="Password"
                type="password"
                autoComplete="current-password"
                required
                hideAsterisk
                startAdornment={<Lock className="size-4" aria-hidden />}
              />
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-primary text-sm hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={!values.email.trim() || !values.password}
                isLoading={isSubmitting || login.isPending}
              >
                Sign in
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </Form>
          )}
        </Formik>
        {isGoogleAuthEnabled() && (
          <>
            <div className="text-muted-foreground flex items-center gap-3 text-xs">
              <span className="bg-border h-px flex-1" />
              or
              <span className="bg-border h-px flex-1" />
            </div>
            <GoogleButton onClick={startGoogleSignIn} />
          </>
        )}
        <p className="text-muted-foreground text-center text-sm">
          Need an account?{" "}
          <Link
            href="/sign-up"
            className="text-primary font-medium hover:underline"
          >
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
