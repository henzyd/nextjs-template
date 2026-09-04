import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-muted/30 min-h-screen">
      <header className="absolute inset-x-0 top-0 z-10">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-6">
          <Link href="/" className="font-semibold tracking-tight">
            Application
          </Link>
        </div>
      </header>
      <main className="flex min-h-screen items-center justify-center px-4 py-24">
        {children}
      </main>
    </div>
  );
}
