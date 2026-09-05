"use client";

import type { ReactNode } from "react";
import { FormFieldWrapper } from "@/components/forms/form-field-wrapper";
import { Textarea, type TextareaProps } from "@/components/ui/textarea";

export type TextareaFieldProps = Omit<TextareaProps, "name"> & {
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  hideAsterisk?: boolean;
  wrapperClassName?: string;
  showCharacterCount?: boolean;
};

export function TextareaField({
  description,
  hideAsterisk,
  label,
  maxLength,
  name,
  onBlur,
  onChange,
  required,
  showCharacterCount = Boolean(maxLength),
  wrapperClassName,
  ...props
}: TextareaFieldProps) {
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
        <div className="space-y-1">
          <Textarea
            {...field}
            {...props}
            id={controlId}
            maxLength={maxLength}
            required={required}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            onBlur={(event) => {
              field.onBlur(event);
              onBlur?.(event);
            }}
            onChange={(event) => {
              field.onChange(event);
              onChange?.(event);
            }}
          />
          {showCharacterCount && maxLength && (
            <p
              className="text-muted-foreground text-right text-xs"
              aria-live="polite"
            >
              {String(field.value ?? "").length}/{maxLength}
            </p>
          )}
        </div>
      )}
    </FormFieldWrapper>
  );
}

export default TextareaField;
