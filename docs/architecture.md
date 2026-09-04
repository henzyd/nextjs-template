# Architecture

## Rendering and routing

The App Router makes pages and layouts Server Components by default. Keep them
on the server for static markup, metadata, secret-bearing work, and initial data
loading. Add `"use client"` at the narrowest boundary that needs state, effects,
event handlers, browser APIs, Formik, or TanStack Query hooks.

Route groups organize layouts without changing URLs. A `page.tsx` should stay
small and compose route-only components from its adjacent `_sections/`
directory. Move a component to `components/` when multiple routes use it.

## Provider bootstrap order

`app/layout.tsx` is a Server Component and mounts one client boundary:

1. `QueryClientProvider` establishes the browser cache.
2. `SessionProvider` performs session restoration once.
3. `AuthGateProvider` exposes a reusable sign-in gate.
4. Application content renders.
5. Sonner and development-only query tools mount beside the content.

Keeping this order lets session bootstrap populate the query cache before
authenticated consumers request the current user.

## Data boundary

External application data follows this direction:

```text
component → query or mutation hook → feature service → HTTP client → API
```

Components do not call Axios or external `fetch` directly. Services own paths,
DTOs, response normalization, and abort-signal forwarding. Hooks own cache
keys, stale times, invalidation, optimistic behavior, and user notifications.
Route Handlers may use server-side `fetch` when bridging authentication.

## QueryClient lifecycle

`getQueryClient()` returns a fresh client when invoked on the server, preventing
one request from observing another request's cache. In the browser it returns a
stable singleton. Client components access that instance through
`useQueryClient`; they do not import a client from the provider module.

For data needed at first paint, a Server Component creates its request-local
client, calls `prefetchQuery` or `fetchQuery`, and passes `dehydrate(client)` to
`HydrationBoundary`. The client hook uses the same centralized key and reads the
hydrated result. For browser-only data, call the service from `useQuery` or
`useInfiniteQuery` and forward the query function's abort signal.

All keys originate in `lib/utils/query-keys.ts`. Extend the factory by feature:

```ts
records: {
  all: ["records"] as const,
  list: (filters: Record<string, unknown>) =>
    ["records", "list", filters] as const,
  detail: (id: string) => ["records", "detail", id] as const,
}
```

Invalidate the narrowest key that represents changed data. An optimistic
mutation should cancel matching queries, snapshot prior data, apply the
temporary cache value, restore the snapshot on error, and invalidate on settle.
Do not add demonstration mutations to the empty starter.

## HTTP and errors

`lib/config/axios.ts` creates distinct public and authenticated clients with a
15-second timeout. Both retry a network failure or server error once with
exponential delay; neither retries ordinary client errors. The authenticated
client also attaches the in-memory bearer value, marks a request after its
first auth retry, and joins one shared refresh promise when concurrent requests
receive `401` responses.

Services can pass an Axios request config containing `signal`. Hooks send
failures to `handleApiError`, optionally overriding individual status handlers.
Sonner wrappers keep notification calls consistent.

## Adding a feature

1. Add explicit DTO and response types under `features/<feature>/`.
2. Add a service module containing all network calls.
3. Extend the centralized query-key factory.
4. Add query and mutation hooks with cancellation, cache, and error behavior.
5. Build reusable UI under `components/`; keep one-route UI in `_sections/`.
6. Compose the route in a thin Server Component page.
7. Add server prefetch and hydration only when first paint or metadata needs it.
8. Document new environment values and run the complete check suite.
