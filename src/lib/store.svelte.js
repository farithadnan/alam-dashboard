import { j } from "./api.js";

/** Shared reactive app state (Svelte 5 runes module store). One `/api/summary` fetch serves all views. */
export const app = $state({ data: null, state: null, town: null, scope: "near", picked: null, loading: false, updated: "", error: "" });

const CACHE_KEY = "alam-cache";
const LOC_KEY = "alam-loc";

/** Remember the chosen state/town/scope so the user never re-picks on return. */
function persistLoc() {
  try { localStorage.setItem(LOC_KEY, JSON.stringify({ state: app.state, town: app.town, scope: app.scope })); } catch {}
}
export function initLoc() {
  try {
    const l = JSON.parse(localStorage.getItem(LOC_KEY) || "null");
    if (!l) return;
    if (l.state) app.state = l.state;
    if (l.town) app.town = l.town;
    if (l.scope) app.scope = l.scope;
  } catch {}
}

export async function load() {
  app.loading = true;
  try {
    // State narrows stations/weather; town narrows the heavier hourly + forecast
    // series to the one place the UI is actually showing.
    const params = new URLSearchParams();
    if (app.state && app.scope !== "malaysia") params.set("state", app.state);
    if (app.town) params.set("town", app.town);
    // A drilled-in place needs its own hourly + forecast too.
    if (app.picked && app.picked !== app.town) params.set("towns", app.picked);
    const qs = params.toString();
    const bundle = await j(`./api/summary${qs ? `?${qs}` : ""}`);
    if (!app.state && bundle.states?.length) app.state = bundle.states[0];
    const towns = [...new Set((bundle.weather || []).filter((r) => r.kind === "weather").map((r) => r.station))];
    if (!app.town || !towns.includes(app.town)) app.town = towns[0] ?? app.town;
    app.data = bundle;
    app.updated = new Date().toLocaleTimeString();
    app.error = "";
    persistLoc();
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data: bundle, state: app.state, town: app.town })); } catch {}
  } catch (e) {
    app.error = e?.message || "unavailable";
    if (!app.data) {
      try {
        const c = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
        if (c?.data) { app.data = c.data; app.state = app.state || c.state; app.town = app.town || c.town; }
      } catch {}
    }
  } finally {
    app.loading = false;
  }
}
