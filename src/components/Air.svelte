<script>
import { app } from "../lib/store.svelte.js";
import { getHistory } from "../lib/api.js";
import { numColor, cityOf } from "../lib/flags.js";
import { tr, trFmt, bandLabel, bandAdvice } from "../lib/i18n.svelte.js";
import Sparkline from "./ui/Sparkline.svelte";
import MapView from "./ui/MapView.svelte";

let hours = $state(24);
let detail = $state(null);

const stations = $derived((app.data?.stations ?? []).slice().sort((a, b) => b.value - a.value));
const weather = $derived(app.data?.weather ?? []);
const townName = $derived(weather.find((r) => r.station === app.town && r.kind === "weather")?.stationName ?? app.town ?? "");
const heroAir = $derived(stations.find((s) => atTown(s)) ?? stations[0] ?? null);
const stationPts = $derived(
  stations
    .filter((s) => s.coords?.lat && s.coords?.lon)
    .map((s) => ({ lat: s.coords.lat, lon: s.coords.lon, title: `${cityOf(s.stationName)}: ${s.value} (${bandLabel(s.band?.label)})`, color: numColor(s.band?.label), size: Math.max(10, Math.min(18, 10 + s.value / 50)), num: s.value })),
);
const legend = $derived([...new Map(stations.map((s) => [s.band?.label, numColor(s.band?.label)])).entries()]);

function atTown(o) {
  const t = (townName || "").toLowerCase().replace(/\s+/g, " ");
  const s = (o.stationName || o.station || "").toLowerCase().replace(/\s+/g, " ");
  if (!t || !s) return false;
  return s.includes(t) || t.includes(s) || o.station === app.town;
}
async function openDetail(o) {
  if (hours <= 24) {
    detail = { station: o.station, name: cityOf(o.stationName), value: o.value, label: bandLabel(o.band?.label), values: o.trend ?? [], color: numColor(o.band?.label) };
  } else {
    const h = await getHistory("doe-eqms", o.station, 168);
    detail = { station: o.station, name: cityOf(o.stationName), value: o.value, label: bandLabel(o.band?.label), values: (h.history || []).map((x) => x.value), color: numColor(o.band?.label) };
  }
}
function setHours(h) {
  hours = h;
  const o = stations.find((s) => s.station === detail?.station);
  if (o) openDetail(o);
}
</script>

{#if app.loading}<p class="caption mb-2">{tr("updating")}</p>{/if}

{#if heroAir}
  <div class="glass my-2 flex items-center gap-4 rounded-2xl px-4 py-3">
    <div class="flex-1">
      <div class="text-[15px] font-semibold">{townName}{#if app.state}<span class="text-muted">, {app.state}</span>{/if}</div>
      <div class="text-[13px] text-muted">{atTown(heroAir) ? "" : `${tr("nearby")}`} {cityOf(heroAir.stationName)} · {bandAdvice(heroAir.band?.label) || heroAir.band?.advice}</div>
    </div>
    <div class="text-right">
      <div class="font-mono text-[34px] font-bold leading-none" style="color:{numColor(heroAir.band?.label)}">{heroAir.value}</div>
      <div class="text-[12px] font-semibold" style="color:{numColor(heroAir.band?.label)}">{bandLabel(heroAir.band?.label)}</div>
    </div>
  </div>
{/if}

<div class="lg:grid lg:grid-cols-[1fr_320px] lg:gap-6 lg:items-start">
  <div class="min-w-0">
    <h3 class="qh">{tr("stationsMap")}</h3>
    {#if stationPts.length}
      <MapView pts={stationPts} />
      {#if legend.length}
        <ul class="mt-2 flex list-none flex-wrap gap-2 p-0 text-[12px]">
          {#each legend as [label, color] (label)}
            <li class="flex items-center gap-1"><span class="inline-block size-2.5 rounded-full" style="background:{color}"></span> {bandLabel(label)}</li>
          {/each}
        </ul>
      {/if}
    {:else}
      <p class="caption">—</p>
    {/if}
  </div>

  <div class="mt-4 min-w-0 lg:mt-0">
    <h3 class="qh">{trFmt("airStations", { s: app.state, n: stations.length })}</h3>
    {#if detail}
      <div class="my-2 rounded-2xl border border-line bg-panel px-4 py-3">
        <div class="flex items-baseline justify-between gap-2">
          <span class="font-bold">{detail.name}</span>
          <span class="font-mono text-[22px] font-semibold" style="color:{detail.color}">{detail.value}</span>
          <span class="flex-1"></span>
          <span class="caption">{hours >= 168 ? tr("past7") : tr("past24")}</span>
          <button class="ghostbtn" aria-label="Close trend" onclick={() => (detail = null)}>×</button>
        </div>
        {#if detail.values?.length >= 2}
          <Sparkline values={detail.values} color={detail.color} class="h-[86px] w-full" />
        {/if}
      </div>
    {/if}
    <ul class="list-none m-0 border-t border-line p-0">
      {#each stations as o (o.station)}
        <li
          class="flex cursor-pointer items-center gap-3 border-b border-line px-2.5 py-3 pl-3.5 hover:bg-accent/5"
          style="border-left:3px solid {numColor(o.band?.label)}"
          tabindex="0"
          role="button"
          onclick={() => openDetail(o)}
          onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDetail(o); } }}
        >
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <span class="text-[15px] font-semibold leading-tight">{cityOf(o.stationName)}</span>
              {#if atTown(o)}<span class="rounded bg-accent/15 px-1.5 py-0.5 text-[11px] font-bold text-fg">{tr("yourTown")}</span>{/if}
            </div>
            <div class="text-[12.5px] text-muted">{bandLabel(o.band?.label)} · {bandAdvice(o.band?.label) || o.band?.advice}</div>
          </div>
          <Sparkline values={o.trend} color={numColor(o.band?.label)} ariaLabel={"Air quality trend, past 24 hours"} width={120} height={26} />
          <span class="font-mono text-[22px] font-semibold" style="color:{numColor(o.band?.label)}">{o.value}</span>
          <span class="text-[13px] text-muted">&rsaquo;</span>
        </li>
      {/each}
    </ul>
  </div>
</div>
