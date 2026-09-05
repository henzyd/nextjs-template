"use client";

import type { ReactNode } from "react";
import { FormFieldWrapper } from "@/components/forms/form-field-wrapper";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SelectFieldProps {
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  placeholder?: string;
  children: ReactNode;
  disabled?: boolean;
  required?: boolean;
  hideAsterisk?: boolean;
  wrapperClassName?: string;
  triggerClassName?: string;
  onValueChange?: (value: string) => void;
}

export function SelectField({
  children,
  description,
  disabled,
  hideAsterisk,
  label,
  name,
  onValueChange,
  placeholder,
  required,
  triggerClassName,
  wrapperClassName,
}: SelectFieldProps) {
  return (
    <FormFieldWrapper
      name={name}
      label={label}
      description={description}
      required={required}
      hideAsterisk={hideAsterisk}
      wrapperClassName={wrapperClassName}
    >
      {({ controlId, describedBy, field, form, invalid }) => (
        <Select
          name={name}
          value={field.value || undefined}
          disabled={disabled}
          onValueChange={(value) => {
            void form.setFieldValue(name, value);
            onValueChange?.(value);
          }}
          onOpenChange={(open) => {
            if (!open) void form.setFieldTouched(name, true, false);
          }}
        >
          <SelectTrigger
            id={controlId}
            className={triggerClassName}
            aria-invalid={invalid || undefined}
            aria-required={required || undefined}
            aria-describedby={describedBy}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>{children}</SelectContent>
        </Select>
      )}
    </FormFieldWrapper>
  );
}

export default SelectField;
