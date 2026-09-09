# Next.js Application Template

A neutral Next.js 16 foundation for applications that need typed data access,
accessible forms, secure session restoration, light/dark theming, reusable UI
primitives, an optional demo adapter, optional multi-tenant applications, and
Cloudflare Workers deployment.

## Stack

- Next.js 16 App Router, React 19, and strict TypeScript
- Tailwind CSS v4 with neutral semantic tokens and `next-themes`
- TanStack Query v5 with request-safe server hydration
- Axios with bounded retries, in-memory bearer injection, and single-flight refresh
- Formik and Yup with reusable input, textarea, select, and autocomplete fields
- shadcn-style Radix primitives, Lucide icons, and Sonner notifications
- OpenNext and Wrangler for optional Cloudflare deployment

## Start locally

Requires Node.js 20.9 or newer and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

The default development URL is `http://localhost:3000`. The template builds
without an API; successful live authentication requires the backend contract in
[authentication](docs/authentication.md). Set `NEXT_PUBLIC_DEMO_MODE=true` to
exercise the neutral auth UI without a backend.

## Commands

| Command                | Purpose                                |
| ---------------------- | -------------------------------------- |
| `npm run apps`         | List registered application variants   |
| `npm run dev`          | Start the development server           |
| `npm run build`        | Create a Next.js build                 |
| `npm run start`        | Serve a completed build                |
| `npm run format`       | Format authored files                  |
| `npm run format:check` | Check formatting without writing       |
| `npm run lint`         | Run ESLint                             |
| `npm run typecheck`    | Run TypeScript without emitting        |
| `npm run check`        | Run formatting, lint, types, and build |
| `npm run preview`      | Build and preview through OpenNext     |
| `npm run deploy`       | Build and deploy through OpenNext      |

See [setup](docs/setup.md), [architecture](docs/architecture.md),
[authentication](docs/authentication.md),
[multi-tenant applications](docs/multi-tenant.md),
[folder responsibilities](docs/folder-structure.md), and
[code conventions](docs/code-style.md).

The repository remains a conventional single application unless tenants are
adopted. After naming a tenant in `tenants.config.mjs`, select it at build time
with `APP_VARIANT=admin npm run build`.

## Customize a new application

- Replace package metadata, visible placeholder names, and Worker name.
- Adjust the semantic variables in `app/globals.css`; components should not need
  palette edits.
- Configure public and server-only API URLs and choose a server-only cookie name.
- Reconcile auth DTOs with the real backend before enabling OAuth.
- Remove unused optional primitives and deployment dependencies.
- Keep `components.json` in RSC mode when adding shadcn components.
- Run `npm install` after dependency changes, then `npm run check`.

The complete production-readiness checklist is under
[Additional configuration when adopting the template](docs/setup.md#additional-configuration-when-adopting-the-template).
