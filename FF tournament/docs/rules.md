# rules.md — Coding Standards & Development Rules

These rules apply across all three apps (`royal-clans`, `admin-panel`, `server`) and must be followed by both human developers and AI tools working on this codebase.

## Coding Standards

- Write clean, readable code over clever code — optimize for the next person (or AI) reading it.
- Keep components and functions small and single-purpose; if a function does more than one thing, split it.
- Build reusable components/utilities instead of copy-pasting logic across files — but don't abstract prematurely for a case that only happens once.
- Keep business logic out of route handlers and out of UI components — logic belongs in `services/` (backend) or `lib/`/`hooks/` (frontend).
- Avoid deeply nested conditionals; prefer early returns.

## Naming Conventions

- **Variables/functions:** `camelCase` (`getUserById`, `walletBalance`).
- **React components:** `PascalCase` (`TournamentCard.tsx`, `WalletBalance.tsx`).
- **Files (non-component):** `kebab-case` (`auth.service.ts`, `tournament.controller.ts`).
- **Mongoose models:** singular `PascalCase` (`User`, `Tournament`), collection name pluralized automatically by Mongoose.
- **Folders:** lowercase, `kebab-case` if multi-word (`payment-requests/`).
- **Constants:** `UPPER_SNAKE_CASE` (`MAX_PARTICIPANTS`, `JWT_EXPIRY`).
- **Booleans:** prefix with `is`/`has`/`can` (`isBanned`, `hasPaid`, `canWithdraw`).

## File Organization

- One resource = one route file, one controller file, one service file, one model file in `server/` (e.g. `tournament.route.ts` → `tournament.controller.ts` → `tournament.service.ts` → `Tournament.model.ts`).
- Group frontend components by feature under `components/<feature>/`, and keep generic/shared UI primitives in `components/ui/`.
- Never mix admin-only and public-user components/routes in the same folder across `royal-clans` and `admin-panel` — they are separate apps for a reason (separation of privilege).

## Component Structure

- Functional components with hooks only — no class components.
- Keep components presentational where possible; move data-fetching into hooks (`useTournaments`, `useWallet`) so components stay easy to test and reuse.
- Co-locate a component's minor helper types with the component unless they're shared, in which case they go in `types/`.

## Preferred Libraries

- Data fetching/caching (frontend): **TanStack Query**
- Forms: **React Hook Form** + **Zod** for schema validation (shared validation shape between frontend and backend where practical)
- Icons: **lucide-react**
- Dates: **date-fns**
- Backend validation: **Zod** (validate every request body/query before it reaches a controller's logic)
- HTTP client (frontend): native `fetch` wrapped in a small typed helper (`lib/api.ts`) — no need for axios unless a specific need arises

## Libraries to Avoid

- Avoid state management libraries beyond React Context + TanStack Query (no Redux) unless a concrete need proves Context is insufficient.
- Avoid moment.js (unmaintained, large) — use `date-fns`.
- Avoid adding a new UI kit/component library without discussion — stay consistent with Tailwind + hand-built components.
- Avoid ORMs other than Mongoose for MongoDB — don't mix data-access patterns.

## Error Handling

- **API errors:** every Express route is wrapped so thrown errors reach a single centralized error-handling middleware; controllers throw typed errors (e.g. `AppError(statusCode, message)`) rather than building response JSON themselves.
- **Validation:** validate all incoming request data with Zod at the top of the controller (or via middleware) before any business logic runs; return a 400 with field-level messages on failure.
- **Exceptions:** never swallow a caught error silently — log it, and either handle it meaningfully or re-throw it to the centralized handler.
- **Logging:** use a single logger utility (not scattered `console.log`) so log format is consistent; log enough context (user id, route, payload summary) to debug payment/tournament issues without needing to reproduce them.

## Security Rules

- **Input validation:** validate and sanitize every request body, query param, and route param on the backend — never trust the frontend to have validated first.
- **Authentication:** all wallet, tournament-join, tournament-create, and results-related routes require a valid JWT; no anonymous writes anywhere.
- **Authorization:** every admin-only route must run a `requireRole('admin')` check server-side — a hidden frontend route is not access control.
- **Money operations:** never let a client request directly set `walletBalance`; balance is always derived by summing approved `transactions`. Every balance change must go through an admin-approved transaction record.
- **Environment variables:** secrets (`JWT_SECRET`, DB connection string, etc.) live only in `.env` files, excluded via `.gitignore`, never hardcoded or committed.
- **Secret management:** rotate `JWT_SECRET` and DB credentials if ever exposed; different secrets per environment (dev vs. production).
- **Rate limiting:** apply rate limiting to `/auth/login`, `/auth/register`, and any payment-submission endpoint to reduce brute-force/spam risk.
- **Room credentials are secrets:** a tournament's `roomId`/`roomPassword` and a Quick Match's room details must only ever reach registered participants, the organizer, and admins. Strip them server-side (projection on list queries, explicit delete on the detail response) — never rely on the frontend to hide them, since an unauthenticated `curl` must not be able to read a lobby password. The same goes for the `roomCredentials` pool, which is admin-only. If you add a new endpoint that returns tournament or quick-match documents, check what it leaks before shipping it.

## Performance Guidelines

- Use Next.js `Image` for all tournament banners/logos (automatic optimization, lazy loading by default).
- Paginate all list endpoints (tournaments, transactions, users) — never return unbounded arrays.
- Use code splitting / dynamic imports for heavy admin-panel views (charts, tables) that aren't needed on first paint.
- Cache read-heavy, rarely-changing data (e.g. published tournament list) client-side via TanStack Query's stale-time, rather than refetching on every render.

## Testing Guidelines

- **Unit tests:** cover service-layer business logic on the backend first (wallet math, tournament-status transitions) since that's where money-related bugs are most costly.
- **Integration tests:** cover full API request/response cycles for auth, join-tournament, and payment-approval flows.
- **End-to-end tests:** cover the critical user journeys (register → deposit → join tournament, and admin approve-payment → wallet credited) once the core flows stabilize — not required before that.
- Tests are not required for every trivial CRUD endpoint on day one, but the money-handling paths (wallet, transactions, prize payout) should never ship untested.

## Git Rules

- **Branch naming:** `feature/<short-name>`, `fix/<short-name>`, `chore/<short-name>` (e.g. `feature/tournament-join-flow`).
- **Commit messages:** short imperative summary line (e.g. `Add tournament approval endpoint`), body explaining *why* when the change isn't self-evident.
- **Pull requests:** describe what changed and why, list any manual testing done, and flag anything touching money/wallet logic explicitly for extra review.

## AI Development Rules

- Never rewrite working code unless explicitly asked to.
- Preserve the existing architecture (routes → controllers → services → models on the backend; the `components/`, `lib/`, `hooks/` split on the frontend) — don't introduce a competing pattern.
- Reuse existing components/utilities/types whenever one already covers the need, instead of creating a near-duplicate.
- Follow the naming and file-organization conventions above even under time pressure.
- Ask before making a breaking change (changing an API response shape, renaming a DB field already in use, altering an auth flow).
- Never introduce a new dependency without a clear, stated reason — check the "Preferred Libraries" list first.
- Treat anything touching `walletBalance` or `transactions` as high-risk: prefer the safer, more explicit implementation over the shorter one, and never bypass the admin-approval step for convenience.
- Keep `docs/memory.md` updated when completing a phase or making a notable decision, so future sessions have the current context.
