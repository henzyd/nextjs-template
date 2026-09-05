# Folder Structure

```text
app/                         App Router pages, layouts, and Route Handlers
  (auth)/                    Auth routes with colocated interactive sections
  api/auth/                  Server credential bridge
  layout.tsx                 Root Server Component
  providers.tsx              Small global client composition boundary
components/
  ui/                        Generic shadcn/Radix primitives
  forms/fields/              Reusable Formik fields and barrel exports
  providers/                 Individually owned client providers
  shared/                    Composed, domain-neutral cross-route components
features/auth/
  api.ts                     Client-facing typed auth service
  hooks.ts                   Auth queries, mutations, and bootstrap hook
  types.ts                   Auth DTOs and session types
  constants.ts               Auth paths and feature flags
  schemas.ts                 Centralized Yup schemas
  demo.ts                    Synthetic adapter implementing the live contract
  server/                    Server-only bridge helpers
  utils/                     Focused token, redirect, and session helpers
hooks/                       Generic cross-feature React hooks
lib/config/                  HTTP, cookies, and QueryClient configuration
lib/utils/                   Keys, demo core, errors, notifications, helpers
types/                       Shared cross-feature API types
docs/                        Architecture and operating guidance
public/                      Deliberate neutral static assets only
```

Create a route folder for each page. UI used only by that route belongs in its
`_sections/` directory. Put reusable presentation in `components/` and feature
behavior in `features/<feature>/`. Do not put reusable application modules under
`app/` merely to imitate a client-side router layout.

The component hierarchy is `ui` → `forms`/`shared` → route `_sections`. Do not
create empty directories or retain old and new feature layouts simultaneously.
