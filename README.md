# alam-dashboard

A clean, mobile-first, list-based view of air quality & environmental hazards for
Johor (Malaysia). Reads the `udara-api` service.

## Stack

- **Vite + vanilla TypeScript** → static build (no framework; matches the user's
  minimal taste and deploys anywhere, e.g. Cloudflare Pages)
- Fetches `udara-api` JSON endpoints: `/api/current`, `/api/history`, `/api/hazards`

## Layout

```
index.html / styles.css / main.js   (first preview slice — Johor AQI list)
scripts/preview.mjs                 dev preview server: serves the app AND proxies /api/* to the API
```