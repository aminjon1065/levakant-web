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

Visual parity with the approved mockup (every section at 1440 / 834 / 390, 3D canvases masked):

```bash
(cd ../levakant-export/levakant-site && python3 -m http.server 4173) &
MOCKUP_URL=http://127.0.0.1:4173/ pnpm test:visual
```

To reuse an installed Chromium instead of downloading one:
`PLAYWRIGHT_CHROMIUM_EXECUTABLE=/path/to/chrome pnpm test:e2e`. Against a running server: `BASE_URL=http://localhost:3000`.

## Layout

| Path | What |
|---|---|
| `src/app/[locale]/` | root layout (fonts, CSS, i18n provider) and the one-page site |
| `src/components/sections/` | one component per mockup section (`<!--s:name-->` in the mockup source) |
| `src/lib/` | ported mockup logic: `store` (page state), `pricing`, `catalog`, `explorer` (3D building + floor plan), `sun`, `drag`, `gallery`, `actions` |
| `src/engine/` | 3D engine (three.js): building explorer and sun scene; lazy chunk, `useStage` mounts it near the viewport, `capability` decides 3D vs static |
| `src/styles/` | mockup CSS, verbatim, in its original layer order (`main → v4 → v5 → v6 → v7 → v8`) |
| `src/content/` | project data: `levakant-data.json` (source) → `data.{ru,tg,en}.json` (generated), demo `pricing.ts`, demo `site.ts` contacts |
| `messages/` | UI strings per locale (next-intl, ICU) |
| `tools/i18n/` | mockup dictionary + scripts: `pnpm data:build`, `pnpm i18n:fill` |
| `public/assets`, `public/3d`, `public/fonts` | renders, plans, masks, GLB model, self-hosted fonts |

## 3D

The engine and the GLB model load only when the 3D section is ~1.5 screens away (separate ~170 KB gzip chunk + 3 MB model).
Until the first frame — and on devices without WebGL2, with ≤2 GB memory, Save-Data or `prefers-reduced-motion` —
the static scheme from the mockup is shown. `?3d=1` / `?3d=0` force either mode.

## Content rules

- Prices, payment terms, dates and contacts are **demo values from the mockup** (`isDemo: true` in
  `src/content/pricing.ts` and `src/content/site.ts`). While any is demo, the footer says so.
- New UI string: add it to `messages/ru.json`, run `pnpm i18n:fill` (prefills TJ/EN from the mockup
  dictionary, lists what needs a human), put hand translations into `tools/i18n/manual.json`.
  `pnpm test` fails if TJ/EN miss a key or still contain Russian.
- TJ and EN texts are drafts and need proofreading by native speakers.
