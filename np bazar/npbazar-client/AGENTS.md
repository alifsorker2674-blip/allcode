<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->


## Design Rules
- Theme colors are admin-configurable (Settings → Appearance) and applied as CSS
  variables set on `<html>` in `app/layout.tsx`. NEVER hardcode brand colors in
  components — always use the variables:
  - `var(--primary)` (default #df0000): prices, badges, links, hover accents
  - `var(--btn-color)` (default #f97316): Add to Cart / CTA buttons
  - `var(--nav-bg)` (default #0b2221): dark navbar / utility bar background
  - `var(--background)` (default #fbf9f5): page background
- No box shadows allowed anywhere.
- Maximum Border Radius: 8px.
