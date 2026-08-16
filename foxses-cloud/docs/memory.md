# memory.md — AI Working Memory

## Project Status
Foundation stage — documentation just created (2026-07-22). No feature code written yet beyond the default `create-next-app` scaffold.

## Completed Tasks
- Next.js 16.2.11 + React 19.2.4 + Tailwind 4 + TypeScript scaffold (pre-existing, via create-next-app).
- Documentation set created: `PRD.md`, `architecture.md`, `rules.md`, `phases.md`, `design.md`, `memory.md`.

## Current Task
None in progress — awaiting next instruction (likely Phase 1: API base URL config + auth integration).

## Pending Tasks
See `phases.md` — Phase 1 (auth integration, env config) is the next logical step.

## Known Issues / Blockers
- Domain search, domain purchase, hosting listing, and hosting purchase API endpoints are **not yet documented** by the backend — only `auth` and `users` endpoints are confirmed. Do not build these screens against guessed endpoints; ask the user/backend first.
- No payment provider chosen yet — checkout flow cannot be finalized until this is decided.
- No brand colors/logo yet — `design.md` uses a placeholder default theme (indigo/sky/green on Tailwind gray neutrals).
- No test framework configured yet.
- No deployment target decided yet.

## Important Decisions
- This repo is **frontend-only**. Backend (Node.js/TS/Express/MongoDB/Redis) is a separate, already-built project — confirmed by the user.
- Admin panel will be a **separate application**, explicitly out of scope here.
- Auth: JWT access token (kept in memory client-side, not localStorage) + httpOnly refresh cookie (set by backend) + silent refresh via `POST /api/v1/auth/refresh`.
- Design: starting with a default modern minimal theme; user will provide real brand colors/logo later — swap `design.md` values when received, don't wait to start building.

## Change Log
- **2026-07-22:** Initial `/docs` documentation set created (PRD, architecture, rules, phases, design, memory) based on user-provided project context.

## Notes for future sessions
- Next.js 16.2.11 has breaking changes vs. older conventions — check `node_modules/next/dist/docs/` before writing App Router code (see root `AGENTS.md`).
- Backend README (provided by user) is the source of truth for confirmed auth/user endpoints — full endpoint list is in `architecture.md`.
- When domain/hosting backend endpoints become available, update `architecture.md`'s "Not yet defined" section and unblock `phases.md` Phase 3 items.
