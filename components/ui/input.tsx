import * as React from "react";
import { cn } from "@/lib/utils/helpers";

export interface InputProps extends React.ComponentProps<"input"> {
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  wrapperClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, endAdornment, startAdornment, wrapperClassName, ...props },
    ref
  ) => (
    <div
      className={cn(
        "border-input focus-within:border-ring focus-within:ring-ring/30 flex h-10 items-center gap-2 rounded-xl border px-3 transition focus-within:ring-2",
        wrapperClassName
      )}
    >
      {startAdornment}
      <input
        ref={ref}
        className={cn(
          "placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
      {endAdornment}
    </div>
  )
);
Input.displayName = "Input";

export { Input };
