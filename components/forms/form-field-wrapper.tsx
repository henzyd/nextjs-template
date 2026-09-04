"use client";

import type { ReactNode } from "react";
import { Field, type FieldConfig, type FieldProps } from "formik";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/helpers";

export interface FieldWrapperProps extends Omit<FieldConfig, "name"> {
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  required?: boolean;
  hideAsterisk?: boolean;
  wrapperClassName?: string;
  children: (fieldProps: FieldProps) => ReactNode;
}

export function FormFieldWrapper({
  children,
  description,
  hideAsterisk = false,
  label,
  name,
  required,
  wrapperClassName,
  ...fieldConfig
}: FieldWrapperProps) {
  return (
    <Field name={name} {...fieldConfig}>
      {(fieldProps: FieldProps) => {
        const error = fieldProps.meta.touched
          ? fieldProps.meta.error
          : undefined;

        return (
          <div className={cn("space-y-2", wrapperClassName)}>
            {label && (
              <Label htmlFor={name}>
                {label}
                {required && !hideAsterisk && (
                  <span className="text-destructive ml-0.5" aria-hidden>
                    *
                  </span>
                )}
              </Label>
            )}
            {children(fieldProps)}
            {description && !error && (
              <p className="text-muted-foreground text-xs">{description}</p>
            )}
            {error && (
              <p
                id={`${name}-error`}
                className="text-destructive text-xs font-medium"
              >
                {error}
              </p>
            )}
          </div>
        );
      }}
    </Field>
  );
}
