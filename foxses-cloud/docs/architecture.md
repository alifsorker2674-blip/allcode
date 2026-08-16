# architecture.md

## System Architecture
Two separate codebases:
- **This repo (`foxses-cloud`)** — Next.js frontend, customer-facing only.
- **Backend (separate repo)** — Node.js + TypeScript + Express + MongoDB + Redis boilerplate, already built. This frontend talks to it over HTTP; this frontend never touches the database directly.
- **Admin panel** — a third, separate application (not this repo, not yet started).

```
[ foxses-cloud (Next.js) ]  --HTTP/JSON-->  [ Express API (Node/TS) ]  -->  [ MongoDB ]
                                                     |
                                                     +--> [ Redis (cache/session support) ]
```

## Application Flow
1. User hits a page in the Next.js App Router (e.g. `/`, `/domains`, `/hosting`, `/dashboard`).
2. Client-side calls hit the Express API under `/api/v1/...`.
3. Auth state is derived from the access token (short-lived) + httpOnly refresh cookie set by the backend.
4. Protected pages (dashboard) check auth state before rendering; unauthenticated users are redirected to login.

## Folder Structure (current)
```
app/                # Next.js App Router pages
  layout.tsx
  page.tsx
  globals.css
public/             # static assets (brand assets to be added later)
docs/               # this documentation set
```
As features are built, expect this to grow into route groups, e.g.:
```
app/
  (marketing)/            # public pages: home, domain search, hosting plans
  (auth)/login, register/
  (dashboard)/             # authenticated area
```
Confirm actual conventions in `node_modules/next/dist/docs/01-app` before restructuring — this project pins Next.js 16.2.11, which may differ from familiar App Router conventions.

## Technology Stack
- **Frontend:** Next.js 16.2.11 (App Router), React 19.2.4, TypeScript, Tailwind CSS 4
- **Package manager:** pnpm
- **Backend (external repo):** Node.js, TypeScript, Express.js, MongoDB + Mongoose, Redis (ioredis)
- **Auth:** JWT access + refresh tokens, httpOnly cookie for refresh token, bcrypt password hashing (all backend-side)
- **Validation (backend):** Zod
- **Hosting/Deployment:** TBD — ask before assuming Vercel or any specific provider
- **State management:** none chosen yet — default to React Server Components + minimal client state until a real need for a client store appears
- **Styling:** Tailwind CSS 4

## Database Design
Owned by the backend repo, not this one. Known so far from backend README:
- `User` model (Mongoose) — role field (`admin` | `user`), bcrypt-hashed password.
- Domain/hosting purchase models — **not yet documented**; confirm with backend before building purchase/dashboard screens that assume a specific shape.

## API Architecture
Base pattern: REST, versioned under `/api/v1`.

**Confirmed endpoints (from backend README):**
```
Auth
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
GET    /api/v1/auth/profile

Users (admin only, not used by this frontend)
POST   /api/v1/users
GET    /api/v1/users
GET    /api/v1/users/:userId
PATCH  /api/v1/users/:userId
DELETE /api/v1/users/:userId
```

**Not yet defined — confirm with backend before building:**
- Domain search / availability check endpoint
- Domain purchase endpoint
- Hosting plan listing / purchase endpoint
- Dashboard "my domains / my hosting" listing endpoint
- DNS settings read/update endpoint

Do not guess these paths — ask the user/backend team for the actual contract before wiring up domain/hosting features.

## Authentication Flow
1. **Register:** `POST /api/v1/auth/register` → creates user.
2. **Login:** `POST /api/v1/auth/login` → returns access token in response body; sets refresh token as httpOnly cookie.
3. **Session handling:** store access token in memory (not localStorage, to reduce XSS exposure); on 401, call `POST /api/v1/auth/refresh` (cookie sent automatically) to get a new access token; retry the original request once.
4. **Logout:** `POST /api/v1/auth/logout` clears the refresh cookie server-side; clear in-memory access token client-side.
5. **Authorization:** `GET /api/v1/auth/profile` returns the current user (including `role`). This frontend should only ever expect/handle `role: "user"` — an `admin` role logging in here should probably be redirected to the (separate, future) admin app rather than handled inline.

## Deployment Architecture
- **Production / Development environments:** not yet defined — ask before setting up CI/CD or hosting config.
- **CI/CD pipeline:** none configured yet.

## Third-Party Services
None integrated yet. Payment provider is a known future need (see `PRD.md` open questions) — do not hardcode a specific provider until confirmed.

## Scalability Considerations
- Frontend is stateless (Next.js), scales horizontally without special handling.
- Paginate any list UI (domains, hosting, users) rather than assuming small datasets.
- Backend/DB scaling is out of scope for this repo.

## AI-specific note
This project pins **Next.js 16.2.11**, a version with breaking changes relative to older/training-data conventions (see root `AGENTS.md`). Before writing App Router code (routing, data fetching, layouts, metadata, etc.), check `node_modules/next/dist/docs/01-app` (and `03-architecture` if relevant) rather than relying on prior knowledge of Next.js.
