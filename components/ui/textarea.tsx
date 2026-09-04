import * as React from "react";
import { cn } from "@/lib/utils/helpers";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/30 min-h-24 w-full resize-y rounded-xl border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
