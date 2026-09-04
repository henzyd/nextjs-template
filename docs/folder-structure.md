# Folder Structure

```text
app/                         App Router pages, layouts, and Route Handlers
  (auth)/                    Neutral auth routes and colocated sections
  api/auth/                  Server-only credential bridge
  layout.tsx                 Root server layout
  providers.tsx              Single application-wide client boundary
components/
  forms/                     Formik field abstractions
  ui/                        Generic shadcn-style primitives
features/auth/
  hooks/                     Query, mutation, session, and gate hooks
  schemas/                   Shared Yup validation
  server/                    Server-only bridge helpers
  services/                  Typed network operations
  utils/                     Token, redirect, OAuth, and session helpers
hooks/                       Cross-feature React hooks
lib/config/                  HTTP, cookie, and QueryClient configuration
lib/utils/                   Generic helpers, keys, errors, and notifications
types/                       Shared cross-feature types
docs/                        Architecture and operating guidance
public/                      Deliberate neutral static assets only
```

Create a route folder for each new page. A component used only by that route
belongs in its `_sections/` directory. Reused presentation belongs under
`components/`. Types, services, hooks, schemas, and pure helpers owned by one
domain belong in `features/<feature>/`. Cross-cutting configuration belongs in
`lib/config`, while small generic helpers belong in `lib/utils`.

Do not create empty directories or copy Next-owned generated type files.
