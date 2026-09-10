import { j } from "./api.js";

/** Shared reactive app state (Svelte 5 runes module store). One `/api/summary` fetch serves all views. */
export const app = $state({ data: null, state: null, town: null, scope: "near", loading: false, updated: "", error: "" });

const CACHE_KEY = "alam-cache";

export async function load() {
  app.loading = true;
  try {
    const q = app.scope === "malaysia" || !app.state ? "" : `?state=${encodeURIComponent(app.state)}`;
    const bundle = await j(`./api/summary${q}`);
    if (!app.state && bundle.states?.length) app.state = bundle.states[0];
    const towns = [...new Set((bundle.weather || []).filter((r) => r.kind === "weather").map((r) => r.station))];
    if (!app.town || !towns.includes(app.town)) app.town = towns[0] ?? app.town;
    app.data = bundle;
    app.updated = new Date().toLocaleTimeString();
    app.error = "";
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
