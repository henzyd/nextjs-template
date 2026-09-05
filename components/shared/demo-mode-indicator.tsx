import { Badge } from "@/components/ui/badge";
import { isDemoMode } from "@/lib/utils/demo";

export function DemoModeIndicator() {
  if (!isDemoMode()) return null;

  return (
    <Badge
      variant="secondary"
      className="fixed right-4 bottom-4 z-50 shadow-sm"
      aria-label="Demo mode is active"
    >
      Demo mode
    </Badge>
  );
}
