<script>
import { app } from "../lib/store.svelte.js";
import { getHistory } from "../lib/api.js";
import { numColor, cityOf, groupBy } from "../lib/flags.js";
import { tr, trFmt, bandLabel, bandAdvice } from "../lib/i18n.svelte.js";
import TrendChart from "./ui/TrendChart.svelte";
import Spinner from "./ui/Spinner.svelte";
import MapView from "./ui/MapView.svelte";
import Section from "./ui/Section.svelte";

const BAND_ORDER = ["Good", "Moderate", "Unhealthy", "Very Unhealthy", "Hazardous"];

const stations = $derived((app.data?.stations ?? []).slice().sort((a, b) => b.value - a.value));
const weather = $derived(app.data?.weather ?? []);
const townName = $derived(weather.find((r) => r.station === app.town && r.kind === "weather")?.stationName ?? app.town ?? "");
const airTown = $derived(weather.find((r) => r.station === app.town && r.kind === "aqi"));
const heroAir = $derived(stations.find((s) => atTown(s)) ?? stations[0] ?? null);

const counts = $derived(
  BAND_ORDER.map((label) => ({ label, n: stations.filter((s) => s.band?.label === label).length })).filter((c) => c.n > 0),
);
const allPts = $derived(
  stations
    .filter((s) => s.coords?.lat && s.coords?.lon)
    .map((s) => {
      const col = numColor(s.band?.label);
      return {
        lat: s.coords.lat, lon: s.coords.lon, color: col, num: s.value, size: 26,
        html: `<div style="font:600 15px system-ui;color:#242628">${cityOf(s.stationName)}</div><div style="font:800 28px system-ui;line-height:1.1;color:${col}">${s.value}</div><div style="font:600 13px system-ui;color:${col}">${bandLabel(s.band?.label)}</div><div style="font:12px system-ui;color:#6b6258">${bandAdvice(s.band?.label) || s.band?.advice}</div>`,
      };
    }),
);
const mapFocus = $derived(open ? (() => { const s = stations.find((x) => x.station === open); return s?.coords ? { lat: s.coords.lat, lon: s.coords.lon, zoom: 11 } : null; })() : null);
const legend = $derived([...new Map(stations.map((s) => [s.band?.label, numColor(s.band?.label)])).entries()]);
const groups = $derived(groupBy(stations, (s) => s.meta?.state ?? ""));

let range = $state(24);
let open = $state(null);
let nearInfo = $state("");

/** The station currently being charted: the expanded row, or the "near me" hero. */
const target = $derived(open ? (stations.find((s) => s.station === open) ?? null) : app.scope === "near" ? heroAir : null);
// The series is fetched per station/range (no longer shipped in the bundle), so a
// spinner shows while it loads and stale responses are discarded.
let series = $state([]);
let seriesLoading = $state(false);
let reqId = 0;
$effect(() => {
  const st = target?.station;
  const h = range;
  if (!st) { series = []; return; }
  const id = ++reqId;
  seriesLoading = true;
  getHistory("doe-eqms", st, h)
    .then((res) => { if (id === reqId) series = (res.history ?? []).map((r) => ({ t: r.measuredAt, v: r.value })); })
    .catch(() => { if (id === reqId) series = []; })
    .finally(() => { if (id === reqId) seriesLoading = false; });
});

const stats = $derived.by(() => {
  const vs = series.map((d) => d.v);
  if (!vs.length) return null;
  return { min: Math.min(...vs), max: Math.max(...vs), avg: Math.round(vs.reduce((a, b) => a + b, 0) / vs.length) };
});

function setRange(h) {
  range = h;
}

function atTown(o) {
  const t = (townName || "").toLowerCase().replace(/\s+/g, " ");
  const s = (o.stationName || o.station || "").toLowerCase().replace(/\s+/g, " ");
  if (!t || !s) return false;
  return s.includes(t) || t.includes(s) || o.station === app.town;
}

