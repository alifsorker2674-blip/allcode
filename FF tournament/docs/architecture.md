# architecture.md — Technical Architecture

## System Architecture

Royal Clans is split into three independently deployable applications living side by side in this workspace:

```
FF tournament/
├── royal-clans/     → Public-facing frontend (Next.js) — players/users
├── admin-panel/      → Admin dashboard (Next.js) — staff only
├── server/           → Backend REST API (Express + TypeScript)
└── docs/              → This documentation
```

- `royal-clans` and `admin-panel` are both Next.js apps and are **API consumers only** — no direct database access, everything goes through `server`.
- `server` is the single source of truth: it owns the database, business logic, auth, and the manual-payment approval workflow.
- Both frontends talk to `server` over HTTP (JSON REST API), authenticated with JWTs.

```
   royal-clans (users)  ──┐
                            ├──►  server (Express API)  ──►  MongoDB
   admin-panel (staff)  ──┘
```

## Application Flow

1. A user opens `royal-clans`, browses the Tournament Marketplace and leaderboards (no auth required).
2. To join a tournament, enter Quick Match, or deposit money, the user logs in — frontend stores the JWT and attaches it to API calls.
3. Actions that require money (join tournament, create tournament, Quick Match entry, withdraw) create a **pending** record on the server, or place funds in escrow (Quick Match); nothing settles until either both sides confirm a result or an admin approves the underlying payment.
4. Quick Match players are placed in a queue; the matchmaking service pairs two players on the same game + entry-fee tier and creates a match/room.
5. Match results (both tournament and Quick Match) are confirmed via dual-screenshot submission — auto-confirmed when both sides agree, otherwise routed to the admin's **dispute queue**.
6. Admin staff use `admin-panel` (separately authenticated, `admin` role required) to review pending tournaments, payments, disputes, and to manage users and platform fee settings.
7. Once approved/confirmed, state changes (wallet credited, tournament published, ranking points updated) become visible back on `royal-clans`.

## Folder Structure

### `server/` (already scaffolded)

```
server/
  src/
    index.ts          # entry point (compiles to dist/index.js)
    app.ts             # express app + middleware wiring
    config/             # env, db connection, constants
    routes/              # one file per resource, mounts a Router
    controllers/          # request handlers (thin, call services)
    services/               # business logic (to be added as features land)
    models/                   # Mongoose schemas/models
    middleware/                # auth guard, role guard, error handler, validation
    types/                      # shared TypeScript types/interfaces
  dist/                # compiled output (gitignored)
  package.json
  tsconfig.json
  nodemon.json
```

Rule of thumb: **routes** define the URL + which controller handles it → **controllers** parse the request and call a **service** → **services** contain the actual business logic and talk to **models**. Controllers should never contain business logic, and models should never be imported directly into routes.

### `royal-clans/` and `admin-panel/` (Next.js, App Router)

Both apps should follow the same internal convention so switching between them is predictable:

```
app/
  (routes)/...          # pages, grouped by feature
components/
  ui/                    # generic, reusable, no business logic (Button, Card, Modal…)
  <feature>/               # feature-specific components (TournamentCard, WalletBalance…)
lib/
  api.ts                  # typed fetch wrapper for calling server/
  auth.ts                  # token storage/refresh helpers
hooks/                  # reusable client hooks
types/                  # shared frontend types (mirroring server response shapes)
```

`admin-panel` additionally has an `app/(admin)/...` area gated by an `admin`-role check, with sections for: users, tournaments (approval queue), payments (deposit/withdrawal/create-fee queue), **disputes** (under-review match resolution), Quick Match monitoring, clans/ranking, reports, and settings (fee tables, banners, announcements).

`royal-clans` additionally has an organizer-facing area (`app/(organizer)/...`, no separate login — any authenticated user who owns a tournament can access it) with an Organizer Dashboard: earnings, tournament list, participants, revenue, prize distribution, and a withdrawal request form.

## Technology Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Admin panel | Next.js 16 (App Router), React 19, TypeScript |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB + Mongoose |
| Authentication | JWT (access + refresh token), bcrypt password hashing |
| Hosting | Self-managed VPS (Nginx reverse proxy, PM2 process manager) |
| State management | React Context for global/auth state, TanStack Query for server-state caching |
| Styling | Tailwind CSS |
| Build tools | Next.js build (frontends), `tsc` (backend) |

## Database Design (MongoDB)

Collections and key fields — exact schemas will be formalized as Mongoose models when each feature is built.

