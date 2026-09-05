"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils/helpers";

interface PasswordRequirementsProps {
  password?: string;
  isVisible?: boolean;
}

export function PasswordRequirements({
  isVisible = false,
  password = "",
}: PasswordRequirementsProps) {
  if (!isVisible) return null;

  const rules = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
    { label: "One special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <ul className="space-y-1.5 text-xs">
      {rules.map((rule) => (
        <li
          key={rule.label}
          className={cn(
            "text-muted-foreground flex items-center gap-2",
            rule.met && "text-success"
          )}
        >
          <Check className={cn("size-3.5", !rule.met && "opacity-30")} />
          {rule.label}
        </li>
      ))}
    </ul>
  );
}
