"use client";

import { useState } from "react";
import { Form, Formik } from "formik";
import { ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import FormField from "@/components/forms/fields/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordRequirements } from "@/components/ui/password-requirements";
import { useResetPassword } from "@/features/auth/hooks/use-auth";
import { resetPasswordSchema } from "@/features/auth/schemas/auth-schemas";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetPassword = useResetPassword();
  const token = searchParams.get("token") ?? "";
  const [showRequirements, setShowRequirements] = useState(false);

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Reset link required</CardTitle>
          <p className="text-muted-foreground text-sm">
            Request a new link before choosing a password.
          </p>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/forgot-password">Request a reset link</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Choose a new password</CardTitle>
        <p className="text-muted-foreground text-sm">
          Use a strong password that you do not reuse elsewhere.
        </p>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={{ password: "", confirmPassword: "" }}
          validationSchema={resetPasswordSchema}
          validateOnBlur={false}
          onSubmit={async (values) => {
            try {
              await resetPassword.mutateAsync({
                token,
                password: values.password,
              });
              router.push("/login");
            } catch {
              // Mutation callbacks surface the error.
            }
          }}
        >
          {({ isSubmitting, values }) => (
            <Form className="space-y-4">
              <FormField
                name="password"
                label="New password"
                type="password"
                autoComplete="new-password"
                required
                hideAsterisk
                onFocus={() => setShowRequirements(true)}
                startAdornment={<Lock className="size-4" aria-hidden />}
              />
              <PasswordRequirements
                password={values.password}
                isVisible={showRequirements || Boolean(values.password)}
              />
              <FormField
                name="confirmPassword"
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                required
                hideAsterisk
                startAdornment={<Lock className="size-4" aria-hidden />}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={!values.password || !values.confirmPassword}
                isLoading={isSubmitting || resetPassword.isPending}
              >
                Reset password
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
}
