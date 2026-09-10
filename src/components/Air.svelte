<script>
import { app } from "../lib/store.svelte.js";
import { getHistory } from "../lib/api.js";
import { numColor, cityOf, groupBy } from "../lib/flags.js";
import { tr, bandLabel, bandAdvice } from "../lib/i18n.svelte.js";
import Sparkline from "./ui/Sparkline.svelte";
import MapView from "./ui/MapView.svelte";
import Section from "./ui/Section.svelte";

const stations = $derived((app.data?.stations ?? []).slice().sort((a, b) => b.value - a.value));
const weather = $derived(app.data?.weather ?? []);
const townName = $derived(weather.find((r) => r.station === app.town && r.kind === "weather")?.stationName ?? app.town ?? "");
const airTown = $derived(weather.find((r) => r.station === app.town && r.kind === "aqi"));
const heroAir = $derived(stations.find((s) => atTown(s)) ?? stations[0] ?? null);

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
const mapPts = $derived(allPts);
const mapFocus = $derived(open ? (() => { const s = stations.find((x) => x.station === open); return s?.coords ? { lat: s.coords.lat, lon: s.coords.lon, zoom: 11 } : null; })() : null);
const legend = $derived([...new Map(stations.map((s) => [s.band?.label, numColor(s.band?.label)])).entries()]);
const groups = $derived(groupBy(stations, (s) => s.meta?.state ?? ""));

let range = $state(24);
let open = $state(null);
let detailValues = $state([]);

function atTown(o) {
  const t = (townName || "").toLowerCase().replace(/\s+/g, " ");
  const s = (o.stationName || o.station || "").toLowerCase().replace(/\s+/g, " ");
  if (!t || !s) return false;
  return s.includes(t) || t.includes(s) || o.station === app.town;
}
async function loadTrend(o, h) {
  range = h;
  detailValues = h <= 24 ? (o.trend ?? []) : (await getHistory("doe-eqms", o.station, 168)).history.map((x) => x.value);
}
function toggleRow(o) {
  open = open === o.station ? null : o.station;
  if (open === o.station) loadTrend(o, range);
}
</script>

<MapView pts={mapPts} class="h-72 w-full rounded-xl lg:h-[58vh] lg:min-h-[440px]" fitMax={app.scope === "near" ? 12 : app.scope === "state" ? 9 : 8} focus={mapFocus} />
{#if legend.length}
  <ul class="mt-2 flex list-none flex-wrap gap-2 p-0 text-[12px]">
    {#each legend as [label, color] (label)}
      <li class="flex items-center gap-1"><span class="inline-block size-3 rounded-full" style="background:{color}"></span> {bandLabel(label)}</li>
    {/each}
  </ul>
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
      <button class:on={range === 24} class="segbtn" onclick={() => loadTrend(heroAir, 24)}>24h</button>
      <button class:on={range === 168} class="segbtn" onclick={() => loadTrend(heroAir, 168)}>7d</button>
    </div>
  </div>
  <Sparkline values={detailValues.length >= 2 ? detailValues : heroAir.trend} color={numColor(heroAir.band?.label)} class="mt-2 h-[96px] w-full" ariaLabel="Air quality trend" width={600} height={96} />
{:else}
  {#each groups as g (g.key)}
    <Section title={g.key}>
      <ul class="list-none m-0 p-0">
        {#each g.items as o (o.station)}
          <li class="border-b border-line" style="border-left:3px solid {numColor(o.band?.label)}">
            <button class="flex w-full items-center gap-3 px-2.5 py-2.5 pl-3.5 text-left" onclick={() => toggleRow(o)} aria-expanded={open === o.station}>
              <div class="min-w-0 flex-1">
                <div class="text-[15px] font-semibold leading-tight">{cityOf(o.stationName)}</div>
                <div class="text-[12.5px] text-muted">{bandLabel(o.band?.label)}</div>
              </div>
              <Sparkline values={o.trend} color={numColor(o.band?.label)} ariaLabel={"Air quality trend"} width={110} height={24} />
              <span class="font-mono text-[20px] font-semibold" style="color:{numColor(o.band?.label)}">{o.value}</span>
              <span class="font-mono text-muted">{open === o.station ? "−" : "+"}</span>
            </button>
            {#if open === o.station}
              <div class="px-3 pb-3">
                <p class="text-[13px] text-muted">{bandAdvice(o.band?.label) || o.band?.advice}</p>
                <div class="mt-2 flex gap-2">
                  <button class:on={range === 24} class="segbtn" onclick={() => loadTrend(o, 24)}>24h</button>
                  <button class:on={range === 168} class="segbtn" onclick={() => loadTrend(o, 168)}>7d</button>
                </div>
                {#if detailValues.length >= 2}
                  <Sparkline values={detailValues} color={numColor(o.band?.label)} class="mt-2 h-[80px] w-full" ariaLabel="Air quality trend" width={600} height={80} />
                {/if}
              </div>
            {/if}
          </li>
        {/each}
      </ul>
    </Section>
  {/each}
{/if}
