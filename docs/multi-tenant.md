# Multi-Tenant Applications

The template is a single Next.js application by default. Its routes live in
`app/` at the repository root and the ordinary commands need no configuration:

```bash
npm run dev
npm run build
npm run start
```

Multi-tenant mode lets one repository produce several independent applications
from one source tree. Each is a **tenant**: its own routes, its own build, its
own deployment target, sharing whatever it does not override.

## Choose the correct boundary

Reach for tenants last. Most requirements that look like several applications
are better served inside one.

| Requirement                                                   | Approach                                                                |
| ------------------------------------------------------------- | ----------------------------------------------------------------------- |
| One deployment changes by the authenticated user's role       | Keep one app and select or authorize the role on the server per request |
| Deployments share routes but vary mostly by branding or flags | Consider a build-time edition configuration inside one app              |
| Deployments have independent or overlapping route trees       | Use the tenants described here                                          |

Selecting a build is not authorization. Every application and every backend
endpoint must still enforce the authenticated user's permissions on the server.

## Two modes

| Mode          | Route source       | Selected when               |
| ------------- | ------------------ | --------------------------- |
| Single tenant | `app/` at the root | `app/` exists               |
| Multi-tenant  | `apps/<tenant>/`   | `apps/` holds named tenants |

When both exist the single-tenant application wins by default and a tenant is
selected explicitly, so adopting tenants never changes what `npm run dev` does
until you decide it should.

## Layout

Shared route files sit directly in `apps/`. Each tenant is a subdirectory.

```text
apps/
  api/health/             Shared Route Handlers, inherited by every tenant
  layout.tsx              Shared root layout
  admin/                  Tenant
    globals.css           Its own styling
    page.tsx
  customer/               Tenant
    page.tsx
```

A directory inside `apps/` is a tenant **only if it is named in
`tenants.config.mjs`**. Everything else there is shared content.

That exclusion applies only to the top level of `apps/`. A tenant can still own
a route segment named after another tenant. What you cannot have is a _shared_
route segment whose name is a tenant name, because that directory is already
the tenant.

## Inheritance

A tenant sees the merge of the shared tree and its own, with its own winning.
The rule applies at every level:

| Situation                                | Result                               |
| ---------------------------------------- | ------------------------------------ |
| Path only in `apps/`                     | Inherited                            |
| Path only in the tenant                  | The tenant's                         |
| Directory in both                        | Merged, and the rule recurses inside |
| File in both, or a file against a folder | The tenant's                         |

So a tenant that adds `apps/admin/api/health/route.ts` replaces just that
handler and still inherits every sibling under `apps/api/`. Overriding is per
file, not per subtree.

To replace a directory outright instead of merging into it, put an empty
`.override` file in the tenant's copy. Nothing below that point is inherited.

## Selecting a tenant

```bash
npm run apps                      # list applications and show the default
APP_VARIANT=admin npm run dev
APP_VARIANT=admin npm run build
APP_VARIANT=admin npm run deploy
```

With no `APP_VARIANT`, the runner picks the single-tenant application if `app/`
exists, then the tenant marked `default`, then the only tenant if there is just
one. Otherwise it stops and lists what is available.

## What you never write

A tenant directory holds route files and nothing else. Its build configuration
is generated:

| File                  | Where it comes from                             |
| --------------------- | ----------------------------------------------- |
| `next.config.ts`      | `config/next-app.ts`, options from the manifest |
| `tsconfig.json`       | Extends the root, re-points `@/*`               |
| `wrangler.jsonc`      | The root's, with the tenant's Worker name       |
| `open-next.config.ts` | Re-exports the root's                           |
| `package.json`        | Not needed. Tenants share the root's            |
| `postcss.config.mjs`  | Not needed. The root config already applies     |

The last two are worth stating plainly, because duplicating them is the obvious
move and it is wasted work. PostCSS resolves from the repository root by default
under Turbopack, so the root configuration already covers every tenant's
stylesheets; give a tenant its own only to change its transforms, and enable
`experimental.turbopackLocalPostcssConfig` when you do. A manifest is only
needed by an application that declares dependencies the root does not.

Per-tenant settings live in one place, `tenants.config.mjs`:

```js
export const tenants = {
  admin: { noindex: true, worker: "acme-admin" },
  customer: { default: true },
};
```

`noindex` sends `X-Robots-Tag: noindex, nofollow` on every response, for
internal surfaces that must never be indexed. `worker` is the Cloudflare Worker
name; omit it and the tenant gets `<root worker>-<tenant>`. Every tenant ends up
with a distinct name, because a tenant without its own Worker configuration
would resolve the repository's and publish over the root application.

## How it works

Next.js resolves both its configuration and its route tree from a single
directory, and only ever looks for routes in `app/` or `src/app/`. No CLI flag
or configuration option separates the two. A tenant directory therefore cannot
itself be a Next project.

So the runner generates one. `.tenants/<name>/` is a real Next project whose
`app/` is the merged view of the shared route files and the tenant's own,
assembled as symlinks rather than copies so edits reach the running dev server.
The repository directories listed in `sharedRootDirectories` are linked in
beside it, which is why `@/components/ui/button` resolves as it always has.

`.tenants/` is generated and gitignored. Delete it freely; the next command
rebuilds it. Never edit it.

Two behaviours shaped the implementation, both established by testing rather
than assumption. Change them at your peril:

- **Only files are linked, never directories.** A symlinked route directory
  builds correctly but is invisible to the dev server's watcher, so a route
  behind one returns 404 under `next dev` while working in production.
- **A route added after startup is not registered.** Next picks up new routes in
  an ordinary project but not in a generated one, so the runner restarts the dev
  server when the tree's shape changes.

## Development

`npm run dev` watches `apps/` and keeps the generated tree in step.

Editing a file needs nothing: the link already points at it and the change hot
reloads normally. Adding, removing, or renaming a route changes the tree's
shape, and the dev server restarts itself. Nothing else restarts it.

## Deployment

Each tenant is a separate deployment with its own Worker name, domain, bindings,
and secrets. One command produces one application, and building one tenant never
builds another.

Use one CI job per tenant so failures and artifacts stay isolated:

```text
APP_VARIANT=admin    npm run check
APP_VARIANT=customer npm run check
```

## Adopting tenants

1. Move `app/` into `apps/<name>/`, dropping the `app` level: what was
   `app/page.tsx` becomes `apps/<name>/page.tsx`. Route files every tenant
   shares go directly in `apps/` instead.
2. Add an entry to `tenants.config.mjs` for each tenant.
3. Verify each one with `APP_VARIANT=<name> npm run check`.

Keeping `app/` at the root is also fine. It stays the default application, and
tenants are then additions rather than a migration.

## Sharing more than routes

Route files are shared through `apps/`. Everything else is shared the ordinary
way, through the repository's own directories, which every tenant resolves under
`@/`.

Move code into a workspace package under `packages/` only when a tenant needs a
genuinely independent version of it. Packages must preserve the repository's
boundaries: interactive exports declare `"use client"` at the narrowest
boundary, server-only exports use an explicit `server/` entry point and are
never re-exported from a client-facing barrel, and feature data keeps flowing
component to hook to service to network.
