# phases.md — Development Phases

## MVP Scope

The full Royal Clans vision (Tournament Marketplace + Quick Match + Wallet + Clan/Ranking + full Admin control) is documented across all phases below so the roadmap is never lost — but the plan is to build it incrementally, MVP first.

**MVP = Phases 1–5.** This is the smallest version that proves the core loop end-to-end: a user registers, deposits money (manually verified), creates or joins a tournament (dynamic fee), submits match results (dual-screenshot, admin resolves disputes), and receives prize money back into their wallet — all controllable from the admin panel.

**Post-MVP (V2) = Phases 6–8.** Clan system, ranking/leaderboard, and the Quick Match instant-matchmaking system layer on top of the same wallet/match-result foundation once the MVP loop is validated. The Organizer Dashboard and deeper admin reporting also land here.

**Phases 9–10 (Testing & Deployment)** apply incrementally to whatever has been built so far — don't wait for the entire V2 scope to start testing/deploying the MVP.

**Phase 11 (Revenue Expansion)** is explicitly post-launch, after the platform has real usage.

Treat this file as the living full-system roadmap — check items off as they're built, and don't remove the later-phase items just because they're not being built yet.

## Phase 1 – Project Foundation

- [x] Repository/folder structure: `royal-clans` (frontend), `admin-panel` (admin), `server` (backend) — set up.
- [x] `server`: Node + Express + TypeScript scaffold, nodemon dev workflow, `dist/index.js` build output.
- [x] `server`: MongoDB connection (Mongoose), environment config for dev/prod.
- [x] `server`: User model + auth endpoints (register, login, refresh, logout, me).
- [x] `server`: JWT auth middleware + role guard (`user` / `admin`).
- [x] `server`: API documentation via Swagger (`swagger-jsdoc` + `swagger-ui-express`, served at `/api-docs`) — every route documented as it's built.
- [x] `server`: `transactions` model — the wallet ledger — with atomic, race-safe credit/debit helpers (`server/src/services/wallet.service.ts`).
- [x] `royal-clans`: auth pages (register/login) wired to the API — token stored client-side, shared `AuthProvider` context.
- [x] `admin-panel`: admin-only login wired to the API — non-admin accounts are rejected client-side right after login (no separate admin login endpoint; same `/auth/login`, role checked in the response).
- [x] `server`: forgot/reset password (`POST /auth/forgot-password`, `/auth/reset-password` — SHA-256-hashed token, 1h expiry, generic "if this email exists" response so emails can't be enumerated) and self-service profile management (`PATCH /auth/me` for name/phone, `POST /auth/change-password` requiring the current password).
- [x] `royal-clans` + `admin-panel`: `/forgot-password` and `/reset-password` pages, both wired to the same shared backend endpoints (password reset isn't role-specific). **Security-relevant MVP gap:** since no email/SMS service is configured yet (see architecture.md), `/auth/forgot-password` returns the raw reset token directly in the response instead of emailing it — meaning anyone who merely knows a target account's email address (no inbox access needed) can currently reset that account's password. This is acceptable only for local development/demo and **must** be replaced with real email delivery (token emailed, never returned in the API response) before any real users' accounts exist.
- [x] `royal-clans` + `admin-panel`: `/profile` page (view/edit name + phone, change password) on both apps, using the same `PATCH /auth/me` / `POST /auth/change-password` endpoints.

## Phase 2 – Dashboards

- [x] `server`: player dashboard summary API (`GET /dashboard` — wallet balance, 5 most recent transactions, tournaments-created/joined counts).
- [x] `server`: admin overview stats API (`GET /admin/overview` — user counts, pending deposit/withdrawal/tournament/dispute counts, tournament counts).
- [x] `server`: admin user management API (`GET /admin/users` with role/banned/search filters, `POST /admin/users/:id/ban|unban`, `PUT /admin/users/:id/role` — self-role-change blocked; a banned user's login is rejected).
- [x] `royal-clans`: player dashboard page wired to `GET /dashboard` (wallet balance, recent transactions, tournament counts, quick links).
- [x] `admin-panel`: dashboard page wired to `GET /admin/overview`, plus a persistent sidebar-style nav (Overview/Transactions/Tournaments/Disputes/Users/Settings).
- [x] Shared: `Nav` component in each app (role-aware in `royal-clans`, admin-only in `admin-panel`).
- [x] User profile page (view/edit basic info) on `royal-clans` — see Phase 1 (built alongside forgot/reset password).

## Phase 3 – Wallet & Payments

- [x] `server`: deposit request API (`POST /wallet/deposit`) + admin approval queue (`GET/POST /admin/transactions*`) → wallet credited only on approval.
- [x] `server`: withdrawal request API (`POST /wallet/withdraw`) + admin approval → balance deducted only on approval.
- [x] `server`: `feeConfig` model + `GET /fee-config` (public) + `PUT /admin/fee-config` (admin) for the tournament-create fee table, entry/Quick Match service fee %, withdrawal charge %.
- [x] `server`: transaction history API (`GET /wallet/transactions`, paginated).
- [x] `royal-clans`: `/wallet` page — deposit/withdraw request forms, live balance, full transaction history table.
- [x] `admin-panel`: `/transactions` approval queue (approve/reject with a reason prompt), `/settings` fee-config editor (create-fee tier table + service-fee percentages).

## Phase 4 – Tournament Marketplace

- [x] `server`: Tournament + Registration models, CRUD endpoints, dynamic create-fee calculation from `feeConfig` (`server/src/services/tournament.service.ts`).
- [x] `server`: "Create Tournament" API (`POST /tournaments`) — debits create fee from wallet immediately, tournament enters `pending` review.
- [x] `server`: admin tournament-approval queue API (`GET /admin/tournaments`, `POST /admin/tournaments/:id/approve|reject` — reject auto-refunds the create fee).
- [x] `server`: Marketplace browse/filter API (`GET /tournaments?game=&mode=`) and tournament details (`GET /tournaments/:id`).
- [x] `server`: join-tournament API (`POST /tournaments/:id/join`) — entry-fee deduction, duplicate/full-slot checks.
- [x] `royal-clans`: `/tournaments` browse/filter page, `/tournaments/create` form (live fee preview from `/fee-config`), `/tournaments/[id]` details + join button.
- [x] `admin-panel`: `/tournaments` approval queue with status filter tabs, approve/reject with reason.

## Phase 5 – Match Results & Disputes

- [x] `server`: `Match` + `Dispute` models, organizer/admin match creation (`POST /tournaments/:tournamentId/matches`).
- [x] `server`: dual-screenshot submission endpoint (`POST /matches/:id/submit-result`) — auto-confirms when 2+ submissions agree on the winner, flips to `under_review` (and opens a `Dispute`) the moment two submissions disagree. MVP simplification: confirmation triggers on the first 2 agreeing submissions rather than requiring every participant in large Battle-Royale-style lobbies — fine for duo/squad brackets, worth revisiting once solo 100-player tournaments are in active use.
- [x] `server`: admin dispute-resolution queue (`GET /admin/disputes`, `POST /admin/disputes/:id/resolve`).
- [x] `server`: prize payout (`POST /admin/matches/:matchId/payout`, credited via a `prizePayout` transaction) — admin sets the exact amount per the tournament's (free-text) prize distribution; not auto-calculated.
- [x] `royal-clans`: `/tournaments/[id]/matches` — organizer creates a match per round, any participant/organizer submits a result (screenshot URL + claimed winner), live status per match.
- [x] `admin-panel`: `/disputes` — open-dispute queue with both sides' submissions and screenshot links, resolve form, plus a manual prize-payout form.
- [ ] Screenshot upload isn't wired to real file storage yet — `submit-result` currently takes a `screenshotUrl` string (any URL), and the frontend has no upload widget, just a URL text field. A real upload endpoint (multer + disk/object storage, per [architecture.md](architecture.md)) plus an upload UI are still needed before this is usable by a real, non-technical player.

## Notifications — Push, Discord, and Voice Alerts (built 2026-07-29, not originally a numbered phase)

Cross-cutting feature spanning wallet/tournament/match events — added after the MVP phases above were already complete, so it's tracked here rather than shoehorned into a specific phase number.

- [x] `server`: `PushSubscription` model, VAPID keys (`web-push` package), `GET /push/vapid-public-key`, `POST /push/subscribe|unsubscribe`.
- [x] `server`: `notification.service.ts` — `sendPushToUser`, `sendPushToAdmins` (auto-prunes dead/expired subscriptions on 404/410), `sendDiscordMessage` (no-ops if `DISCORD_WEBHOOK_URL` isn't set), `notifyAdmins` (push + Discord together).
- [x] `server`: wired into existing services — **admins get push + Discord** on: new deposit/withdrawal request, new tournament pending review, new match dispute opened. **Players get push** on: deposit/withdrawal approved or rejected, tournament approved or rejected, dispute resolved in their favor, prize payout received.
- [x] `royal-clans` + `admin-panel`: full PWA setup — `app/manifest.ts` (typed, per-app name/branding), `app/apple-icon.png`, `public/sw.js` (handles `push` + `notificationclick`), `viewport`/`appleWebApp` metadata, `ServiceWorkerRegister` client component. Installable on mobile as a standalone app (home-screen icon, no browser chrome) on both apps.
- [x] `royal-clans` + `admin-panel`: `lib/push.ts` (subscribe flow: request permission → register SW → fetch VAPID key → `pushManager.subscribe()` → POST to backend) + a `NotificationBell` "🔔 Enable Notifications" button in each `Nav`, hidden once permission is granted.
- [x] `admin-panel`: `NotificationWatcher` — polls `GET /admin/overview` every 15s while an admin is logged in and speaks a **browser TTS voice alert** (Web Speech API, no external service) the moment new pending deposits/withdrawals, tournament requests, or disputes appear, distinguishing which category increased.
- [x] Branded PWA icon set generated (gold crown + red gem on dark background, matches [design.md](design.md)) at 192/512/512-maskable/apple-touch-icon sizes, shared by both apps.
- **User-provided setup required:** `DISCORD_WEBHOOK_URL` in `server/.env` is currently empty — the user needs to create a webhook in their own Discord server (Server Settings → Integrations → Webhooks → New Webhook → Copy URL) and paste it in for Discord alerts to actually fire. Push notifications work without any further setup (VAPID keys are already generated and in `.env`).
- **Testing limitation, not a defect:** live-verified the full pipeline (subscribe → DB storage → `notifyAdmins` → `webpush.sendNotification` attempted, correctly failing only because test subscriptions used fake keys; `speechSynthesis.speak()` confirmed actually invokable in this browser) but could **not** verify real OS-level notification popups, audible voice output, or the mobile "Add to Home Screen" install prompt, since the sandboxed test browser auto-denies the Notification permission prompt and has no real push endpoint / physical mobile device. This needs a real-device check by the user before considering it fully done.

## Phase 6 – Clan System & Ranking

- [ ] Clan model + create/manage clan (owner + members, logo) on `royal-clans`.
- [ ] Squad-mode tournament registration tied to a clan roster.
- [x] `rankings` model — tier calculation (Bronze → Grandmaster) updated from confirmed match results only (`server/src/services/ranking.service.ts`; 50 pts per tournament win, 20 per Quick Match win, thresholds in `ranking.model.ts`).
- [x] Leaderboard views: Global, Monthly, Weekly, Game-wise (`GET /leaderboard?period=all|weekly|monthly&game=`) + `/leaderboard` page on `royal-clans`. **Clan-wise is still pending** — it depends on the Clan model above, which isn't built.
- Note: a `RankingEvent` log backs the weekly/monthly views, since cumulative `Ranking` totals can't be time-sliced. Tier is only shown on the all-time view (a tier is a career stat, not a weekly one).

## Phase 7 – Quick Match System

- [x] `quickMatchQueue` + matching endpoint (pair same game + entry fee, atomic claim of the oldest waiting opponent so two joiners can't grab the same person).
- [x] `quickMatches` model + automatic room handout on pairing (see the Room Pool section below).
- [x] Entry-fee escrow on match (not on queue-join — cancelling out of the queue costs nothing), instant prize payout on confirmed result minus `quickMatchServiceFeePct`.
- [x] Reuse the Phase 5 screenshot/dispute flow for Quick Match result confirmation (`Dispute` now points at either a tournament `Match` or a `QuickMatch`, so both feed one admin queue).
- [x] `royal-clans` Quick Match UI (`/quick-match`): pick game + entry fee, waiting state that live-polls, match-found card with room ID/password, result submission, and a win/loss result card once finalized.
- [x] `admin-panel` `/quick-matches`: monitor active/finished matches, queue breakdown by game+fee, and resolve disputed matches (pays the winner immediately).

## Quick Match Room Pool (built 2026-07-29)

Removes the need for a person to sit and create an in-game lobby for every match.

- [x] `RoomCredential` model + admin CRUD (`/admin/rooms`) — pre-created lobbies, per game, enable/disable, delete.
- [x] Cooldown-aware assignment: `assignRoom()` hands out the least-recently-used room that hasn't been assigned within `roomCooldownMinutes` (admin-configurable, default 30), via a single atomic `findOneAndUpdate` so concurrent pairings can't collide on the same lobby.
- [x] Graceful exhaustion: if every room is cooling down, pairing fails with a clear 503 **and rolls back cleanly** — the waiting opponent goes back to `waiting` and neither wallet is touched.
- [x] `admin-panel` `/rooms`: availability counters (free / cooling down / active), per-room live cooldown countdown, times-used, and a warning banner when zero rooms are free. Availability also surfaces on the admin dashboard.
- **Operational note for the admin:** the number of pooled rooms caps how many Quick Matches can run concurrently within one cooldown window. With N rooms and a 30-minute cooldown, at most N matches can start per 30 minutes. Add more rooms (or lower the cooldown in Settings) if players hit the "no room free" error.

## Tournament Room Credentials & Official Tournaments (built 2026-07-29)

- [x] Every tournament now requires `roomId` + `roomPassword` at creation, and the organizer/admin can update them later via `PUT /tournaments/:id/room` (room IDs are often only known near match time).
- [x] **Access control:** credentials are stripped from all public list responses and from the detail response for guests and non-registered users. Only registered participants, the organizer, and admins receive them. Enforced server-side in `tournament.service.ts` (an `optionalAuth` middleware lets the public detail route vary its response by caller).
- [x] `POST /admin/tournaments` — admins create official platform-hosted tournaments that publish immediately (`status: approved`, `isOfficial: true`, no create fee), with an "Official" badge on the public detail page and a create form at `admin-panel` `/tournaments/create`.
- [x] Per-tournament create-fee pricing remains fully admin-controlled from `admin-panel` `/settings` (slot-tiered table), now alongside the Quick Match room cooldown and entry-fee tiers.

## Phase 8 – Organizer & Admin Dashboards

- [ ] Organizer Dashboard on `royal-clans`: earnings, total/active tournaments, participants, revenue, prize distribution status, withdrawal request.
- [ ] `admin-panel`: full user management (view, ban/unban, change role).
- [ ] `admin-panel`: reports (revenue by fee type, active tournaments/matches, user growth, dispute volume).
- [ ] `admin-panel`: site settings — banners, announcements.

## Phase 9 – Testing & Optimization

- [ ] Unit tests for wallet/transaction logic, fee calculation, and tournament/match status transitions.
- [ ] Integration tests for auth, join-tournament, Quick Match pairing, and dispute-resolution flows.
- [ ] Responsive testing across mobile/tablet/desktop on both `royal-clans` and `admin-panel` (mobile-first, since most players are on phones).
- [ ] Performance pass (pagination everywhere, image optimization, query/index review, Quick Match queue latency).
- [ ] Accessibility pass (keyboard navigation, contrast, focus states).
- [ ] Bug bash and fixes.

## Phase 10 – Deployment

- [ ] VPS provisioning: Node, MongoDB, Nginx, PM2, Certbot installed.
- [ ] Nginx reverse proxy config for `app.<domain>`, `admin.<domain>`, `api.<domain>` with SSL.
- [ ] PM2 process configs for `server`, `royal-clans` (`next start`), `admin-panel` (`next start`), with auto-restart.
- [ ] Production environment variables and secrets configured (never committed to git).
- [ ] Database backup schedule set up.
- [ ] Final review, smoke test of all critical flows in production (deposit → join tournament, Quick Match pairing → payout, dispute resolution), documentation handoff (`docs/memory.md` updated).

## Phase 11 – Revenue Expansion (post-launch)

Not required for launch — build once the core platform is stable and generating baseline revenue.

- [ ] Featured Tournament placement.
- [ ] Organizer Pro Subscription.
- [ ] Sponsored Tournament slots.
- [ ] Banner Advertisement system.
- [ ] Clan Premium / VIP Membership.
