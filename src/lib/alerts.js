// Derive simple, Malaysia-relevant outlook alerts from the forecast we already
// fetch — no extra API calls, no new source. Heavy rain = high precipitation
// probability; heat = high maximum temperature. Values are per-town maxima,
// deduped by town, so a single town never appears several times.
const RAIN_P = 80; // % chance that counts as "heavy rain likely"
const HEAT_C = 35; // °C maximum that counts as a hot day

/** @returns {{type:"rain"|"heat", value:number, places:string[]}[]} */
export function deriveAlerts(forecast = []) {
  const byTown = new Map();
  for (const r of forecast) {
    if (r.kind !== "forecast") continue;
    const cur = byTown.get(r.station) ?? { name: r.stationName, p: 0, t: -99 };
    cur.p = Math.max(cur.p, r.meta?.precip ?? 0);
    cur.t = Math.max(cur.t, r.meta?.tmax ?? -99);
    byTown.set(r.station, cur);
  }
  const towns = [...byTown.values()];
  const out = [];

  const rain = towns.filter((t) => t.p >= RAIN_P).sort((a, b) => b.p - a.p);
  if (rain.length) out.push({ type: "rain", value: Math.round(rain[0].p), places: rain.map((t) => t.name) });

  const heat = towns.filter((t) => t.t >= HEAT_C).sort((a, b) => b.t - a.t);
  if (heat.length) out.push({ type: "heat", value: Math.round(heat[0].t), places: heat.map((t) => t.name) });

  return out;
}

/** First few place names, with a "+N more" suffix. */
export function shortPlaces(places, n = 3) {
  return places.slice(0, n).join(", ") + (places.length > n ? ` +${places.length - n}` : "");
}
