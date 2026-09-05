/**
 * Build targets for the optional multi-app workspace mode.
 *
 * Keep `default` pointed at the repository root so the template behaves like a
 * normal single Next.js application until another app is deliberately added.
 */
export const appVariants = {
  default: ".",
  // admin: "apps/admin",
  // customer: "apps/customer",
};
