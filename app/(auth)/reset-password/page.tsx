import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/app/(auth)/reset-password/_sections/reset-password-form";

export const metadata: Metadata = { title: "Reset password" };

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
