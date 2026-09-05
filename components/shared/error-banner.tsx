import { cn } from "@/lib/utils/helpers";

export function collectFormErrorMessages(
  errors: Record<string, unknown>
): string[] {
  const messages = new Set<string>();

  const collect = (value: unknown) => {
    if (typeof value === "string" && value.trim()) {
      messages.add(value.trim());
    } else if (Array.isArray(value)) {
      value.forEach(collect);
    } else if (value && typeof value === "object") {
      Object.values(value).forEach(collect);
    }
  };

  Object.values(errors).forEach(collect);
  return [...messages];
}

export function ErrorBanner({
  className,
  messages,
}: {
  className?: string;
  messages: readonly string[];
}) {
  if (messages.length === 0) return null;

  return (
    <div
      role="alert"
      className={cn(
        "border-destructive/30 bg-destructive/10 text-destructive rounded-xl border px-4 py-3",
        className
      )}
    >
      <ul className="list-inside list-disc space-y-1 text-sm">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
