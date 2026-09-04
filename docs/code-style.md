# Code Style

## TypeScript and imports

Strict mode is required. Type request DTOs, responses, query results, and error
boundaries; avoid `any`. Use the `@/*` alias across directory boundaries.

## Components and routes

- Default to Server Components.
- Add `"use client"` only for interactive or browser-dependent code.
- Keep pages short and place route-only UI in `_sections/`.
- Move shared UI into `components/` and domain behavior into `features/`.
- Reuse `components/ui` before adding a primitive. Prefer the configured
  shadcn CLI and its Radix composition conventions.
- Use Lucide for interface icons.

## Data and forms

Keep the component → hook → service → network direction. Use centralized query
keys and forward abort signals. Mutations own invalidation or optimistic cache
logic. Use Formik with schemas from `features/<feature>/schemas`; use
`FormField` for standard inputs so labels, adornments, required state, and
errors remain accessible and consistent.

## Styling

Tailwind v4 reads semantic variables from `app/globals.css`. Prefer
`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`,
`bg-primary`, `text-destructive`, `border-border`, and `ring-ring`. Update a
token when the new application needs a repeated color. Do not embed identity
colors in components.

## Formatting and comments

Prettier uses an 80-column width and sorts Tailwind classes. Run
`npm run format` only on intentional changes. Comments should explain a
security property, lifecycle constraint, concurrency decision, framework
boundary, or non-obvious edge case; they should not narrate straightforward
code.
