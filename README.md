# Next.js Application Template

A neutral Next.js 16 foundation for applications that need typed data access,
forms, secure session restoration, reusable UI primitives, and optional
Cloudflare Workers deployment.

## Stack

- Next.js 16 App Router, React 19, and strict TypeScript
- Tailwind CSS v4 with semantic theme variables
- TanStack Query v5 for server state and hydration
- Axios with bounded retries, bearer injection, and single-flight refresh
- Formik and Yup for forms and validation
- shadcn-style Radix primitives, Lucide icons, and Sonner notifications
- OpenNext and Wrangler for optional Cloudflare deployment

## Start locally

Requires Node.js 20.9 or newer and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

The default development URL is `http://localhost:3000`.

## Commands

| Command                | Purpose                                          |
| ---------------------- | ------------------------------------------------ |
| `npm run dev`          | Start the development server                     |
| `npm run build`        | Create a Next.js build                           |
| `npm run start`        | Serve a completed build                          |
| `npm run format`       | Format authored files                            |
| `npm run format:check` | Check formatting without writing                 |
| `npm run lint`         | Run ESLint                                       |
| `npm run typecheck`    | Run TypeScript without emitting                  |
| `npm run check`        | Run formatting, lint, types, and build           |
| `npm run preview`      | Build and preview through OpenNext               |
| `npm run deploy`       | Build and deploy through OpenNext                |
| `npm run upload`       | Upload a Worker version without shifting traffic |

See [setup](docs/setup.md), [architecture](docs/architecture.md),
[authentication](docs/authentication.md), [folder responsibilities](docs/folder-structure.md),
and [code conventions](docs/code-style.md).

## Start a new project from this template

- Change the package name and version in `package.json`.
- Replace application metadata and visible placeholder names.
- Add a favicon or logo only when the new identity is defined.
- Adjust semantic theme variables in `app/globals.css`.
- Configure public and server-only API URLs.
- Choose an auth cookie name; keep it server-only.
- Reconcile every auth request and response with the external backend contract.
- Enable and configure Google OAuth only when the backend flow exists.
- Replace the Worker name and review the Cloudflare compatibility date.
- Remove optional dependencies and primitives the application will not use.
- Run `npm install` to refresh the lockfile, then run `npm run check`.

Auth screens compile without a backend, but successful authentication requires
the external endpoints documented in [authentication](docs/authentication.md).
