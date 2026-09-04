import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <AppShell>
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center px-6 py-20">
        <div className="space-y-6">
          <p className="text-primary text-sm font-semibold">Next.js starter</p>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Your application starts here.
            </h1>
            <p className="text-muted-foreground max-w-2xl text-lg leading-8">
              Replace this neutral shell with your interface while keeping the
              typed data, form, authentication, and deployment foundations.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/sign-up">
              Get started
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>
    </AppShell>
  );
}
