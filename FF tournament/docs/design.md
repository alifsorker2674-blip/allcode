# design.md — Design System

## Brand Identity

- **Brand name:** Royal Clans
- **Feel:** competitive esports platform — bold, dark, "royal + fire" — not a generic corporate SaaS look. Should feel at home next to Free Fire/Blood Strike's own visual language.
- **Logo:** placeholder crest/shield motif (royal) combined with a spark/flame accent (fire) — to be finalized with an actual logo asset; until then use a wordmark in the heading font.
- **Brand guidelines:** dark theme is the default/primary experience (gamers expect it); a light theme is supported but secondary.

## Color Palette

CSS variables so both `royal-clans` and `admin-panel` share one source of truth (define once, import in both).

| Token | Value (dark, default) | Usage |
|---|---|---|
| `--color-bg` | `#0B0E14` | app background |
| `--color-surface` | `#141826` | cards, panels |
| `--color-surface-raised` | `#1C2136` | modals, dropdowns |
| `--color-primary` | `#D4AF37` (gold) | primary actions, "Royal" accent, active tier highlight |
| `--color-secondary` | `#E63946` (fire red) | secondary accent, live/urgent indicators |
| `--color-success` | `#22C55E` | approved, confirmed, wins |
| `--color-warning` | `#F59E0B` | pending review, under-review matches |
| `--color-error` | `#EF4444` | rejected, disputes, errors |
| `--color-text` | `#F5F5F5` | primary text |
| `--color-text-muted` | `#9CA3AF` | secondary text |
| `--color-border` | `#2A3040` | dividers, card borders |

**Light theme** overrides: `--color-bg: #F7F7F8`, `--color-surface: #FFFFFF`, `--color-text: #111318`, `--color-text-muted: #6B7280`, `--color-border: #E5E7EB` — accents (`primary`/`secondary`/status colors) stay the same across both themes for brand consistency.

## Typography

- **Headings:** a condensed/technical display font with an esports feel (e.g. `Rajdhani` or `Orbitron`) — used for tournament titles, section headers, and rank badges.
- **Body:** a clean, highly readable sans-serif (e.g. `Inter` or `Poppins`) for everything else — forms, tables, descriptions.
- **Scale:** `xs 12px / sm 14px / base 16px / lg 18px / xl 20px / 2xl 24px / 3xl 30px / 4xl 36px`.
- **Weights:** headings 600–700, body 400 (regular) / 500 (emphasis).

## Spacing System

`4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px` — always pick from this scale, no arbitrary pixel values in components.

## Border Radius

`sm: 4px` (badges, chips) · `md: 8px` (buttons, inputs) · `lg: 12px` (cards) · `xl: 16px` (modals) · `full` (avatars, tier badges).

## Shadows (Elevation)

- `elevation-1`: subtle card shadow (resting state).
- `elevation-2`: hover/raised state (tournament card hover, dropdown).
- `elevation-3`: modal/overlay.
- On dark backgrounds, prefer a subtle border + slight glow over heavy black shadows, which read poorly on dark UIs.

## Icons

- **Library:** `lucide-react` — consistent stroke-based icon set, tree-shakeable, matches a modern gaming-adjacent aesthetic.
- Rank-tier icons (Bronze → Grandmaster) and game icons (Free Fire, Blood Strike) are custom assets, not from the icon library.

## Buttons

- **Primary** — solid gold (`--color-primary`) background, dark text — main call-to-action (Join Tournament, Deposit, Create Tournament).
- **Secondary** — solid fire-red (`--color-secondary`) — used sparingly for high-urgency actions (Quick Match "Find Match Now").
- **Outline** — bordered, transparent background — secondary actions (Cancel, View Details).
- **Ghost** — no border/background, text-only — tertiary/inline actions (table row actions).
- **Danger** — red fill — destructive/admin actions (Reject, Ban User, Resolve Dispute Against).
- All buttons: `md` border radius, consistent padding scale, disabled state at 40% opacity with no hover effect.

## Forms

- Inputs: `--color-surface` background, `--color-border` border, `--color-primary` border on focus (with a subtle focus ring for accessibility).
- Labels: `sm` size, `--color-text-muted`, positioned above the input.
- Validation errors: `--color-error` text directly below the field, plus an error-colored border on the field itself.
- Money-input fields (entry fee, prize pool, deposit amount) always show the currency symbol (৳) as a fixed prefix, never editable text.

## Components

- **Cards** (`TournamentCard`, `ClanCard`, `MatchCard`) — `--color-surface` background, `lg` radius, `elevation-1`, hover → `elevation-2` + slight scale.
- **Tables** (admin panel: users, transactions, disputes) — zebra-free, border-based row separation (`--color-border`), sticky header on scroll, row hover highlight.
- **Modals** (confirm join, screenshot upload, admin approve/reject) — centered, `elevation-3`, dimmed backdrop, `xl` radius.
- **Alerts/Banners** — colored left-border + tinted background matching status (success/warning/error), used for wallet notices, dispute status, approval results.
- **Dropdowns** — `--color-surface-raised` background, `md` radius, `elevation-2`.
- **Navigation** — persistent sidebar in `admin-panel` (collapsible on mobile); top nav + bottom tab bar on mobile for `royal-clans` (players are mobile-first).
- **Pagination** — simple numbered pagination with prev/next, consistent across all list views (tournaments, transactions, users).
- **Rank Tier Badge** — pill-shaped, tier-specific color/icon (Bronze `#CD7F32` → Grandmaster gradient gold/red), used on profile, leaderboard, and clan pages.
- **Status Pill** — small rounded chip using status colors, for tournament status, transaction status, and match/dispute status everywhere in the UI, so the same status always looks the same regardless of which screen it's on.

## Responsive Design

Mobile-first, since most players will use Royal Clans on a phone.

| Breakpoint | Width |
|---|---|
| Mobile | `< 640px` |
| Tablet | `640px – 1024px` |
| Laptop | `1024px – 1440px` |
| Desktop | `1440px – 1920px` |
| Large screens | `> 1920px` |

`admin-panel` can assume tablet+ as the primary target (staff on a computer) but must not break on mobile as a fallback.

## Animations

- **Transition duration:** `150ms` for micro-interactions (button hover, focus), `250ms` for component transitions (modal open, dropdown), `400ms` for page-level transitions.
- **Hover effects:** subtle elevation/scale increase on cards and buttons — no large jumps.
- **Loading states:** skeleton loaders for lists/cards (tournament list, leaderboard) instead of spinners where content shape is predictable; a spinner only for actions with no predictable layout (submit button pending state).
- **Quick Match waiting state:** a pulsing/searching animation while in queue — this is a key emotional moment (waiting for an opponent) and should feel alive, not static.
- **Page transitions:** simple fade, no heavy route-transition choreography.

## Accessibility

- Maintain at least **4.5:1** contrast ratio for body text against its background in both themes; verify the gold/red accents specifically against the dark background.
- All interactive elements reachable and operable via keyboard (tab order, visible focus states using `--color-primary` outline).
- Screen-reader labels on icon-only buttons (e.g. a bare "X" close icon must have `aria-label="Close"`).
- Status conveyed by color (approved/pending/rejected, confirmed/under-review) must always be paired with text or an icon — never color alone.
