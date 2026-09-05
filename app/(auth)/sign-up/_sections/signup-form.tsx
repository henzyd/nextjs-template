"use client";

import { useState } from "react";
import { Form, Formik } from "formik";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoogleButton } from "@/components/ui/google-button";
import { PasswordRequirements } from "@/components/ui/password-requirements";
import { isGoogleAuthEnabled } from "@/features/auth/constants";
import { useSignup } from "@/features/auth/hooks";
import { signupSchema } from "@/features/auth/schemas";
import { startGoogleSignIn } from "@/features/auth/utils/google";

export function SignupForm() {
  const router = useRouter();
  const signup = useSignup();
  const [showRequirements, setShowRequirements] = useState(false);

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <p className="text-muted-foreground text-sm">
          Enter your details to get started.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Formik
          initialValues={{
            firstName: "",
            lastName: "",
            email: "",
            password: "",
          }}
          validationSchema={signupSchema}
          validateOnBlur={false}
          onSubmit={async (values) => {
            try {
              const email = values.email.trim();
              await signup.mutateAsync({
                firstName: values.firstName.trim(),
                lastName: values.lastName.trim() || undefined,
                email,
                password: values.password,
              });
              router.push(`/verify-email?email=${encodeURIComponent(email)}`);
            } catch {
              // Mutation callbacks surface the error.
            }
          }}
        >
          {({ isSubmitting, values }) => (
            <Form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  name="firstName"
                  label="First name"
                  autoComplete="given-name"
                  required
                  hideAsterisk
                  startAdornment={<User className="size-4" aria-hidden />}
                />
                <FormField
                  name="lastName"
                  label="Last name"
                  autoComplete="family-name"
                  startAdornment={<User className="size-4" aria-hidden />}
                />
              </div>
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
              <Button
                type="submit"
                className="w-full"
                disabled={
                  !values.firstName.trim() ||
                  !values.email.trim() ||
                  !values.password
                }
                isLoading={isSubmitting || signup.isPending}
              >
                Create account
                <ArrowRight className="size-4" aria-hidden />
              </Button>
            </Form>
          )}
        </Formik>
        {isGoogleAuthEnabled() && <GoogleButton onClick={startGoogleSignIn} />}
        <p className="text-muted-foreground text-center text-sm">
          Already registered?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
