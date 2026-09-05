# Optional Multi-App Workspace

The template is a single Next.js application by default. Its routes remain in
the root `app/` directory, and commands work without additional configuration:

```bash
npm run dev
npm run build
npm run start
```

Adopt multi-app mode only when one repository must produce independent
applications with different or overlapping route trees. Each application gets
its own Next.js project directory and build artifact while reusable UI, feature,
service, hook, and utility code lives in workspace packages.

## Choose the correct boundary

| Requirement                                                   | Approach                                                                 |
| ------------------------------------------------------------- | ------------------------------------------------------------------------ |
| One deployment changes by the authenticated user's role       | Keep one app and select/authorize the role on the server at request time |
| Deployments share routes but vary mostly by branding or flags | Consider a build-time edition configuration inside one app               |
| Deployments have independent or overlapping route trees       | Use the multi-app workspace described here                               |

Build selection is not authorization. Every application and backend endpoint
must still enforce the authenticated user's permissions on the server.

## How application selection works

[`app-variants.config.mjs`](../app-variants.config.mjs) is the allowlist of
buildable applications. The `default` entry points at the repository root:

```js
export const appVariants = {
  default: ".",
};
```

The root commands use `APP_VARIANT` to select an entry. If it is absent, they
select `default`, preserving the single-app behavior. The selector rejects
unknown names, paths outside the repository, and directories without an `app/`
or `src/app/` route tree.

```bash
npm run apps
APP_VARIANT=admin npm run dev
APP_VARIANT=admin npm run build
APP_VARIANT=admin npm run start
```

One invocation produces one application artifact. Run a separate build for each
deployment target. Because every app writes to its own directory, their `.next`
outputs do not overwrite one another.

## Add an application

The example below adds an admin application.

### 1. Create the application workspace

Create this minimum structure:

```text
apps/admin/
  app/
    globals.css
    layout.tsx
    page.tsx
  package.json
  next.config.ts
  postcss.config.mjs
  tsconfig.json
```

Use the same pinned Next.js and React versions as the root package. Declare only
the dependencies that the application imports directly:

```json
{
  "name": "@application/admin",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "16.3.4",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5"
  }
}
```

The root package already declares `apps/*` and `packages/*` as npm workspaces,
so `npm install` creates one lockfile and normally hoists compatible dependencies.

### 2. Add app-local Next.js configuration

Each application owns its Next.js configuration. Set the tracing root to the
repository so standalone and adapter builds can include files from shared
workspace packages:

```ts
// apps/admin/next.config.ts
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname, "../.."),
};

export default nextConfig;

initOpenNextCloudflareForDev();
```

Turbopack automatically transpiles npm workspace packages used by an App Router
application. Add `transpilePackages` only when a dependency ships source that is
not handled automatically.

Use an app-local TypeScript configuration so `@/*` continues to mean files in
that application:

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": ["node_modules", ".open-next"]
}
```

The root PostCSS configuration can be reused:

```js
// apps/admin/postcss.config.mjs
export { default } from "../../postcss.config.mjs";
```

Keep pages and layouts as Server Components unless they need interactivity, and
keep each `page.tsx` as a composition point just as in the default application.

### 3. Register the application

Add the directory to `app-variants.config.mjs`:

```js
export const appVariants = {
  default: ".",
  admin: "apps/admin",
};
```

Then install and verify it:

```bash
npm install
npm run apps
APP_VARIANT=admin npm run typecheck
APP_VARIANT=admin npm run build
```

Do not silently fall back when CI supplies an invalid name. The selector fails
early so a misspelled deployment target cannot publish the default application.

## Share code between applications

Move code into a workspace package when at least two applications own the same
concept. Prefer package imports over long relative paths that cross application
roots.

```text
packages/
  ui/                    Theme, primitives, fields, and shared presentation
  features/              Feature hooks, services, DTOs, schemas, and fixtures
  core/                  Query keys, HTTP contracts, and domain-neutral helpers
```

Packages must preserve the template boundaries:

- interactive exports declare `"use client"` at the narrowest boundary;
- server-only exports use an explicit `server/` entry point and must not be
  re-exported from a client-facing barrel;
- feature data continues to flow component → hook → service → network;
- applications own route files, metadata, providers, environment adapters, and
  deployment configuration;
- shared UI uses semantic theme classes rather than application identity colors.

Give each package an explicit `package.json` name and exports map, then declare
it from every consuming application with the workspace version `"*"`. For
example, an application can declare `"@workspace/ui": "*"` and import
`@workspace/ui/button`.

Tailwind must scan shared source. In an app-local `app/globals.css`, register the
workspace source relative to that stylesheet:

```css
@import "tailwindcss";
@source "../../../packages";
```

Move common semantic tokens into an exported workspace stylesheet if multiple
apps must use the same theme foundation. Keep application-specific token values
in the consuming application's stylesheet.

## Environment variables

Set `APP_VARIANT` in the shell or CI build job. Keep it server/build-only; do not
rename it to `NEXT_PUBLIC_APP_VARIANT` merely so client components can read it.
If client UI needs application identity, validate the value on the server and
pass a small serializable configuration object through props.

Next.js loads `.env*` files relative to the selected application's project
directory. Therefore each application owns its `.env.local` and deployment
variables. Do not commit those files. Shared packages read configuration through
arguments or app-owned adapters instead of importing another application's env.

## Cloudflare deployments

The default root app keeps the existing OpenNext configuration. An additional
application that deploys to Cloudflare must also own an `open-next.config.ts` and
`wrangler.jsonc`. Give every app a unique Worker name and review its bindings,
routes, compatibility settings, and secrets.

The selector also applies to the root OpenNext commands:

```bash
APP_VARIANT=admin npm run preview
APP_VARIANT=admin npm run deploy
APP_VARIANT=admin npm run upload
APP_VARIANT=admin npm run cf-typegen
```

These are intentional deployment actions. A successful build of one variant
does not build or deploy any other variant.

## CI matrix

Use one job per registered application so failures and artifacts stay isolated:

```text
APP_VARIANT=default  npm run check
APP_VARIANT=admin    npm run check
APP_VARIANT=customer npm run check
```

Formatting and linting inspect the repository. Type checking and the Next.js
build use the selected application's project directory. Add package-level tests
for shared packages as they are introduced.
