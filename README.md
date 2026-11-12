# LEVAKANT RESIDENCE — website

Production site for the LEVAKANT RESIDENCE residential building (Levakant, Tajikistan),
ported from the approved design mockup and prepared for launch.

**Stack:** Next.js 16 (App Router, Turbopack, Cache Components) · React 19 · TypeScript (strict) ·
next-intl (`/ru`, `/tg`, `/en`) · zustand · three.js · zod · Vitest · Playwright + axe-core.

## Run

```bash
pnpm install
cp .env.example .env.local   # fill in only what the owner has confirmed
pnpm dev                     # http://localhost:3000 → /ru
pnpm build && pnpm start
```

## Check

```bash
pnpm check          # lint + typecheck + unit tests (prices, filters, sun, translations, leads API)
pnpm test:e2e       # Playwright at 1440 / 834 / 390: scenarios, 3D, languages, axe WCAG A/AA, content rules
```

Visual parity with the approved mockup (every section, 3D canvases masked; sections changed on purpose are listed
in `tests/visual/parity.spec.ts`):

```bash
(cd ../levakant-export/levakant-site && python3 -m http.server 4173) &
MOCKUP_URL=http://127.0.0.1:4173/ pnpm test:visual
```

Reuse an installed Chromium: `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/path/to/chrome`; test a running server: `BASE_URL=…`.
CI (`.github/workflows/ci.yml`) runs `check`, `build` and the e2e suite.

## Owner data and content rules

Nothing is invented. Everything the owner must confirm comes from environment variables (`.env.example`):

| What | Variables | Not set → |
|---|---|---|
| Phone, WhatsApp, Telegram, e-mail, socials, office, hours | `CONTACT_*` | the line / button is not shown |
| Map links (2GIS, Google) | `MAP_2GIS_URL`, `MAP_GOOGLE_URL` | links hidden (plot coordinates not confirmed) |
| Documents (PDF) | `DOC_*_URL` | status «Ожидается» instead of «PDF» |
| Privacy policy | `PRIVACY_POLICY_URL` | consent text without a link; the form does not accept enquiries |
| Developer's address to buyers | `DEVELOPER_QUOTE_APPROVED=1` | hidden (draft) |
| Construction photo channel | `CONSTRUCTION_CHANNEL_URL` | line hidden |
| Indexing | `SITE_INDEXABLE=1` (the build fails unless `NEXT_PUBLIC_SITE_URL` is a real https domain) | `noindex` + `robots.txt` disallow |
| Analytics | `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_YM_ID`, `NEXT_PUBLIC_META_PIXEL_ID` | no tracker loaded; `track()` calls are no-ops |

Public values are applied at **build** time (pages are prerendered) — rebuild after changing them.

Prices, payment terms and dates are the mockup's examples (`src/content/pricing.ts`, `isDemo: true`): they carry the
designers' «ДЕМО» mark and the footer disclaimer until real data replaces them.

## Enquiries

`POST /api/leads` (`src/app/api/leads/route.ts`): same-origin check, zod validation, honeypot, 5 requests / 10 min per
IP (the address the edge appends — the rightmost `X-Forwarded-For` entry) and 60 / 10 min in total, delivery to a
Telegram chat (`LEADS_TELEGRAM_BOT_TOKEN`, `LEADS_TELEGRAM_CHAT_ID`) and/or a webhook (`LEADS_WEBHOOK_URL`,
`LEADS_WEBHOOK_SECRET`). These are read at request time. The form shows success **only** after a channel confirms
delivery; without a channel and a privacy policy it says it is not connected and keeps what was typed. No personal
data is logged.

Security headers (`next.config.ts`): CSP in production (`'self'` plus the configured analytics hosts), `nosniff`,
`Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, HSTS on an https site URL. The rate limiter is in memory:
one Node process; behind several instances move it to Redis or the edge.

## Shareable state

`?apt=<layout id>` opens the catalogue on that layout (the "Поделиться" button copies such a link); the language
switch keeps the selected layout and the reading position.

## 3D

The engine (`src/engine/`) and the GLB model load only when a 3D section is ~1.5 screens away (separate ~170 KB gzip
chunk + 3 MB model). A status chip tells the truth: loading, failed (static scheme shown), or off — no WebGL2,
`prefers-reduced-motion`, ≤2 GB memory or Save-Data — with an opt-in button. Modest devices get a lighter render
(no bloom, lower resolution and shadow map). `?3d=1` / `?3d=0` force either mode. State changes reach the engine
right after the next paint, so the clicked control responds first. Keyboard: focus the model (Tab) and use the arrow keys
to rotate / tilt — the live 3D building, the CSS models and the sun scene.

## Performance notes

Hero render: AVIF/WebP variants (`pnpm images` → `public/assets/r/`) with a matching preload; photos through
`next/image`; technical plans lazy at full resolution with intrinsic sizes (they zoom to 220 %); sections below the
hero use `content-visibility: auto`; decorative backgrounds of far sections wait for `near`; the 3D chunk is lazy.
Production should sit behind an HTTP/2 + brotli edge (Caddy) — measured LCP is ~0.6 s better than plain `next start`.

## Layout

| Path | What |
|---|---|
| `src/app/[locale]/` | root layout (fonts, CSS, metadata) and the one-page site; `src/app/api/leads` |
| `src/components/sections/` | one component per mockup section |
| `src/lib/` | page logic (`store`, `pricing`, `catalog`, `explorer`, `sun`, …), `config` (owner data), lead schema/delivery |
| `src/engine/` | 3D engine, lazy mount, capability check |
| `src/styles/` | mockup CSS verbatim in layer order (`main → v4 … v8`) + `70-launch.css` (launch additions) |
| `src/content/` | project data (`levakant-data.json` → `data.{ru,tg,en}.json`), demo pricing, image sizes |
| `messages/` | UI strings (ICU); `tools/i18n/` — dictionary, `pnpm data:build`, `pnpm i18n:fill` |
| `tools/images.mjs` | derived images (hero variants, social preview, size manifest) |

TJ and EN texts are drafts and need proofreading by native speakers.
