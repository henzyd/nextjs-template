# Setup and Deployment

## Local setup

Requires Node.js 20.9 or newer and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Environment boundary

| Variable                          | Visibility  | Purpose                                         |
| --------------------------------- | ----------- | ----------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`        | Browser     | Base URL for application service requests       |
| `NEXT_PUBLIC_DEMO_MODE`           | Browser     | Enables isolated synthetic adapters when `true` |
| `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED` | Browser     | Shows OAuth controls when live and `true`       |
| `API_BASE_URL`                    | Server only | Backend used by auth Route Handlers             |
| `APP_URL`                         | Server only | Canonical base for OAuth redirects              |
| `AUTH_COOKIE_NAME`                | Server only | Optional HTTP-only cookie-name override         |

Demo mode defaults to disabled. Use it only for development or product demos; it
is not a security mechanism. Production examples should explicitly set it to
`false`. A public variable is visible to every visitor, so never place secrets or
long-lived credentials behind `NEXT_PUBLIC_`.

Next uses `process.env` and statically inlines referenced `NEXT_PUBLIC_` values in
browser bundles. Do not add `import.meta.env`, Vite prefixes, route-selection env
values, React Router loaders, or Vite plugins.

## Additional configuration when adopting the template

These choices are intentionally left for the application created from this
template. Complete the applicable items before the first production release.

| Area                   | Required setup                                                                                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Application identity   | Rename the package, replace visible `Application` placeholders, update root metadata, and add the final favicon/logo.                                      |
| API contract           | Set the browser and server API base URLs, then reconcile endpoint paths, request DTOs, response envelopes, and error shapes with the real backend.         |
| Authentication         | Choose a unique server-only cookie name, confirm refresh-token rotation and revocation behavior, and keep access tokens memory-only.                       |
| OAuth                  | Configure the backend provider, callback URL, allowed origins, and server secrets before enabling `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED`.                       |
| Demo behavior          | Decide whether demo mode is needed, keep it disabled in production, and add only deterministic feature-local fixtures implementing live service contracts. |
| Design system          | Customize light/dark semantic tokens rather than component colors, then add or remove primitives according to the application requirements.                |
| Query behavior         | Add feature keys through `createQueryKeys`, select appropriate stale times, and decide which first-paint queries need server prefetch and hydration.       |
| Deployment             | Replace the Worker name and review the Cloudflare compatibility settings, or remove OpenNext/Wrangler when deploying elsewhere.                            |
| Secrets and operations | Store secrets in the deployment platform, configure monitoring and CI protections, and never commit production values to an env file.                      |

After making these choices, run `npm install` to synchronize the lockfile and
complete the verification commands below.

## Checks

```bash
npm run format
npm run format:check
npm run lint
npm run typecheck
npm run build
npm run check
```

CI uses `npm ci`, so regenerate `package-lock.json` whenever dependencies change.

## Cloudflare

OpenNext support is optional. Replace the Worker name, review the compatibility
date and flags, and configure environment values in Cloudflare. `next build` does
not create the `.open-next/worker.js` consumed by Wrangler. Deployment commands
must be run only as an intentional release action.
