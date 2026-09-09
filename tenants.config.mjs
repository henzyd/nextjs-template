/**
 * Tenant manifest.
 *
 * The template is a single Next.js application by default: its routes live in
 * `app/` at the repository root and nothing here is needed.
 *
 * Adopt multi-tenant mode only when one repository must produce independent
 * applications with different or overlapping route trees. Then put shared route
 * files directly in `apps/`, give each application a subdirectory of `apps/`,
 * and name it below. When both `app/` and tenants exist, the single-tenant
 * application stays the default and a tenant is selected with `APP_VARIANT`.
 *
 * A directory inside `apps/` is a tenant only if it is named here. Everything
 * else in `apps/` is shared route content inherited by every tenant.
 *
 * Selecting a build is not authorization. Every application and every backend
 * endpoint must still enforce the authenticated user's permissions on the
 * server.
 */
export const tenants = {
  // admin: {
  //   /** Send `X-Robots-Tag: noindex, nofollow` on every response. */
  //   noindex: true,
  //   /** Worker name. Defaults to `<root worker>-<tenant>` when omitted. */
  //   worker: "acme-admin",
  // },
  // customer: {
  //   /** Selected when APP_VARIANT is absent. At most one tenant may set this. */
  //   default: true,
  // },
};

/**
 * Repository-root directories linked into each tenant's generated project, so
 * `@/components/...` and friends resolve the same way they do for the
 * single-tenant application. Entries that do not exist are skipped.
 */
export const sharedRootDirectories = [
  "components",
  "config",
  "features",
  "hooks",
  "lib",
  "public",
  "types",
];
