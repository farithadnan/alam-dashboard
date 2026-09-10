import { j } from "./api.js";

/** Shared reactive app state (Svelte 5 runes module store). One `/api/summary` fetch serves all views. */
export const app = $state({ data: null, state: null, town: null, scope: "near", loading: false, updated: "" });

export async function load() {
  app.loading = true;
  try {
    const q = app.scope === "malaysia" || !app.state ? "" : `?state=${encodeURIComponent(app.state)}`;
    const bundle = await j(`./api/summary${q}`);
    if (!app.state && bundle.states?.length) app.state = bundle.states[0];
    const towns = [...new Set((bundle.weather || []).filter((r) => r.kind === "weather").map((r) => r.station))];
    if (!app.town || !towns.includes(app.town)) app.town = towns[0] ?? null;
    app.data = bundle;
    app.updated = new Date().toLocaleTimeString();
  } finally {
    app.loading = false;
  }
}
