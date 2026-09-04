import type { Metadata } from "next";
import { SignupForm } from "@/app/(auth)/sign-up/_sections/signup-form";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return <SignupForm />;
}
