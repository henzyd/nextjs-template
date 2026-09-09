# Repository Guide

Read the relevant files under `docs/` before changing architecture or adding a
feature. This repository uses Next.js 16; consult the matching guides under
`node_modules/next/dist/docs/` before relying on older framework conventions.

## Required conventions

- Pages and layouts are Server Components unless they require interactivity.
- Keep `page.tsx` files as composition points. Put route-only UI in a colocated
  `_sections/` directory.
- Routes live in `app/` for a single application. Under multi-tenant mode they
  live in `apps/`: shared ones at its root, tenant-specific ones under
  `apps/<tenant>/`. Never edit `.tenants/`, which is generated.
- Keep the data path as component → hook → service → network.
- Use flat feature modules: `api.ts`, `hooks.ts`, `types.ts`, `constants.ts`,
  optional `schemas.ts`/`demo.ts`, and an explicit `server/` boundary.
- Use keys created in `lib/utils/query-keys.ts`.
- Server prefetching uses `getQueryClient()` and `HydrationBoundary`; client
  mutations use `useQueryClient()`.
- Client code must never persist access tokens or read the auth credential.
- Use Formik with centralized Yup schemas for application forms.
- Use semantic theme classes and existing primitives; do not hardcode colors.
- Keep generic demo mechanics in `lib/utils/demo.ts` and feature fixtures beside
  their owning feature. Demo and live service contracts must match.
- Run `npm run check` before handing off a change.

Do not commit secrets, generated output, or machine-specific configuration.
