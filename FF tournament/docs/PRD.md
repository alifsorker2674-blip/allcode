# PRD.md — Product Requirements Document

## Project Overview

- **Project name:** Royal Clans
- **Short description:** Royal Clans is an **Esports Tournament Marketplace** — not just a tournament-listing site. It combines Tournament Hosting, a Wallet-based economy, instant Quick Match matchmaking, and Clan/Ranking systems into one platform.
- **Purpose:** Give any gamer a place to (1) join tournaments, (2) create and run their own tournament as an organizer, (3) play instant 1v1/solo Quick Matches for cash, and (4) build a Clan and climb a ranking ladder — all backed by a single wallet and fully controllable from the admin panel. Launches with **Free Fire** and **Blood Strike**, built so any competitive game can be added later without a redesign.

## Goals & Objectives

**Primary goal:** build a central esports platform where:
- Players join tournaments.
- Players create their own tournaments.
- Organizers run tournaments like a business (earnings, dashboard, payouts).
- The platform earns a **service fee from every tournament and every Quick Match**.
- Quick Match enables instant, on-demand paid matches.
- All prize money flows through the **Wallet**.

**Business objectives**
- Multiple monetized revenue streams (see [Revenue Model](#revenue-model)), not just entry fees.
- High repeat engagement via Quick Match (fast, low-friction, always available) alongside scheduled tournaments.
- Trust and retention via fair, verifiable match results and a transparent wallet ledger.

**Expected outcomes**
- Steady volume of both organizer-hosted tournaments and Quick Match games.
- Growing clan ecosystem with active ranking/leaderboard competition.
- Predictable, auditable platform revenue from fees.

## Target Users

- **Guest** — can view tournaments, leaderboards, and winners; cannot transact.
- **Player** — creates an account, recharges wallet, joins tournaments, plays Quick Match, joins a clan, wins prizes, withdraws money.
- **Organizer** — creates tournaments, sets entry fee and prize pool, approves/manages players, publishes results. (Any player can act as an organizer by creating a tournament and paying the platform's create fee — it is a capability, not a separate signup type.)
- **Admin** — manages all users, verifies payments, resolves disputes, and runs the platform end-to-end.

## Problem Statement

Free Fire and Blood Strike tournaments today are organized informally (Facebook groups, Discord, direct mobile payments) with no verification trail, no fair dispute process, and no instant way to just "play a match for money" outside a scheduled event. Royal Clans solves this with: a structured **Tournament Marketplace** (anyone can host, platform takes a fee), an always-available **Quick Match** system for instant paid 1v1 play, a **Wallet** as the single source of truth for money movement, and a **screenshot-based dual-confirmation result system** that works without needing an official game API (since Free Fire/Blood Strike don't provide one) — with Admin as the final arbiter on disputes.

## Core Features

### 1. Tournament Marketplace
The platform's central feature — anyone can create a tournament, not just admins.
- Organizer sets: game, mode (Solo/Duo/Squad), entry fee, slot count, prize pool, rules, schedule.
- **Dynamic Tournament Create Fee**, scaled by slot count, admin-configurable. Example default table:

  | Slots | Platform Fee |
  |---|---|
  | 2 | ৳5 |
  | 10 | ৳20 |
  | 25 | ৳50 |
  | 50 | ৳100 |
  | 100 | ৳200 |
  | 500 | ৳800 |

  The admin can edit this fee table at any time from the admin panel.
- Organizer pays the create fee from their wallet when submitting the tournament; the tournament is published once approved (see [Match Validation](#match-validation-no-official-api) and admin workflow).

### 2. Quick Match System
Instant, on-demand matchmaking — the platform's differentiator versus a plain tournament site.
- Player picks a game and an entry fee, and enters a **queue**.
- When a second player with a matching entry fee joins the queue, the system pairs them and creates a match/room.
- Both players play; the winner receives the pooled entry (minus platform's Quick Match service fee) directly to their wallet.
- Example: two players each pay ৳20 entry → pool ৳40 → winner gets ৳30, platform keeps ৳10. Exact split is admin-configurable.
- Result confirmation follows the same dual-screenshot validation as tournament matches.

### 3. Wallet System
Every user has one wallet; **every** money movement goes through it:
- Deposit (manual bKash/Nagad transaction ID, admin-approved)
- Withdraw (user request, admin-approved payout)
- Tournament entry fee
- Tournament create fee
- Quick Match entry fee
- Prize/winnings receipt
- Refunds (e.g. cancelled tournament, under-review match resolved in a player's favor)

The wallet balance is always a derived sum of approved ledger transactions — never a directly editable field (see [rules.md](rules.md)).

### 4. Clan System
- Create a clan, invite/manage members, set a clan logo.
- View clan ranking and a dedicated clan leaderboard.
- Play clan-vs-clan tournaments (squad-mode tournaments tied to clan rosters).

### 5. Ranking System
Per-player (and per-clan) tiers based on performance/points, in ascending order:

`Bronze → Silver → Gold → Platinum → Diamond → Heroic → Grandmaster`

Points/rating update after verified tournament and Quick Match results.

### 6. Leaderboard
Multiple views: **Global**, **Monthly**, **Weekly**, **Game-wise**, **Clan-wise**.

### 7. Match Validation (No Official API)
Free Fire and Blood Strike don't expose an official results API, so validation is manual-but-structured:
1. Both players/teams upload a screenshot of the match result at the end of a match.
2. If both sides independently select the same winner, the result is **auto-confirmed**.
3. If the selections don't match (or a screenshot is missing/disputed), the match status becomes **"Under Review"**.
4. Admin reviews the submitted screenshots/video and makes the final call.
5. (Future) OCR/AI-assisted screenshot verification can be added later to reduce manual admin load — the result-submission flow should be designed so this can slot in without changing the API contract.

### 8. Organizer Dashboard
Organizers can see: earnings, total tournaments, active tournaments, participant counts, revenue, prize distribution status, and can request a withdrawal of their organizer earnings.

### 9. Admin Dashboard (full platform control)
Admin can manage: Users, Wallets, Transactions, Payments (deposit/withdraw/create-fee approvals), Tournaments (approval queue), Reports/Analytics, Support, **Disputes** (under-review match resolution), and Settings (fee tables, banners, announcements).

## Revenue Model

The platform earns from multiple streams, not entry fees alone:
- Tournament Create Fee (dynamic, by slot count)
- Tournament Entry Service Fee
- Quick Match Service Fee
- Withdrawal Charge
- Featured Tournament placement (future)
- Organizer Pro Subscription (future)
- Sponsored Tournament (future)
- Banner Advertisement (future)
- Clan Premium (future)
- VIP Membership (future)

All fee amounts/percentages must be admin-configurable, not hardcoded, since they are expected to change as the business tunes pricing.

## User Flow

**Player — join a scheduled tournament**
1. Register → verify → deposit via bKash/Nagad transaction ID → admin approves → wallet credited.
2. Browse Tournament Marketplace → open a tournament → join (entry fee deducted from wallet).
3. Play the match → upload result screenshot → auto-confirm or admin resolves if under review.
4. If winner: prize credited to wallet → optional withdrawal request → admin processes.

**Player — Quick Match**
1. Pick game + entry fee → enter queue.
2. System pairs with another queued player → room/match created.
3. Play → both upload screenshots → auto-confirm or dispute → admin resolves if needed.
4. Winner's wallet credited instantly upon confirmation (minus platform's Quick Match fee).

**Organizer — host a tournament**
1. Fill out tournament creation form (game, mode, entry fee, slots, prize pool, rules, schedule).
2. Platform calculates the create fee from slot count → organizer pays from wallet.
3. Tournament goes to admin review → approved → published on the Marketplace.
4. Organizer manages registrations, oversees match results, views earnings on the Organizer Dashboard, and can withdraw net revenue.

**Admin**
1. Reviews pending: deposits, withdrawals, tournament-create requests, and under-review match disputes.
2. Approves/rejects each with a recorded reason.
3. Configures platform-wide settings: fee tables, banners, announcements.
4. Monitors reports (revenue, active tournaments/matches, user growth, dispute volume).

## Functional Requirements

- Registration requires a unique, verified email or phone number.
- Wallet balance is always derived from the sum of `approved` transactions — no direct balance edits, anywhere, by anyone including admin (admin actions must go through a transaction record, e.g. an "adjustment" transaction type, for auditability).
- A tournament cannot be publicly listed until admin-approved; a Quick Match cannot start until both sides have paid their entry fee into escrow (held as a pending debit) from their wallets.
- Quick Match queue pairing must only match players who selected the same game and the same entry-fee tier.
- Match results require screenshot submission from all match participants before auto-confirmation logic runs; mismatched or missing submissions must always route to "Under Review," never auto-resolve in anyone's favor.
- Every fee (tournament create fee table, entry service fee %, Quick Match fee %, withdrawal charge) must be stored in an admin-editable settings collection, not hardcoded in application logic.
- Ranking points update only from confirmed (not disputed/pending) match results.
- All admin actions on money or disputes must be logged with admin id and timestamp.

## Non-Functional Requirements

- **Performance:** tournament/marketplace listing and Quick Match queue matching should feel near-instant (queue pairing checked on a short interval or event-driven, not slow polling).
- **Security:** JWT auth, role-based access (`player`/`organizer capability`/`admin`), strict server-side validation on every wallet-affecting endpoint, rate limiting on auth, deposit-submission, and queue-join endpoints.
- **Accessibility:** usable on mobile-first (most players will be on phones), keyboard-navigable admin panel, adequate contrast for a dark gaming theme.
- **Scalability:** stateless API so it can scale horizontally; Quick Match queue and leaderboard are the most write/read-heavy paths and should be designed with indexing/caching in mind from the start.
- **Reliability:** no silent failures on any wallet-affecting operation; all disputes must be visibly queued for admin, never dropped.

## Success Criteria

- Number of tournaments and Quick Matches completed per week/month.
- Ratio of auto-confirmed vs. under-review matches (lower dispute rate = healthier trust system).
- Average admin turnaround time on payment approvals and disputes.
- Active clans and ranked players.
- Platform revenue across all fee types.

## Future Improvements

- Mobile App (Android/iOS)
- Discord Bot
- Live Streaming Integration
- AI Match Analysis / OCR-based screenshot verification
- Team Recruitment features
- Esports News section
- Public API (for third parties/communities to plug into Royal Clans)
- Multi-language support
- Expansion beyond Free Fire/Blood Strike to any competitive game, using the same Tournament Marketplace + Wallet + Quick Match core.
