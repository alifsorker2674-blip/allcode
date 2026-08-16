# phases.md

Scope: this repo (frontend) only. Admin panel is a separate application and not part of these phases.

## Phase 1 — Project Foundation
- [x] Project scaffold (Next.js 16 + Tailwind 4 + TypeScript, via create-next-app)
- [ ] Confirm/wire up API base URL + env config (`.env.local`, `NEXT_PUBLIC_API_URL` or similar)
- [ ] Auth integration: register, login, logout, silent refresh, `useAuth`/auth context
- [ ] Route protection for the (future) dashboard area

## Phase 2 — Dashboard Shell
- [ ] Dashboard layout (authenticated route group)
- [ ] Navigation / sidebar / header
- [ ] User profile view (wired to `GET /api/v1/auth/profile`)

## Phase 3 — Core Features
- [ ] Domain search UI (availability check) — **blocked on backend endpoint confirmation**
- [ ] Domain purchase / checkout flow — **blocked on backend endpoint + payment provider decision**
- [ ] Hosting plan listing UI — **blocked on backend endpoint confirmation**
- [ ] Hosting purchase flow — **blocked on backend endpoint + payment provider decision**
- [ ] Dashboard: "my domains" / "my hosting" list views

## Phase 4 — Advanced Features
- [ ] Renewals (domain/hosting)
- [ ] DNS settings management UI
- [ ] Notifications (expiry/renewal reminders) — not yet scoped in PRD, confirm before building

## Phase 5 — Admin Panel
- Explicitly out of scope for this repo — tracked separately.

## Phase 6 — Testing & Optimization
- [ ] Decide on test stack (see `rules.md` — Testing Guidelines)
- [ ] Bug fixes from Phase 1–4 usage
- [ ] Performance pass (image optimization, code splitting once real content exists)
- [ ] Responsive + accessibility pass (see `design.md`)

## Phase 7 — Deployment
- [ ] Decide hosting/deploy target (not yet chosen — see `architecture.md`)
- [ ] Environment variable setup for production
- [ ] Final review against `PRD.md` success criteria

## Notes
- Domain/hosting purchase phases (3–4) are blocked on backend API contract confirmation and a payment provider decision — flag these to the user before starting rather than assuming a shape.
