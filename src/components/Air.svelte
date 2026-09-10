<script>
import { app } from "../lib/store.svelte.js";
import { getHistory } from "../lib/api.js";
import { numColor, cityOf } from "../lib/flags.js";
import { tr, bandLabel, bandAdvice } from "../lib/i18n.svelte.js";
import Sparkline from "./ui/Sparkline.svelte";
import MapView from "./ui/MapView.svelte";

const stations = $derived((app.data?.stations ?? []).slice().sort((a, b) => b.value - a.value));
const weather = $derived(app.data?.weather ?? []);
const townName = $derived(weather.find((r) => r.station === app.town && r.kind === "weather")?.stationName ?? app.town ?? "");
const heroAir = $derived(stations.find((s) => atTown(s)) ?? stations[0] ?? null);

const allPts = $derived(
  stations
    .filter((s) => s.coords?.lat && s.coords?.lon)
    .map((s) => ({ lat: s.coords.lat, lon: s.coords.lon, title: `${cityOf(s.stationName)}: ${s.value} (${bandLabel(s.band?.label)})`, color: numColor(s.band?.label), size: Math.max(10, Math.min(18, 10 + s.value / 50)), num: s.value })),
);
const heroPt = $derived(heroAir?.coords ? [{ lat: heroAir.coords.lat, lon: heroAir.coords.lon, title: `${cityOf(heroAir.stationName)}: ${heroAir.value} (${bandLabel(heroAir.band?.label)})`, color: numColor(heroAir.band?.label), size: 20, num: heroAir.value }] : []);
const mapPts = $derived(app.scope === "near" ? heroPt : allPts);
const legend = $derived([...new Map(stations.map((s) => [s.band?.label, numColor(s.band?.label)])).entries()]);

let range = $state(24);
let detailValues = $state([]);
async function openRange(o, h) {
  range = h;
  detailValues = h <= 24 ? (o.trend ?? []) : (await getHistory("doe-eqms", o.station, 168)).history.map((x) => x.value);
}

function atTown(o) {
  const t = (townName || "").toLowerCase().replace(/\s+/g, " ");
  const s = (o.stationName || o.station || "").toLowerCase().replace(/\s+/g, " ");
  if (!t || !s) return false;
  return s.includes(t) || t.includes(s) || o.station === app.town;
}
</script>

{#if app.loading}<p class="caption mb-2">{tr("updating")}</p>{/if}

<MapView pts={mapPts} class="h-72 w-full rounded-xl lg:h-[58vh] lg:min-h-[440px]" />

{#if legend.length}
  <ul class="mt-2 flex list-none flex-wrap gap-2 p-0 text-[12px]">
    {#each legend as [label, color] (label)}
      <li class="flex items-center gap-1"><span class="inline-block size-2.5 rounded-full" style="background:{color}"></span> {bandLabel(label)}</li>
    {/each}
  </ul>
{/if}

{#if app.scope === "near" && heroAir}
  <h3 class="qh">{cityOf(heroAir.stationName)}{#if atTown(heroAir)} · {tr("yourTown")}{/if}</h3>
  <div class="glass mt-1 flex items-center gap-4 rounded-2xl px-4 py-3">
    <div class="min-w-0 flex-1">
      <div class="font-mono text-[40px] font-bold leading-none" style="color:{numColor(heroAir.band?.label)}">{heroAir.value}</div>
      <div class="mt-1 text-[14px] font-semibold" style="color:{numColor(heroAir.band?.label)}">{bandLabel(heroAir.band?.label)}</div>
      <p class="mt-1 text-[13px] text-muted">{bandAdvice(heroAir.band?.label) || heroAir.band?.advice}</p>
      <div class="mt-2 flex gap-2 text-[12px]">
        <button class:on={range === 24} class="segbtn" onclick={() => openRange(heroAir, 24)}>24h</button>
        <button class:on={range === 168} class="segbtn" onclick={() => openRange(heroAir, 168)}>7d</button>
      </div>
    </div>
  </div>
  {#if detailValues.length >= 2}
    <Sparkline values={detailValues} color={numColor(heroAir.band?.label)} class="mt-2 h-[96px] w-full" ariaLabel="Air quality trend" width={600} height={96} />
  {:else}
    <Sparkline values={heroAir.trend} color={numColor(heroAir.band?.label)} class="mt-2 h-[96px] w-full" ariaLabel="Air quality trend" width={600} height={96} />
  {/if}
{:else}
  <h3 class="qh">{tr("navAQI")} · {app.scope === "malaysia" ? "Malaysia" : app.state}</h3>
  <ul class="list-none m-0 border-t border-line p-0">
    {#each stations as o (o.station)}
      <li class="flex items-center gap-3 border-b border-line px-2.5 py-2.5 pl-3.5" style="border-left:3px solid {numColor(o.band?.label)}">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5">
            <span class="text-[15px] font-semibold leading-tight">{cityOf(o.stationName)}</span>
            {#if atTown(o)}<span class="rounded bg-accent/15 px-1.5 py-0.5 text-[11px] font-bold text-fg">{tr("yourTown")}</span>{/if}
          </div>
          <div class="text-[12.5px] text-muted">{bandLabel(o.band?.label)} · {bandAdvice(o.band?.label) || o.band?.advice}</div>
        </div>
        <Sparkline values={o.trend} color={numColor(o.band?.label)} ariaLabel={"Air quality trend, past 24 hours"} width={120} height={26} />
        <span class="font-mono text-[22px] font-semibold" style="color:{numColor(o.band?.label)}">{o.value}</span>
      </li>
    {/each}
  </ul>
{/if}
