# Architecture

## Application topology

The repository is one root Next.js application by default. The optional
multi-app mode adds independent projects under `apps/` and reusable npm workspace
packages under `packages/`. `app-variants.config.mjs` selects exactly one project
for development, type checking, building, serving, previewing, or deployment.

Each application owns its filesystem route tree and application composition.
Only genuinely reusable UI, features, services, hooks, and utilities belong in
workspace packages. `APP_VARIANT` is a build/deployment selector, not a user-role
or authorization mechanism. See [Optional Multi-App Workspace](multi-app.md).

## Runtime boundaries

The App Router owns routes, layouts, metadata, and Route Handlers. Pages and
layouts stay as Server Components by default. Interactive route UI belongs in
the route's `_sections/` directory and marks the narrowest required client
boundary. Reusable code lives outside `app/`.

`app/layout.tsx` uses `next/font`, static metadata, and one client composition
boundary. Provider order is intentional:

1. theme provider;
2. browser QueryClient provider;
3. session bootstrap and auth state;
4. auth gate;
5. tooltip provider and application content;
6. offline/demo indicators and toasts;
7. development-only React Query tools.

Provider clients and stores are stable across renders. Query Devtools are loaded
only in development.

## Feature and data boundaries

Feature modules use a predictable flat shape:

- `api.ts`: typed static service methods, endpoints, HTTP, and response unwrapping;
- `hooks.ts`: queries, mutations, cache behavior, cancellation, and notifications;
- `types.ts`: DTOs, envelopes, and domain types;
- `constants.ts`: feature constants and endpoints;
- `schemas.ts`: centralized Yup schemas;
- `demo.ts`: optional deterministic feature adapter;
- `server/`: server-only Next.js helpers.

External application data always follows:

```text
component → feature hook → feature service → HTTP client → backend
```

Route Handlers are the deliberate exception for server credential bridging.
Services never own React state, navigation, toasts, or cache invalidation. Query
functions forward their abort signal. Demo branches live at the service boundary,
so components and hooks do not branch between live and demo modes.

## Query cache lifecycle

`createQueryKeys(entity)` returns distinct `all`, `list(params)`, and `detail(id)`
shapes. Features extend the centralized `QUERY_KEYS` object rather than writing
arrays inline.

`getQueryClient()` creates a fresh cache for every server request and one stable
singleton in the browser. Server Components may prefetch with that helper, then
pass `dehydrate(queryClient)` to `HydrationBoundary`. Client mutations obtain the
cache with `useQueryClient()`.

Invalidate the narrowest affected key. Optimistic mutations should cancel
matching queries, snapshot prior data, apply the temporary value, roll it back on
error, and invalidate on settle. TanStack Query's browser stale time is separate
from the Next.js server cache lifecycle.

## HTTP and errors

`lib/config/axios.ts` creates public and authenticated clients with a 15-second
timeout. Network failures and eligible `5xx` responses retry once with exponential
delay; cancellations, authentication failures, and ordinary `4xx` responses do
not retry. The private client attaches only the in-memory access token and joins
one refresh request when concurrent calls receive `401`.

Common `message`, `detail`, `error`, `non_field_errors`, and `nonFieldErrors`
payloads are normalized by the shared error helpers. Hooks decide which failures
need feature-specific notifications.

## Adding a feature

1. Add its explicit types and constants.
2. Add static service methods in `api.ts`, including abort-signal forwarding.
3. Extend `QUERY_KEYS` with the shared factory.
4. Add client hooks in `hooks.ts` with cache and error behavior.
5. Add optional schemas and a feature-local demo adapter.
6. Build from `components/ui` → `components/forms` or `components/shared` → route
   `_sections`.
7. Compose a thin Server Component page and add hydration only when first paint
   benefits from it.
