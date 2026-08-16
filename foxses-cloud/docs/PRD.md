# PRD.md — Product Requirements Document

## Project Overview
- **Name:** foxses-cloud
- **Description:** Customer-facing web platform for buying domains and hosting plans.
- **Purpose:** Let users search and purchase domains, buy hosting packages, and manage what they've bought (renewals, DNS) from one dashboard.
- **Scope of this repo:** Frontend only (Next.js). The backend (Node.js/TypeScript/Express/MongoDB) already exists as a separate project. The admin panel will be a separate application — **not** built in this repo.

## Goals & Objectives
- Primary goal: ship a working customer flow — search domain → add to cart → checkout → manage purchase.
- Business objective: sell domains and hosting plans online with self-service account management.
- Expected outcome: users can register, buy a domain and/or hosting plan, and manage those purchases without manual/admin intervention.

## Target Users
- **Persona: New buyer** — wants to register a domain and/or get hosting quickly, minimal friction at checkout.
- **Persona: Existing customer** — logs in to renew a domain, upgrade a hosting plan, or update DNS settings.
- **Role model:** `user` and `admin` roles exist in the backend (RBAC), but this frontend only needs to serve the `user` role. Admin-only actions are out of scope here.

## Problem Statement
Customers need a single place to search, buy, and manage domains and hosting without going through a generic registrar UI. This platform gives foxses-cloud direct control over the purchase and management experience, tied to its own backend.

## Core Features (this repo's scope)
1. **Domain search & purchase** — check domain availability, add to cart, checkout.
2. **Hosting plans & purchase** — browse hosting packages (e.g. shared/VPS/cloud tiers), select and buy.
3. **User dashboard** — view/manage owned domains and hosting, renewals, DNS settings.
4. **Auth** — register, login, logout, session/token refresh, profile view (backed by existing `/api/v1/auth/*` endpoints).

## Explicitly Out of Scope (for this repo)
- Admin panel (separate application, separate build).
- Backend changes — this repo consumes the existing API; it does not modify it.

## User Flow (happy path)
1. Visitor lands on homepage → searches a domain.
2. Sees availability + price → adds to cart (optionally adds a hosting plan).
3. Registers or logs in.
4. Checks out (payment step — provider TBD).
5. Lands on dashboard, sees the new domain/hosting listed.
6. Later: returns to renew, or edit DNS, from the dashboard.

## Functional Requirements
- Domain search must show availability and price before requiring login.
- Login/register required before checkout.
- Dashboard must list all domains/hosting tied to the logged-in user's account.
- Session must persist via refresh token flow (silent refresh) without forcing re-login on every visit.

## Non-Functional Requirements
- **Performance:** fast domain-search response perception (loading states, no full-page reloads for search).
- **Security:** never store the JWT access token in a way that's readable by injected scripts if avoidable; rely on backend's httpOnly refresh cookie; sanitize all form input.
- **Accessibility:** forms and dashboard usable via keyboard, sufficient color contrast (see `design.md`).
- **Scalability:** not a backend concern for this repo, but UI should not assume small/fixed lists (paginate domain/hosting lists).
- **Reliability:** handle API/network failures gracefully (retry/backoff or clear error messaging), never fail silently on checkout.

## Success Criteria
- A user can go from domain search to a purchased, dashboard-visible domain/hosting plan without developer intervention.
- Auth flow (login/refresh/logout) works reliably across page reloads.

## Future Improvements
- Payment provider integration (not yet decided).
- DNS record management UI depth (currently just "DNS settings" placeholder).
- Notifications (renewal reminders, expiry warnings).

## Open Questions (ask the user before building the related feature)
- Which payment gateway will be used at checkout?
- What are the actual domain/hosting purchase API endpoints? (Backend README only documents `auth` and `users` endpoints so far — domain/hosting endpoints are TBD, confirm with backend before building those screens.)
- Final brand colors/logo — currently using a default modern theme (see `design.md`); swap in once provided.
