"use client";

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { FormFieldWrapper } from "@/components/forms/form-field-wrapper";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils/helpers";

export interface AutocompleteFieldProps<T> {
  name: string;
  options?: readonly T[];
  getOptionValue: (option: T) => string;
  getOptionLabel: (option: T) => string;
  renderOption?: (option: T) => ReactNode;
  label?: ReactNode;
  description?: ReactNode;
  placeholder?: string;
  loading?: boolean;
  loadingText?: string;
  emptyText?: string;
  minSearchLength?: number;
  required?: boolean;
  hideAsterisk?: boolean;
  disabled?: boolean;
  wrapperClassName?: string;
  onSearchChange?: (value: string) => void;
  onValueChange?: (value: string, option: T) => void;
}

export function AutocompleteField<T>({
  description,
  disabled,
  emptyText = "No results found",
  getOptionLabel,
  getOptionValue,
  hideAsterisk,
  label,
  loading = false,
  loadingText = "Searching…",
  minSearchLength = 2,
  name,
  onSearchChange,
  onValueChange,
  options = [],
  placeholder = "Type to search…",
  renderOption,
  required,
  wrapperClassName,
}: AutocompleteFieldProps<T>) {
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <FormFieldWrapper
      name={name}
      label={label}
      description={description}
      required={required}
      hideAsterisk={hideAsterisk}
      wrapperClassName={wrapperClassName}
    >
      {({ controlId, describedBy, field, form, invalid }) => {
        const query = String(field.value ?? "");
        const showResults = open && query.length >= minSearchLength;
        const safeActiveIndex = options.length
          ? Math.min(activeIndex, options.length - 1)
          : 0;

        const selectOption = (option: T) => {
          const value = getOptionValue(option);
          void form.setFieldValue(name, value);
          void form.setFieldTouched(name, true, false);
          onValueChange?.(value, option);
          setOpen(false);
        };

        const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
          if (!showResults || options.length === 0) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((current) => (current + 1) % options.length);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((current) =>
              current === 0 ? options.length - 1 : current - 1
            );
          } else if (event.key === "Enter") {
            event.preventDefault();
            selectOption(options[safeActiveIndex]);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        };

        return (
          <Popover open={showResults} onOpenChange={setOpen}>
            <PopoverAnchor asChild>
              <Input
                {...field}
                id={controlId}
                role="combobox"
                autoComplete="off"
                disabled={disabled}
                placeholder={placeholder}
                required={required}
                aria-expanded={showResults}
                aria-controls={listboxId}
                aria-autocomplete="list"
                aria-activedescendant={
                  showResults && options.length
                    ? `${listboxId}-${safeActiveIndex}`
                    : undefined
                }
                aria-invalid={invalid || undefined}
                aria-describedby={describedBy}
                onFocus={() => setOpen(query.length >= minSearchLength)}
                onBlur={(event) => {
                  field.onBlur(event);
                  setOpen(false);
                }}
                onKeyDown={handleKeyDown}
                onChange={(event) => {
                  field.onChange(event);
                  onSearchChange?.(event.target.value);
                  setActiveIndex(0);
                  setOpen(event.target.value.length >= minSearchLength);
                }}
              />
            </PopoverAnchor>
            <PopoverContent
              align="start"
              className="w-(--radix-popover-trigger-width) p-1"
              onOpenAutoFocus={(event) => event.preventDefault()}
              onMouseDown={(event) => event.preventDefault()}
            >
              <div
                id={listboxId}
                role="listbox"
                className="max-h-64 overflow-y-auto"
              >
                {loading ? (
                  <p className="text-muted-foreground p-3 text-center text-sm">
                    {loadingText}
                  </p>
                ) : options.length ? (
                  options.map((option, index) => (
                    <button
                      id={`${listboxId}-${index}`}
                      key={getOptionValue(option)}
                      type="button"
                      role="option"
                      aria-selected={index === safeActiveIndex}
                      className={cn(
                        "hover:bg-accent hover:text-accent-foreground w-full rounded-lg px-3 py-2 text-left text-sm",
                        index === safeActiveIndex &&
                          "bg-accent text-accent-foreground"
                      )}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => selectOption(option)}
                    >
                      {renderOption?.(option) ?? getOptionLabel(option)}
                    </button>
                  ))
                ) : (
                  <p className="text-muted-foreground p-3 text-center text-sm">
                    {emptyText}
                  </p>
                )}
              </div>
            </PopoverContent>
          </Popover>
        );
      }}
    </FormFieldWrapper>
  );
}

export default AutocompleteField;
