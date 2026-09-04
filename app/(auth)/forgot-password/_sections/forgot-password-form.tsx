"use client";

import { Form, Formik } from "formik";
import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FormField from "@/components/forms/fields/form-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForgotPassword } from "@/features/auth/hooks/use-auth";
import { emailSchema } from "@/features/auth/schemas/auth-schemas";

export function ForgotPasswordForm() {
  const router = useRouter();
  const forgotPassword = useForgotPassword();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Reset your password</CardTitle>
        <p className="text-muted-foreground text-sm">
          Enter your email address to request a reset link.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Formik
          initialValues={{ email: "" }}
          validationSchema={emailSchema}
          validateOnBlur={false}
          onSubmit={async (values) => {
            try {
              const email = values.email.trim();
              await forgotPassword.mutateAsync({ email });
              router.push(
                `/verify-email?mode=reset&email=${encodeURIComponent(email)}`
              );
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
              <Button
                type="submit"
                className="w-full"
                disabled={!values.email.trim()}
                isLoading={isSubmitting || forgotPassword.isPending}
              >
                Send reset link
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </Form>
          )}
        </Formik>
        <p className="text-center text-sm">
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
