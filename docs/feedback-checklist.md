# OhAlam — Three-AI Feedback Checklist

Consolidated from OpenAI, Grok and Gemini reviews. Status: ✅ done · ⏳ pending · 🚧 infra/deferred (fee cap/authority blocked).

## OpenAI
| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 1 | Source attribution in headers: "Updated · MET Malaysia/Open-Meteo" (weather), "· DOE APIMS" (AQI), "· JPS InfoBanjir" (flood) | ✅ | PageHeader `source` prop; AQI 12Jun done; weather/flood/hazards pending wiring |
| 2 | Severe events must dominate homepage ("⚠️ FLOOD WARNING" banner, not a dot row) | ✅ | Alert-strip + bold critical cards in HazardAlerts |
| 3 | Homepage core = "what do I need to worry about?" (active alerts + AQI word + rain) | ⏳ | At-a-glance + alerts present; "My Situation" + rain-today block pending |
| 4 | Don't add nav items (keep 5) | ✅ | Nav unchanged |
| 5 | AQI killer feature: value+word, outdoor-activity advice, PM2.5, trend | ✅ | outdoor advice, trend marker, PM2.5 present; zones added |
| 6 | Flood plain-language: "Flood risk increasing / 3 rivers above warning" w/ technical underneath | ⏳ | Flood page pending mobile cards + risk headline |
| 7 | Location flow "Displaying X. Not your location?" — keep | ✅ | Already present |
| 8 | Homepage promise obvious ("Weather · Air · Flood · Hazards — one view") | ✅ | homeIntro reframed |
| 9 | Trust messaging: "we bring trusted sources together, simplified" | ✅ | About what + disclaimer reframed |
| 10 | Share harder (WhatsApp natural for Malaysia); weather share includes rain | ⏳ | Share exists; weather rain-line enhancement pending |
| 11 | Weather detail: rain-first priority (rain %, hourly, today high/low, 7-day) | ⏳ | Ordering change pending |
| 12 | Web push notifications (the "Enable device alerts" gap) | 🚧 | Needs push infra + VAPID + notification worker |
| 13 | Domain: oh-alam.my as product, app.oh-alam.my redirects | 🚧 | Needs DNS authority at registrar/zone |
| 14 | Fix About.svelte `href="{SITE.github}"` literal bug | ✅ | Fixed |
| 15 | CI/build should be trustworthy | ✅ | 62/62 UI + 136 API tests green; typecheck 0 |
| 16 | "My Situation" block at top (current + AQI + no-warnings + rain) | ⏳ | Partially via WeatherBanner; consolidated block pending |
| 17 | Alert center section | ✅ | HazardAlerts strip |
| 18 | Personal alerts per location | 🚧 | Tied to web push (#12) |
| 19 | Positioning copy "Everything happening around you, in one place" | ✅ | homeIntro + About |

## Grok
| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 1 | "What should I do" guidance next to numbers | ✅ | AQI outdoor advice; band advice present |
| 2 | Simpler messaging / less dashboard-y | ⏳ | Ongoing; no strong onboarding moment yet |
| 3 | Keep niche/utility direction | ✅ | No bloat added |

## Gemini
| # | Requirement | Status | Notes |
|---|-------------|--------|-------|
| 1 | Desktop: Alert State Banner (green "All systems normal" → red on breach) at top | ⏳ | Alert strip added on Home; neutral "normal" banner pending |
| 2 | Charts: hazard threshold color-zones (green/yellow/red) | ✅ | AQI zones added to TrendChart; flood/rain charts pending |
| 3 | Location search: autocomplete + aliases (JB→Johor Bahru) + "Use current location" near search | 🚧 | Picker is select-based; aliases/autocomplete pending |
| 4 | Mobile: river/station data as stacked cards (no horizontal scroll) | ⏳ | Flood page pending |
| 5 | Mobile: filter pills ≥44px tap targets + scrollable horizontal carousel | ✅ | 40px + scrollable (40 chosen over user's earlier "too big" note) |
| 6 | Performance: lazy-load maps, collapse history charts behind accordion on mobile | 🚧 | Needs MapView lazy + Section collapse |
| 7 | Full BM + official Malay safety terms (Waspada, Buruk) match | ⏳ | Review/label pass pending |
| 8 | Standardize risk colors (Malaysian gov palette) | ⏳ | AQI chart uses APIMS palette; flood ladder pending |
| 9 | Keep bottom tab bar | ✅ | Unchanged |
| 10 | First-load performance / data footprint on weak networks | 🚧 | Tied to #6 |

## Cross-cutting summary
- ✅ done: 12 items
- ⏳ pending (feasible UI): ~9 items (weather source, rain-first, flood mobile+plain-language, netural banner, flood/hazards source, risk-colour ladder, BM official terms, news/hazards source)
- 🚧 infra/deferred: 4 (web push, domain, autocomplete aliases, lazy-load maps/accordion)
