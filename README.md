# alam-dashboard

A mobile-first view of Malaysia's air quality, weather, official forecasts and
environmental hazards. Reads the `alam-api` service; talks to no upstream directly.

## Stack

- **Svelte 5** (runes) + **Vite** + **Tailwind v4**
- **Leaflet** for maps, with a CARTO light basemap (`VITE_CARTO_KEY`)
- No chart library: one hand-rolled SVG `TrendChart` (~70 lines) instead of ~45 KB of uPlot
- **vitest** + jsdom + the Svelte plugin (36 tests, including runes modules)
- Installable **PWA**: manifest, icons, service worker (registered in production only)

## Layout

```
src/
  App.svelte            shell: nav, scope, language/theme, location picker
  components/
    Home.svelte         glanceable landing: local hero, national strip, advisories, news
    Weather.svelte      per-town list; every card opens WeatherDetail
    WeatherDetail.svelte  hero, hourly, 7-day, model AQI trend, official MET forecast
    Air.svelte          station list, category counts, station detail, 24h/7d trend
    Hazards.svelte      earthquakes + climate
    About.svelte / Api.svelte / Warnings.svelte
    ui/                 MapView, TrendChart, Carousel, Spinner, Skeleton, StatCard,
                        SearchInput, Section, Icon
  lib/
    api.js        endpoint helpers
    store.svelte.js  app state, town-scoped loading, latest-wins requests
    flags.js      band colours, WMO codes, formatting, atTown
    air.js        band counts, series stats, map points, nearest station
    async.js      createLoader: one implementation of latest-wins
    location.js   geolocation wrapper (shared by shell and AQI nearest-station)
    i18n.svelte.js / theme.svelte.js
    alerts.js, popup.js, sharecard.js
  public/       manifest.webmanifest, sw.js, icons
  functions/api/[[path]].js   Cloudflare Pages proxy to the API
```

## How it reads data

Every view renders from one town-scoped bundle, `/api/summary?state=&town=&towns=`,
plus `/api/official` and `/api/history` on demand. Notes:

- Requests are **latest-wins** (`lib/async.js`): a slow earlier response can never
  overwrite a newer one. This was a real bug twice, so it has one implementation.
- Every API-driven block has three states: ready, loading (skeleton), empty
  (explicit message). Absent data is never rendered as if it were present.
- The client never triggers an upstream fetch. The API serves from SQLite, with
  `Cache-Control` and a service worker on top.

## Run

```bash
npm install
npm run dev        # dashboard only
npm test           # 36 tests
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
- No social links in the footer by choice; contact is `dev@farithadnan.net`.
