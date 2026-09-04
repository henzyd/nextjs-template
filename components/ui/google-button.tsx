"use client";

import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GoogleButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export function GoogleButton({ isLoading, onClick }: GoogleButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      isLoading={isLoading}
      onClick={onClick}
    >
      <Globe className="size-4" aria-hidden />
      Continue with Google
    </Button>
  );
}
