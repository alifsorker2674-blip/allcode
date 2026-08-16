# rules.md — Coding Standards & Development Rules

## Coding Standards
- Prefer small, focused, reusable components over large monolithic pages.
- Keep business logic (API calls, data shaping) out of JSX — put it in hooks or lib functions.
- No premature abstraction — duplicate a small snippet twice before extracting a shared component/hook.
- TypeScript everywhere; avoid `any`. Type API responses explicitly (define types alongside the API call, e.g. `lib/api/domains.ts` + `types.ts`).

## Naming Conventions
- **Components:** `PascalCase` (e.g. `DomainSearchBar.tsx`).
- **Files (non-component):** `camelCase` for utils/hooks (`useAuth.ts`, `formatPrice.ts`).
- **Folders:** `kebab-case` for route segments (`app/domain-search/`), matching Next.js App Router conventions.
- **Variables/functions:** `camelCase`. **Types/interfaces:** `PascalCase`.
- **Env vars:** `SCREAMING_SNAKE_CASE`, prefixed `NEXT_PUBLIC_` only when the value is safe to expose client-side.

## File Organization
- Route-specific UI lives under its `app/` route segment.
- Shared UI components live in a top-level `components/` folder (create when the second reusable component appears — don't scaffold empty folders speculatively).
- API client functions live in `lib/api/` (create when the first real API call is wired up).

## Component Structure
- One component per file, default export matching the filename.
- Co-locate a component's own styles/types with it; only lift to a shared location once reused elsewhere.

## Preferred Libraries
- Styling: Tailwind CSS 4 (already installed) — use utility classes over custom CSS unless a pattern repeats often enough to warrant a component class.
- Validation: mirror the backend's choice (Zod) for any client-side form validation, for consistency.
- Fonts: Geist (already wired up in `app/layout.tsx`) — keep unless brand assets dictate otherwise.

## Libraries to Avoid
- Do not add a global state management library (Redux, Zustand, etc.) until there's a concrete cross-page state need that React Server Components + URL state + local state can't handle.
- Do not add a CSS-in-JS library — Tailwind is already the styling approach.
- Do not add a second HTTP client library (e.g. axios) without discussion — prefer `fetch` unless a real need (interceptors, retries) justifies it.

## Error Handling
- **API errors:** every API call site must handle non-2xx responses explicitly — surface a user-facing message, never fail silently.
- **Validation:** validate on the client for UX (immediate feedback), but never trust it as the security boundary — the backend already validates with Zod.
- **Exceptions:** use error boundaries for route-level failures in the App Router; don't let one broken card crash a whole page.
- **Logging:** client-side, log unexpected errors to the console in development only; do not ship a logging service until one is chosen.

## Security Rules
- Never store the JWT access token in `localStorage` — keep it in memory/context; rely on the backend's httpOnly refresh cookie for persistence across reloads.
- Never put secrets or backend-only credentials in `NEXT_PUBLIC_` env vars — those are shipped to the browser.
- Sanitize/escape any user-generated content before rendering (domain names, DNS values, etc.) — don't use `dangerouslySetInnerHTML` on user input.
- All checkout/payment-related code must go through the actual payment provider's SDK/flow once chosen — never hand-roll card handling.

## Performance Guidelines
- Use Next.js `<Image>` for any real images (once brand assets are added).
- Prefer Server Components for data-fetching pages; only mark a component `"use client"` when it needs interactivity/state.
- Paginate or virtualize any list that could grow unbounded (domains, hosting instances).

## Testing Guidelines
- No test framework is configured yet in this repo. Before adding features that need coverage, ask which framework to standardize on (the backend already uses Jest + Supertest — consider matching for consistency, e.g. Jest + React Testing Library for unit tests, Playwright for e2e).

## Git Rules
- **Branch naming:** `feature/<short-description>`, `fix/<short-description>`.
- **Commit messages:** Conventional Commits (matches the backend repo's convention) — e.g. `feat: add domain search bar`, `fix: correct token refresh race condition`.
- **Pull requests:** describe what changed and why; link to the relevant `docs/PRD.md` feature if applicable.

## AI Development Rules
- Never rewrite working code unless requested.
- Preserve existing architecture and folder structure described in `architecture.md`.
- Reuse existing components whenever possible before creating new ones.
- Follow the established coding style in this file.
- Ask before making breaking changes (API contract assumptions, auth flow changes, routing structure changes).
- Never introduce unnecessary dependencies — check `rules.md` "Libraries to Avoid" first.
- **Never guess backend API contracts.** Domain/hosting purchase endpoints are not yet documented (see `architecture.md`) — ask the user/backend before building against assumed endpoints.
- This project pins Next.js 16.2.11 with breaking changes vs. older conventions — consult `node_modules/next/dist/docs/` before writing App Router code that relies on prior Next.js knowledge.
- Do not add brand colors/logo assets speculatively — `design.md` currently uses a default theme until real brand assets are provided.
