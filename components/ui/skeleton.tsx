import { cn } from "@/lib/utils/helpers";

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}
