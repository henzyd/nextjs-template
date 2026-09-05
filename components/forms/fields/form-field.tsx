"use client";

import { useState, type ReactNode } from "react";
import { Eye, EyeOff, Search } from "lucide-react";
import { FormFieldWrapper } from "@/components/forms/form-field-wrapper";
import { Input, type InputProps } from "@/components/ui/input";

export type FormFieldProps = Omit<InputProps, "name"> & {
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  hideAsterisk?: boolean;
  wrapperClassName?: string;
  onValueChange?: (value: string) => void;
};

export function FormField({
  description,
  endAdornment,
  hideAsterisk,
  label,
  name,
  onBlur,
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
      {({ controlId, describedBy, field, invalid }) => (
        <Input
          {...field}
          {...props}
          id={controlId}
          type={isPassword && showPassword ? "text" : type}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          startAdornment={adornment}
          endAdornment={
            isPassword ? (
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
            )
          }
          onBlur={(event) => {
            field.onBlur(event);
            onBlur?.(event);
          }}
          onChange={(event) => {
            field.onChange(event);
            onValueChange?.(event.target.value);
          }}
        />
      )}
    </FormFieldWrapper>
  );
}

export default FormField;
