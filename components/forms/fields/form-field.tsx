"use client";

import { useState, type ReactNode } from "react";
import { Eye, EyeOff, Search } from "lucide-react";
import { cn } from "@/lib/utils/helpers";
import { FormFieldWrapper } from "@/components/forms/form-field-wrapper";

type FormFieldProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "name"
> & {
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  hideAsterisk?: boolean;
  wrapperClassName?: string;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  onValueChange?: (value: string) => void;
};

export default function FormField({
  className,
  description,
  endAdornment,
  hideAsterisk,
  label,
  name,
  onValueChange,
  required,
  startAdornment,
  type = "text",
  wrapperClassName,
  ...props
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const adornment =
    type === "search" ? (
      <Search className="size-4" aria-hidden />
    ) : (
      startAdornment
    );

  return (
    <FormFieldWrapper
      name={name}
      label={label}
      description={description}
      required={required}
      hideAsterisk={hideAsterisk}
      wrapperClassName={wrapperClassName}
    >
      {({ field, meta }) => (
        <div
          className={cn(
            "border-input focus-within:border-ring focus-within:ring-ring/30 flex h-11 items-center gap-2 rounded-xl border px-3 transition focus-within:ring-2",
            meta.touched && meta.error && "border-destructive",
            className
          )}
        >
          {adornment && (
            <span className="text-muted-foreground shrink-0">{adornment}</span>
          )}
          <input
            {...field}
            {...props}
            id={name}
            type={isPassword && showPassword ? "text" : type}
            required={required}
            aria-invalid={Boolean(meta.touched && meta.error)}
            aria-describedby={
              meta.touched && meta.error ? `${name}-error` : undefined
            }
            className="placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent text-sm outline-none"
            onChange={(event) => {
              if (type === "number" && !/^\d*$/.test(event.target.value))
                return;
              field.onChange(event);
              onValueChange?.(event.target.value);
            }}
          />
          {isPassword ? (
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground shrink-0"
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden />
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
              <span className="sr-only">
                {showPassword ? "Hide password" : "Show password"}
              </span>
            </button>
          ) : (
            endAdornment
          )}
        </div>
      )}
    </FormFieldWrapper>
  );
}