**Core**
- **users** — `name`, `email`, `phone`, `passwordHash`, `role` (`user` \| `admin`), `walletBalance` (derived/cached), `isBanned`, `createdAt`
- **clans** — `name`, `tag`, `logoUrl`, `ownerId` (→ users), `members[]` (→ users), `rankingPoints`, `tier`
- **transactions** — `userId`, `type` (`deposit` \| `withdrawal` \| `tournamentEntry` \| `tournamentCreateFee` \| `quickMatchEntry` \| `prizePayout` \| `refund` \| `adminAdjustment`), `amount`, `method` (`bKash` \| `Nagad` \| `internal`), `referenceId` (bKash/Nagad transaction ID for deposits), `status` (`pending` \| `approved` \| `rejected`), `reviewedBy`, `createdAt` — this is the wallet ledger; `walletBalance` on `users` is always derived from/reconciled against approved transactions, **never** edited directly by any endpoint, including admin ones (admin balance corrections must also be a `adminAdjustment` transaction, for auditability).

**Tournament Marketplace**
- **tournaments** — `title`, `game` (`freefire` \| `bloodstrike`), `mode` (`solo` \| `duo` \| `squad`), `entryFee`, `slots`, `prizePool`, `prizeDistribution`, `createFeeCharged`, `rules`, `schedule`, `status` (`pending` \| `approved` \| `rejected` \| `live` \| `completed` \| `cancelled`), `createdBy` (→ users, the organizer), `approvedBy` (→ users), `isOfficial` (platform-hosted), **`roomId` + `roomPassword`** — the in-game lobby credentials, **never exposed publicly** (see the access rule below)
- **registrations** — `tournamentId`, `userId` or `clanId`, `paymentStatus` (`pending` \| `approved` \| `rejected`), `transactionId` (→ transactions), `reviewedBy`

