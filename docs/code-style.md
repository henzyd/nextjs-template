# Code Style

## TypeScript and imports

Strict mode is required. Type DTOs, responses, query results, errors, and generic
component contracts; avoid `any`. Use `@/*` across directory boundaries. Keep
browser-only calls behind client modules or runtime guards.

## Components and routes

- Default to Server Components and serializable props.
- Add `"use client"` only for hooks, context, handlers, Formik, Radix interaction,
  or browser APIs.
- Keep pages short and route-only UI in `_sections/`.
- Reuse `components/ui` before adding a primitive. Add shadcn components with the
  configured RSC aliases and Lucide icons.
- Use `components/shared` only for composed, cross-route, domain-neutral UI.
- Preserve labels, descriptions, error IDs, focus behavior, keyboard behavior,
  and screen-reader text.

## Data and forms

Keep component → hook → service → network direction. Hooks own query keys,
invalidation, optimistic state, and notifications. Services own transport and
normalization and forward abort signals for reads.

Use Formik fields from `components/forms/fields` and schemas from the feature's
`schemas.ts`. `FormField`, `TextareaField`, `SelectField`, and
`AutocompleteField` share `FormFieldWrapper` for accessible labels, descriptions,
required state, and errors.

## Styling and formatting

Use semantic utilities such as `bg-background`, `bg-card`, `text-foreground`,
`text-muted-foreground`, `bg-primary`, `text-success`, `text-destructive`,
`border-border`, and `ring-ring`. Customize repeated colors in `app/globals.css`,
including both light and dark values. Do not hardcode identity colors in reusable
components.

Prettier uses an 80-column width and sorts Tailwind classes. Comments should
explain security, runtime boundaries, concurrency, or non-obvious edge cases.
