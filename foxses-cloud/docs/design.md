# design.md — Design System

> **Status:** default placeholder theme. No brand colors/logo have been provided yet — swap the values below once they are (see `PRD.md` open questions). Do not treat these as final brand decisions.

## Brand Identity
- **Brand name:** foxses-cloud
- **Logo:** none yet — placeholder wordmark ("foxses-cloud") until a logo file is provided (will live in `public/`).

## Color Palette (default — placeholder)
- **Primary:** `#4F46E5` (indigo-600) — main CTAs, links, active states
- **Secondary:** `#0EA5E9` (sky-500) — supporting accents
- **Accent:** `#22C55E` (green-500) — success highlights, "available" domain status
- **Success:** `#16A34A`
- **Warning:** `#F59E0B`
- **Error:** `#DC2626`
- **Neutral scale:** Tailwind's default `gray` (50–900) for text/backgrounds/borders

## Themes
- **Light theme (default):** background `gray-50`, surface `white`, text `gray-900`
- **Dark theme:** background `gray-950`, surface `gray-900`, text `gray-100`
- Implement via Tailwind's `dark:` variant, toggled by system preference initially (`prefers-color-scheme`); add a manual toggle later if needed.

## Typography
- **Font family:** Geist Sans (already configured in `app/layout.tsx` via `next/font/google`), Geist Mono for code/monospace contexts.
- **Font sizes (Tailwind scale):** `text-sm` (14px) body-secondary, `text-base` (16px) body, `text-lg`/`text-xl` subheadings, `text-2xl`–`text-4xl` headings.
- **Font weights:** `font-normal` body, `font-medium` labels/buttons, `font-semibold`/`font-bold` headings.
- **Headings:** `h1` `text-4xl font-bold`, `h2` `text-2xl font-semibold`, `h3` `text-xl font-semibold`.
- **Paragraphs:** `text-base text-gray-700 dark:text-gray-300`, line-height relaxed.

## Spacing System
Tailwind default scale, used consistently: `4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px`.

## Border Radius
- Small controls (inputs, badges): `rounded-md` (6px)
- Cards/panels: `rounded-lg` (8px) or `rounded-xl` (12px)
- Buttons: `rounded-md`

## Shadows (elevation)
- Level 1 (cards): `shadow-sm`
- Level 2 (dropdowns/popovers): `shadow-md`
- Level 3 (modals): `shadow-xl`

## Icons
- Preferred library: `lucide-react` (not yet installed — add when the first icon is needed, per `rules.md`'s "add only when needed" rule).

## Buttons
- **Primary:** solid primary color background, white text — main CTA (e.g. "Search domain", "Buy now").
- **Secondary:** solid secondary/neutral background — supporting actions.
- **Outline:** transparent background, primary-color border/text — lower-emphasis actions.
- **Ghost:** no border/background, text-only, hover background tint — tertiary actions (e.g. "Cancel").
- **Danger:** error-color background/text — destructive actions (e.g. "Delete domain", "Cancel plan").

## Forms
- **Inputs:** `rounded-md border-gray-300 focus:ring-2 focus:ring-primary`, clear placeholder text.
- **Labels:** `text-sm font-medium text-gray-700`, always visible (no placeholder-as-label).
- **Validation styles:** error border in `error` color + inline message below the field in `text-sm text-error`.
- **Error messages:** specific and actionable (e.g. "This domain is already taken" not "Invalid input").

## Components
- **Cards:** used for domain search results, hosting plan tiers, dashboard items — `rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4/6`.
- **Tables:** used in dashboard lists (my domains, my hosting) — striped rows optional, sticky header for long lists.
- **Modals:** used for confirmations (e.g. "Confirm purchase", "Cancel renewal") — centered, `shadow-xl`, dismissible via overlay click + Escape key.
- **Alerts:** inline banners for success/warning/error states (e.g. "Domain purchased successfully", "Renewal due in 7 days").
- **Dropdowns:** used for account menu, plan selection.
- **Navigation:** top nav for marketing pages (home, domains, hosting, login), sidebar nav for dashboard.
- **Pagination:** used on any list that could exceed one screen (domain search results, dashboard lists).

## Responsive Design (breakpoints — Tailwind defaults)
- **Mobile:** default (< 640px)
- **Tablet:** `sm:` 640px, `md:` 768px
- **Laptop:** `lg:` 1024px
- **Desktop:** `xl:` 1280px
- **Large screens:** `2xl:` 1536px

## Animations
- **Transition duration:** 150–200ms for hover/focus states, 250–300ms for modals/dropdowns.
- **Hover effects:** subtle background/opacity shift, no large scale/transform on interactive controls.
- **Loading animations:** skeleton loaders for domain search results and dashboard lists (avoid full-page spinners where possible).
- **Page transitions:** none by default — rely on Next.js's native navigation; add only if there's a specific UX need.

## Accessibility
- **Contrast ratios:** meet WCAG AA (4.5:1 for body text) — verify primary color against white/dark backgrounds once real brand colors are set.
- **Keyboard navigation:** all interactive elements (search, cart, checkout, dashboard actions) must be reachable and operable via keyboard alone.
- **Screen reader support:** meaningful `alt` text on any real images/logo; proper labels on all form inputs; ARIA roles on custom components (modals, dropdowns).
- **Focus states:** visible focus ring (`focus-visible:ring-2`) on all interactive elements — never remove outline without replacing it.
