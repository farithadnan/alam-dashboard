import { j } from "./api.js";

/** Shared reactive app state (Svelte 5 runes module store). One `/api/summary` fetch serves all views. */
export const app = $state({
  data: null, state: null, town: null, scope: "near", loading: false, updated: "", error: "",
  saved: [], recent: [],
});

const CACHE_KEY = "alam-cache";
const SAVED_KEY = "alam-saved";
const RECENT_KEY = "alam-recent";

function readList(key) {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function writeList(key, v) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
}

/** Load pinned + recently-viewed towns from localStorage. */
export function initSaved() {
  app.saved = readList(SAVED_KEY);
  app.recent = readList(RECENT_KEY);
}

/** Pin/unpin a town: { station, name, state }. */
export function toggleSaved(t) {
  if (!t?.station) return;
  const i = app.saved.findIndex((s) => s.station === t.station);
  if (i >= 0) app.saved.splice(i, 1);
  else app.saved.unshift({ station: t.station, name: t.name, state: t.state });
  writeList(SAVED_KEY, app.saved);
}
export function isSaved(station) {
  return app.saved.some((s) => s.station === station);
}

/** Remember a town the user chose (most recent first, capped). */
export function pushRecent(t) {
  if (!t?.station) return;
  app.recent = [t, ...app.recent.filter((s) => s.station !== t.station)].slice(0, 5);
  writeList(RECENT_KEY, app.recent);
}

/** Look up { station, name, state } for a station id from the loaded bundle. */
export function townInfo(station) {
  return (app.data?.allTowns ?? []).find((t) => t.station === station) ?? null;
}

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
