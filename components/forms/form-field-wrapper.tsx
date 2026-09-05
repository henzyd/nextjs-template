"use client";

import type { ReactNode } from "react";
import { Field, type FieldConfig, type FieldProps } from "formik";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/helpers";

export interface FieldWrapperProps extends Omit<
  FieldConfig,
  "name" | "children"
> {
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  required?: boolean;
  hideAsterisk?: boolean;
  wrapperClassName?: string;
  children: (fieldProps: FormFieldRenderProps) => ReactNode;
}

export interface FormFieldRenderProps extends FieldProps {
  controlId: string;
  describedBy?: string;
  errorId: string;
  invalid: boolean;
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
        const error =
          fieldProps.meta.touched && typeof fieldProps.meta.error === "string"
            ? fieldProps.meta.error
            : undefined;
        const descriptionId = `${name}-description`;
        const errorId = `${name}-error`;
        const describedBy =
          [description ? descriptionId : null, error ? errorId : null]
            .filter(Boolean)
            .join(" ") || undefined;

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
            {children({
              ...fieldProps,
              controlId: name,
              describedBy,
              errorId,
              invalid: Boolean(error),
            })}
            {description && !error && (
              <p id={descriptionId} className="text-muted-foreground text-xs">
                {description}
              </p>
            )}
            {error && (
              <p
                id={errorId}
                role="alert"
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
