# alam-dashboard

A mobile-first view of Malaysia's air quality, weather, official forecasts and
environmental hazards. Reads the `alam-api` service; talks to no upstream directly.

## Stack

- **Svelte 5** (runes) + **Vite** + **Tailwind v4**
- **Leaflet** for maps, with a CARTO basemap that follows the theme (light/dark)
- No chart library: one hand-rolled SVG `TrendChart` instead of ~45 KB of uPlot
- **vitest** + jsdom + the Svelte plugin (62 tests, including runes modules)
- Installable **PWA**: manifest, icons, service worker (registered in production only)

## Architecture

Layers point one way — `routes → features → ui / domain → core`. Nothing at a lower
layer imports from a higher one.

| Folder      | Responsibility                                                                 |
| ----------- | ------------------------------------------------------------------------------ |
| `core/`     | Platform + app services: API client, state store, async helper, location, push, theme, i18n, shell config, deployment config. |
| `domain/`   | Pure, framework-free logic and formatting: bands/colours, WMO codes, warnings, share payloads + card, map popup, JSDoc types. |
| `features/` | One folder per feature (`weather`, `air`, `hazards`): the composite components and pure helpers that only that feature needs. |
| `ui/`       | Generic, feature-agnostic design system: buttons, cards, charts, maps, form controls, icons. |
| `routes/`   | Page-level views, one per navigation route. Compose features + ui; own no business logic. |

Rules of thumb: a component that knows about a specific hazard/weather shape belongs in
`features/`; anything reusable across features belongs in `ui/`; anything that talks to
the network or the browser belongs in `core/`; pure calculations belong in `domain/`.

## Layout

```
src/
  App.svelte            shell: header, nav, scope, settings, location picker, bottom nav
  main.js               mount + theme/lang bootstrap + service-worker registration
  app.css               design tokens + base styles (one palette, one type scale)
  core/
    api.js              endpoint helpers
    store.svelte.js     app state, town-scoped loading, latest-wins requests
    async.js            createLoader: one implementation of latest-wins
    location.js         geolocation wrapper
    push.js             Web Push subscribe/unsubscribe
    dialog.js           `use:dialog` action: scroll-lock, focus-trap, Escape, focus restore
    config.js           SITE identity + deployment settings
    shell.js            NAV + SCOPES definitions
    i18n.svelte.js      EN/BM strings + formatters
    theme.svelte.js     light/dark store
  domain/
    flags.js            states, band colours, severity rank, formatting, atTown, geo helpers
    weather-codes.js    WMO code → icon/label
    warnings.js         activeWarnings()
    share.js            per-view share payload builders
    sharecard.js        canvas share card + intents
    popup.js            the single map-popup HTML builder
  features/
    weather/            WeatherBanner, WeatherDetail, scene
    air/                AqiMeter, air.js (bands, stats, map points, nearest)
    hazards/            Flood, Quakes, Warnings, FloodAlerts, FloodRow, HazardAlerts
    location/           LocationPicker sheet + useMyLocation()
    settings/           SettingsMenu popover (language + theme)
  ui/
    Icon, PageHeader, Section, StatCard, EmptyState, Skeleton, Spinner,
    Carousel, FilterPills, SearchInput, ShareButton, TelegramAlerts,
    MapView, TrendChart, AtAGlance, Legend, Disclosure, BottomNav
  routes/               Home, Weather, Air, Hazards, News, About, Api
  public/               manifest.webmanifest, sw.js, icons
  functions/api/[[path]].js   Cloudflare Pages proxy to the API
```

## How it reads data

Every view renders from one town-scoped bundle, `/api/summary?state=&town=&towns=`,
plus `/api/official` and `/api/history` on demand. Notes:

- Requests are **latest-wins** (`core/async.js`): a slow earlier response can never
  overwrite a newer one. This was a real bug twice, so it has one implementation.
- Every API-driven block has three states: ready, loading (skeleton), empty
  (explicit message). Absent data is never rendered as if it were present.
- The client never triggers an upstream fetch. The API serves from SQLite, with
  `Cache-Control` and a service worker on top.

## Accessibility & responsive notes

- WCAG-audited palette: text tokens meet 4.5:1 on their surfaces in both themes; the
  condition hero gradients are deep enough for white text.
- Keyboard support: skip link, focus-visible rings, focus-trapped location/report dialogs
  (ESC to close), `aria-current` on nav, `role="img"` + labels on charts and the hero.
- iOS safe-area insets for the fixed bottom nav; `prefers-reduced-motion` disables motion.
- Layout is mobile-first: a fixed bottom tab bar < 1024px, a top nav bar at ≥ 1024px.

## Run

```bash
npm install
npm run dev        # dashboard only
npm test           # 62 tests
npm run typecheck  # tsc --noEmit
npm run build      # production build to dist/
```

The dev server proxies `/api/*` to the API service (see `vite.config.ts`).

## Deploy

GitHub Actions (`.github/workflows/publish.yml`) runs `npm test`, builds, and deploys
`dist/` to Cloudflare Pages. Requires repo secrets `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID`, and `VITE_CARTO_KEY` as a build-time env var (it is inlined
into the bundle).

## Operations

The dashboard is served from two possible origins; keep them in sync:

- **`scripts/update-vps-dashboard.sh`** — run *on the VPS box* to pull and rebuild the
  bundle that `app.oh-alam.my` serves when it points at the VPS. The API serves `dist/`
  straight from disk, so a rebuild updates the live UI immediately (no restart needed
  for the UI). Use it after pulling UI changes the VPS should show.
- **`scripts/domain-flip.sh`** (lives in the `alam-api` repo) — one command to route
  `app.oh-alam.my` between the **Worker** (`worker`, uses D1 — subject to its daily
  row-read cap) and the **VPS tunnel** (`vps`, own SQLite — reliable). Default to VPS
  for reliability; flip to Worker after the 00:00 UTC D1 reset for the latest build.

## Notes

- Bilingual (English / Bahasa Malaysia) and dark mode, both toggled in the header.
- Share card renders a 1080x1080 PNG on canvas (Web Share API on mobile, download
  otherwise).
- No social links in the footer by choice; contact is `[EMAIL]`.