**Quick Match** *(built)*
- **quickMatchQueue** — `userId`, `game`, `entryFee`, `status` (`waiting` \| `matched` \| `cancelled`), `matchId`, `createdAt`. Pairing atomically claims the oldest `waiting` entry for the same game + fee, so two simultaneous joiners can't grab the same opponent.
- **quickMatches** — `game`, `players[]` (→ users), `entryFee`, `prizeAmount`, `platformFee`, `roomId`, `roomPassword`, `roomCredentialId` (→ roomCredentials), `status` (`active` \| `awaiting_results` \| `confirmed` \| `under_review` \| `resolved` \| `cancelled`), `submissions[]`, `winnerId`, `verifiedBy`, `paidOut`
- **roomCredentials** — `game`, `roomId`, `roomPassword`, `isActive`, `lastAssignedAt`, `timesAssigned`, `note`, `createdBy`. The admin-managed pool of pre-created in-game lobbies (see [Quick Match Room Pool](#quick-match-room-pool) below).

**Match Results & Disputes** (shared shape for both tournament matches and Quick Matches)
- **matches** — `tournamentId` or `quickMatchId`, `round` (tournament only), `participants[]`, `screenshots[]` (`{ userId, url, selectedWinner }`), `resultStatus` (`auto_confirmed` \| `under_review` \| `admin_resolved`), `finalWinner`, `verifiedBy`
- **disputes** — `matchId`, `raisedBy` (or `system` if auto-flagged from mismatched screenshots), `reason`, `status` (`open` \| `resolved`), `resolvedBy`, `resolution`, `createdAt` — every "Under Review" match automatically gets a dispute record so the admin dispute queue is always the single place to resolve conflicts.

**Ranking & Leaderboard** *(built, except clan-wise)*
- **rankings** — `userId`, `game`, `tier` (`Bronze` \| `Silver` \| `Gold` \| `Platinum` \| `Diamond` \| `Heroic` \| `Grandmaster`), `points`, `wins`, `losses` — updated only from `auto_confirmed` or `admin_resolved` results, never from pending/disputed ones. 50 pts per tournament win, 20 per Quick Match win; tier is derived from cumulative points. Unique on `(userId, game)`.
- **rankingEvents** — `userId`, `game`, `points`, `source` (`tournament` \| `quickMatch`), `createdAt`. An append-only log of every points award. Needed because cumulative `rankings` totals can't be time-sliced — the weekly/monthly leaderboards aggregate this collection over a date window, while the all-time view reads `rankings` directly.
- A `clanId` variant is still to come with the Clan system; the clan-wise leaderboard view is blocked on it.

**Platform Config & Content**
- **feeConfig** — admin-editable: `tournamentCreateFeeTable[]` (`{ slots, fee }`), `tournamentEntryServiceFeePct`, `quickMatchServiceFeePct`, `withdrawalChargePct`, `roomCooldownMinutes`, `quickMatchEntryFees[]` — read by services at calculation time, never hardcoded in business logic.
- **settings** — singleton doc for site content admin controls (banners, announcements).
- **notifications** — `userId`, `message`, `type`, `isRead`, `createdAt`

**Relationships**
- `users` 1—N `clans` (owner), N—N `clans` (membership)
- `users` 1—N `tournaments` (as organizer/creator)
- `tournaments` 1—N `registrations`, `registrations` N—1 `users`/`clans`
- `users` 1—N `transactions` (the wallet ledger)
- `quickMatchQueue` entries resolve into a `quickMatches` document once paired
- `tournaments`/`quickMatches` 1—N `matches`, `matches` 1—0/1 `disputes`
- `matches` (confirmed/resolved) feed into `rankings` point updates

## API Architecture

- REST API, versioned base path: `/api/v1/...`
- Resource-based routes: `/auth`, `/users`, `/clans`, `/tournaments`, `/registrations`, `/quick-match` (join queue, cancel, status), `/matches` (result/screenshot submission), `/transactions`, `/leaderboard`, `/rankings`, `/admin/*` (admin-only variants where the workflow differs, e.g. `/admin/tournaments/:id/approve`, `/admin/disputes`, `/admin/fee-config`)
- Standard response envelope:
  ```json
  { "success": true, "data": {}, "message": "optional" }
  ```
  Errors follow the same shape with `"success": false` and a `message`, handled by a single centralized Express error-handling middleware — controllers should never format error responses inline.
- Pagination via `?page=&limit=` on list endpoints, returned with `meta: { page, limit, total }`.
- **API documentation:** every route is documented with an `@openapi` JSDoc block directly above its handler in `routes/*.route.ts`, compiled by `swagger-jsdoc` and served via `swagger-ui-express` at `/api-docs` (raw spec at `/api-docs.json`). This is not optional tooling — a new route isn't considered done until it has its Swagger annotation, since `royal-clans`/`admin-panel` development and any future public API depend on this being accurate.

## Quick Match Matchmaking *(built — `server/src/services/quickMatch.service.ts`)*

- Queue-table approach (`quickMatchQueue`). On join, a single `findOneAndUpdate` atomically claims the oldest `waiting` entry with the same `game` + `entryFee` and flips it to `matched`, so concurrent joiners can't both claim the same opponent. If nobody's waiting, the joiner becomes a `waiting` entry.
- **Money rule:** entry fees are debited only once a match actually forms — merely sitting in the queue never touches the wallet, so cancelling costs nothing. Balance is still checked up-front so we never pair someone who can't pay. If the opponent has gone broke between queueing and pairing, the joiner is refunded and the opponent dropped.
- **Failure rollback:** if anything after claiming the opponent fails (most likely: no room off cooldown), the opponent is put back to `waiting` and no wallet is touched. Verified live.
- The frontend polls `GET /quick-match/status` on a short interval. A WebSocket/SSE "match found" push is a reasonable upgrade once volume justifies it — not needed now. Note that `status` only reports *active* matches, so the client re-fetches a finished match by id to show its outcome (see memory.md).
- Prize split comes from `feeConfig.quickMatchServiceFeePct` at pairing time: pool = 2 × entry fee, platform takes the percentage, winner gets the rest. Payout is guarded by a `paidOut` flag so it can't double-pay.

## Quick Match Room Pool *(built — `server/src/services/roomCredential.service.ts`)*

Solves the operational problem that someone would otherwise have to manually create an in-game lobby for every single match.

- The admin pre-loads lobby credentials (`roomCredentials`) via `admin-panel` `/rooms`.
- `assignRoom(game)` hands out the **least-recently-used** active room whose `lastAssignedAt` is `null` or older than `feeConfig.roomCooldownMinutes` (default 30). It's a single atomic `findOneAndUpdate` that also stamps `lastAssignedAt` — so under concurrent pairing, the first writer moves the room outside the other's filter and two live matches can never share a lobby.
- **Cooldown rather than a busy/free flag** is deliberate: nothing in the system reliably learns when a real in-game lobby has emptied, so a time window needs no completion signal and can't leave a room permanently stuck "busy" if a match is abandoned.
- If every room is cooling down, pairing fails with a `503` and a clear message, and rolls back as described above.
- **Capacity implication:** N pooled rooms with a C-minute cooldown allows at most N matches to *start* per C minutes. The admin UI surfaces free/cooling-down counts and warns at zero so this is visible rather than mysterious.

## Authentication Flow

- **Registration/Login:** email or phone + password; password hashed with bcrypt.
- **Session:** short-lived JWT access token (sent in `Authorization: Bearer`) + longer-lived refresh token (httpOnly cookie) to reissue access tokens without re-login.
- **Authorization:** Express middleware checks the JWT and attaches `req.user`; a second `requireRole('admin')` middleware guards admin-only routes. The same pattern protects `admin-panel` API calls — admin routes reject any non-admin token.
- **Frontend route guards:** `royal-clans` redirects unauthenticated users away from wallet/join/create actions; `admin-panel` redirects any non-admin session to a login page entirely (no partial admin UI is ever shown to a non-admin).

## Deployment Architecture

- **Development:** `server` runs via `npm run dev` (nodemon + ts-node); `royal-clans` and `admin-panel` run via `next dev` on separate ports, pointed at the local API through an env variable.
- **Production (VPS):**
  - Nginx as reverse proxy routing subdomains, e.g. `app.<domain>` → `royal-clans`, `admin.<domain>` → `admin-panel`, `api.<domain>` → `server`.
  - PM2 manages and keeps alive all three Node processes (`server`, and `next start` for both frontends), with auto-restart on crash and on server reboot.
  - MongoDB running on the same VPS (or swappable later for a managed MongoDB service) — access restricted to localhost/internal network only, never exposed publicly.
  - SSL via Let's Encrypt/Certbot on all subdomains.
  - Environment secrets (`JWT_SECRET`, DB URI, etc.) live in `.env` files on the server, never committed to git.
- **CI/CD:** manual deploy (`git pull` + `npm run build` + `pm2 restart`) initially; a GitHub Actions pipeline can be added later once the deploy process is stable.

## Notifications

- **Push (Web Push / VAPID):** `PushSubscription` model stores each device a user has subscribed from (an endpoint + keys pair from the browser's `PushManager`). `notification.service.ts` sends via the `web-push` package using VAPID keys in `.env`. Both `royal-clans` and `admin-panel` are full PWAs (installable on mobile home screen, standalone display) with a service worker (`public/sw.js`) that handles incoming `push` events and notification clicks. This is what makes the apps "feel like a mobile app" when installed.
- **Discord:** a single incoming webhook URL (`DISCORD_WEBHOOK_URL`) posts admin-relevant alerts (new deposit/withdrawal, new tournament pending, new dispute) to a Discord channel. No-ops silently if the URL isn't configured.
- **In-app voice alert (admin only):** `admin-panel` polls `GET /admin/overview` every 15s and speaks a browser-native TTS alert (Web Speech API — no external service) when new pending items appear, so an admin working in another tab still hears about incoming requests.
- Notification triggers are fire-and-forget from the calling service code (never awaited, internally use `Promise.allSettled`) so a slow/failed push or Discord call never delays or breaks the actual API response.

## Third-Party Services

- Payments are handled manually (user submits a bKash/Nagad transaction ID, admin verifies against their own bKash/Nagad account) — no payment gateway required at launch.
- Discord (optional, admin alerts only — see Notifications above) — requires the user to create a webhook in their own Discord server.
- Image uploads (tournament banners, match-result screenshots, payment proof) can start as local disk storage on the VPS and move to object storage (e.g. Cloudinary or S3-compatible storage) later if VPS disk becomes a constraint — match-result screenshots in particular will grow quickly once Quick Match volume increases, so plan to move this first.
- Future optional integrations: bKash/Nagad merchant payment gateway, Stripe (international cards), an SMS provider for phone verification, an OCR/AI service for automated screenshot verification, a real email provider (to replace the temporary "reset token in the API response" approach — see rules.md/memory.md security note).

## Scalability Considerations

- Keep `server` stateless (no in-memory session storage) so multiple instances can run behind Nginx load balancing if traffic grows.
- Add MongoDB indexes on frequently queried fields early (`tournaments.status`, `tournaments.game`, `registrations.tournamentId`, `transactions.status`, `quickMatchQueue.game+entryFee+status`, `rankings.game+points`).
- Quick Match queue matching and leaderboard reads are the most write/read-heavy paths — introduce a caching layer (e.g. Redis) for leaderboards, and consider moving the queue itself to Redis (sorted sets) instead of MongoDB once volume makes DB-polling too slow. Not needed at launch.
- Keep heavy media (banners, result screenshots) off the app server's request path once moved to object storage, served via CDN.
