# Repository Guide

Read the relevant files under `docs/` before changing architecture or adding a
feature. This repository uses Next.js 16; consult the matching guides under
`node_modules/next/dist/docs/` before relying on older framework conventions.

## Required conventions

- Pages and layouts are Server Components unless they require interactivity.
- Keep `page.tsx` files as composition points. Put route-only UI in a colocated
  `_sections/` directory.
- Keep the data path as component → hook → service → network.
- Use query keys from `lib/utils/query-keys.ts`.
- Server prefetching uses `getQueryClient()` and `HydrationBoundary`.
- Client code must never persist access tokens or read the auth credential.
- Use Formik with centralized Yup schemas for application forms.
- Use semantic theme classes and existing primitives; do not hardcode colors.
- Run `npm run check` before handing off a change.

Do not commit secrets, generated output, or machine-specific configuration.