function haversine(a, b) {
  const R = 6371, rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function toggleRow(o) {
  open = open === o.station ? null : o.station;
  range = 24;
}

/** Find the monitoring station closest to the user and open it. */
function nearestStation() {
  if (!navigator.geolocation) return;
  nearInfo = tr("locating");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const me = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      let best = null, bd = Infinity;
      for (const s of stations) {
        if (!s.coords?.lat) continue;
        const d = haversine(me, s.coords);
        if (d < bd) { bd = d; best = s; }
      }
      if (best) {
        open = best.station;
        setRange(24);
        nearInfo = `${cityOf(best.stationName)} · ${bd.toFixed(1)} km`;
      } else nearInfo = "";
    },
    () => { nearInfo = ""; },
    { timeout: 8000 },
  );
}
</script>

<MapView pts={allPts} class="h-72 w-full rounded-xl lg:h-[58vh] lg:min-h-[440px]" fitMax={app.scope === "near" ? 12 : app.scope === "state" ? 9 : 8} focus={mapFocus} />
{#if legend.length}
  <ul class="mt-2 flex list-none flex-wrap gap-2 p-0 text-[12px]">
    {#each legend as [label, color] (label)}
      <li class="flex items-center gap-1"><span class="inline-block size-3 rounded-full" style="background:{color}"></span> {bandLabel(label)}</li>
    {/each}
  </ul>
{/if}

{#if counts.length}
  <h3 class="qh">{tr("catTitle")}</h3>
  <ul class="mt-1 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-3">
    {#each counts as c (c.label)}
      <li class="glass flex items-center justify-between rounded-xl px-3 py-2">
        <span class="flex items-center gap-2 text-[13px]">
          <span class="inline-block size-3 rounded-full" style="background:{numColor(c.label)}"></span>{bandLabel(c.label)}
        </span>
        <span class="font-mono text-[18px] font-bold" style="color:{numColor(c.label)}">{c.n}</span>
      </li>
    {/each}
  </ul>
{/if}

{#if stations.length > 3}
  <div class="mt-3 grid gap-2 sm:grid-cols-2">
    <div class="glass rounded-xl p-3">
      <div class="caption text-[12px]">{tr("cleanest")}</div>
      <ul class="mt-1 list-none p-0">
        {#each stations.slice().sort((a, b) => a.value - b.value).slice(0, 3) as s (s.station)}
          <li class="flex items-center justify-between py-0.5 text-[13px]">
            <span class="truncate">{cityOf(s.stationName)}</span>
            <span class="font-mono font-semibold" style="color:{numColor(s.band?.label)}">{s.value}</span>
          </li>
        {/each}
      </ul>
    </div>
    <div class="glass rounded-xl p-3">
      <div class="caption text-[12px]">{tr("worst")}</div>
      <ul class="mt-1 list-none p-0">
        {#each stations.slice(0, 3) as s (s.station)}
          <li class="flex items-center justify-between py-0.5 text-[13px]">
            <span class="truncate">{cityOf(s.stationName)}</span>
            <span class="font-mono font-semibold" style="color:{numColor(s.band?.label)}">{s.value}</span>
          </li>
        {/each}
      </ul>
    </div>
  </div>
{/if}

{#if app.scope === "near"}
  <div class="mt-3 flex items-center gap-2">
    <button class="ghostbtn" onclick={nearestStation}>{tr("nearest")}</button>
    {#if nearInfo}<span class="font-mono text-[12.5px] text-muted">{nearInfo}</span>{/if}
  </div>
{/if}

{#if app.scope === "near" && heroAir}
  <h3 class="qh">{cityOf(heroAir.stationName)}</h3>
  <div class="glass mt-1 rounded-2xl p-4">
    <div class="flex items-center justify-between gap-4">
      <div>
        <div class="font-mono text-[44px] font-bold leading-none" style="color:{numColor(heroAir.band?.label)}">{heroAir.value}</div>
        <div class="mt-1 text-[15px] font-semibold" style="color:{numColor(heroAir.band?.label)}">{bandLabel(heroAir.band?.label)}</div>
      </div>
      <div class="flex gap-2 rounded-xl border border-line p-2 text-[12.5px]">
        <div class="text-center"><div class="caption text-[10px]">PM2.5</div><div class="font-mono font-semibold">{airTown?.meta?.pm2_5 ?? "—"}</div></div>
        <div class="text-center"><div class="caption text-[10px]">PM10</div><div class="font-mono font-semibold">{airTown?.meta?.pm10 ?? "—"}</div></div>
        <div class="text-center"><div class="caption text-[10px]">UV</div><div class="font-mono font-semibold">{airTown?.meta?.uv ?? "—"}</div></div>
      </div>
    </div>
    <p class="mt-2 text-[13px] text-muted">{bandAdvice(heroAir.band?.label) || heroAir.band?.advice}</p>
    <div class="mt-2 flex gap-2">
      <button class:on={range === 24} class="segbtn" onclick={() => setRange(24)}>24h</button>
      <button class:on={range === 168} class="segbtn" onclick={() => setRange(168)}>7d</button>
    </div>
    <p class="caption mt-1 text-[12px]">{range === 24 ? tr("past24") : tr("past7d")}</p>
    {#if seriesLoading}
      <div class="flex h-[170px] items-center justify-center"><Spinner size={22} label={tr("loading")} /></div>
    {:else if series.length >= 2}
      <TrendChart series={series} color={numColor(heroAir.band?.label)} ariaLabel="Air quality trend" mode={range === 168 ? "days" : "hours"} />
      {#if stats}<p class="caption mt-1 text-[12px]">{"min " + stats.min + " · avg " + stats.avg + " · max " + stats.max}</p>{/if}
    {/if}
  </div>
{:else}
  {#each groups as g (g.key)}
    <Section title={g.key} startOpen={groups.length === 1}>
      <ul class="list-none m-0 p-0">
        {#each g.items as o (o.station)}
          <li class="border-b border-line" style="border-left:3px solid {numColor(o.band?.label)}">
            <button class="flex w-full items-center gap-3 px-2.5 py-2.5 pl-3.5 text-left" onclick={() => toggleRow(o)} aria-expanded={open === o.station}>
              <div class="min-w-0 flex-1">
                <div class="text-[15px] font-semibold leading-tight">{cityOf(o.stationName)}</div>
                <div class="text-[12.5px] text-muted">{bandLabel(o.band?.label)}</div>
              </div>
              <span class="font-mono text-[20px] font-semibold" style="color:{numColor(o.band?.label)}">{o.value}</span>
              <span class="font-mono text-muted">{open === o.station ? "−" : "+"}</span>
            </button>
            {#if open === o.station}
              <div class="px-3 pb-3">
                <p class="text-[13px] text-muted">{bandAdvice(o.band?.label) || o.band?.advice}</p>
                <div class="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[12.5px] text-muted">
                  {#if o.meta?.place}<div>{tr("stationLbl")}</div><div class="text-fg">{o.meta.place}</div>{/if}
                  {#if o.meta?.category}<div>{tr("categoryLbl")}</div><div class="text-fg">{o.meta.category}</div>{/if}
                  {#if o.meta?.region}<div>{tr("region")}</div><div class="text-fg">{o.meta.region}</div>{/if}
                  {#if o.meta?.param}<div>{tr("parameter")}</div><div class="text-fg">{o.meta.param}</div>{/if}
                  {#if o.meta?.pm10 != null}<div>PM10</div><div class="font-mono text-fg">{o.meta.pm10}</div>{/if}
                </div>
                <div class="mt-2 flex gap-2">
                  <button class:on={range === 24} class="segbtn" onclick={() => setRange(24)}>24h</button>
                  <button class:on={range === 168} class="segbtn" onclick={() => setRange(168)}>7d</button>
                </div>
                <p class="caption mt-1 text-[12px]">{range === 24 ? tr("past24") : tr("past7d")}</p>
                {#if seriesLoading}
                  <div class="flex h-[170px] items-center justify-center"><Spinner size={22} label={tr("loading")} /></div>
                {:else if series.length >= 2}
                  <TrendChart series={series} color={numColor(o.band?.label)} ariaLabel="Air quality trend" mode={range === 168 ? "days" : "hours"} />
                  {#if stats}<p class="caption mt-1 text-[12px]">{"min " + stats.min + " · avg " + stats.avg + " · max " + stats.max}</p>{/if}
                {/if}
              </div>
            {/if}
          </li>
        {/each}
      </ul>
    </Section>
  {/each}
{/if}
