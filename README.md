# LEVAKANT RESIDENCE — website

Production site for the LEVAKANT RESIDENCE residential building (Levakant, Tajikistan),
ported from the approved design mockup without redesign.

**Stack:** Next.js 16 (App Router, Turbopack, Cache Components) · React 19 · TypeScript (strict) ·
next-intl (`/ru`, `/tg`, `/en`) · zustand · three.js · Vitest · Playwright.

## Run

```bash
pnpm install
pnpm dev            # http://localhost:3000 → /ru
pnpm build && pnpm start
```

## Check

```bash
pnpm typecheck && pnpm lint
pnpm test           # unit: prices, filters, sun position, translations
pnpm test:e2e       # Playwright scenarios at 1440 / 834 / 390 (starts `pnpm start`)
```

To reuse an installed Chromium instead of downloading one:
`PLAYWRIGHT_CHROMIUM_EXECUTABLE=/path/to/chrome pnpm test:e2e`. Against a running server: `BASE_URL=http://localhost:3000`.

## Layout

| Path | What |
|---|---|
| `src/app/[locale]/` | root layout (fonts, CSS, i18n provider) and the one-page site |
| `src/components/sections/` | one component per mockup section (`<!--s:name-->` in the mockup source) |
| `src/lib/` | ported mockup logic: `store` (page state), `pricing`, `catalog`, `explorer` (3D building + floor plan), `sun`, `drag`, `gallery`, `actions` |
| `src/styles/` | mockup CSS, verbatim, in its original layer order (`main → v4 → v5 → v6 → v7 → v8`) |
| `src/content/` | project data: `levakant-data.json` (source) → `data.{ru,tg,en}.json` (generated), demo `pricing.ts`, demo `site.ts` contacts |
| `messages/` | UI strings per locale (next-intl, ICU) |
| `tools/i18n/` | mockup dictionary + scripts: `pnpm data:build`, `pnpm i18n:fill` |
| `public/assets`, `public/3d`, `public/fonts` | renders, plans, masks, GLB model, self-hosted fonts |

## Content rules

- Prices, payment terms, dates and contacts are **demo values from the mockup** (`isDemo: true` in
  `src/content/pricing.ts` and `src/content/site.ts`). While any is demo, the footer says so.
- New UI string: add it to `messages/ru.json`, run `pnpm i18n:fill` (prefills TJ/EN from the mockup
  dictionary, lists what needs a human), put hand translations into `tools/i18n/manual.json`.
  `pnpm test` fails if TJ/EN miss a key or still contain Russian.
- TJ and EN texts are drafts and need proofreading by native speakers.
