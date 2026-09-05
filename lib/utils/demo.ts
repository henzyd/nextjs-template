const DEFAULT_DEMO_DELAY_MS = 350;

export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

export function demoDelay(ms = DEFAULT_DEMO_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
}
