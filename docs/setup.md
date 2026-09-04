# Setup and Deployment

## Prerequisites

- Node.js 20.9 or newer
- npm

Install and prepare local environment values:

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Environment boundary

| Variable                          | Visibility  | Purpose                                         |
| --------------------------------- | ----------- | ----------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`        | Browser     | Base URL for Axios application requests         |
| `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED` | Browser     | Shows optional Google auth controls when `true` |
| `API_BASE_URL`                    | Server only | External backend used by auth Route Handlers    |
| `APP_URL`                         | Server only | Canonical base for OAuth redirects              |
| `AUTH_COOKIE_NAME`                | Server only | Optional cookie-name override                   |

Only values intentionally readable by any site visitor may use the
`NEXT_PUBLIC_` prefix. Never place secrets, backend credentials, or the
long-lived auth value in a public variable. Keep local values in `.env.local`;
only placeholder values belong in `.env.example`.

## Checks

Run the complete local gate before review:

```bash
npm run format
npm run check
```

The check command runs formatting verification, ESLint, TypeScript, and the
Next.js build. CI installs with `npm ci`, so regenerate `package-lock.json`
with npm whenever dependencies change.

## Cloudflare

OpenNext support is optional. Replace the `name` in `wrangler.jsonc`, review
the compatibility date and flags, then configure build-time and runtime
environment values in Cloudflare. Never commit account identifiers or secrets.

For local Worker parity use `npm run preview`. Use `npm run upload` for a new
version without a traffic shift, or `npm run deploy` when deployment is an
intentional, authorized action. A plain `next build` does not create the
`.open-next/worker.js` consumed by Wrangler.

## Values to customize

Before launching a real application, update package metadata, visible app
metadata, favicon/logo, theme tokens, environment URLs, auth cookie name,
backend DTOs, optional OAuth behavior, Worker name, and unused optional
dependencies.
