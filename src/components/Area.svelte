<script>
import { app } from "../lib/store.svelte.js";
import { getHistory } from "../lib/api.js";
import { numColor, cityOf, wmo, DAYS } from "../lib/flags.js";
import { tr, trFmt, bandLabel, bandAdvice, wmoLabel } from "../lib/i18n.svelte.js";
import Sparkline from "./ui/Sparkline.svelte";
import Seg from "./ui/Seg.svelte";
import MapView from "./ui/MapView.svelte";

let hours = $state(24);
let detail = $state(null);
let openStations = $state(false);

const stations = $derived((app.data?.stations ?? []).slice().sort((a, b) => b.value - a.value));
const weather = $derived(app.data?.weather ?? []);
const townName = $derived(weather.find((r) => r.station === app.town && r.kind === "weather")?.stationName ?? app.town ?? "");
const nowCard = $derived({
  w: weather.find((r) => r.station === app.town && r.kind === "weather"),
  a: weather.find((r) => r.station === app.town && r.kind === "aqi"),
});
const myForecast = $derived((app.data?.forecast ?? []).filter((r) => r.station === app.town).sort((a, b) => a.measuredAt.localeCompare(b.measuredAt)));
const worst = $derived(stations[0]);
const heroAir = $derived(stations.find((s) => atTown(s)) ?? null);
const today = new Date().toISOString().slice(0, 10);
const stationPts = $derived(
  stations
    .filter((s) => s.coords?.lat && s.coords?.lon)
    .map((s) => ({
      lat: s.coords.lat, lon: s.coords.lon,
      title: `${cityOf(s.stationName)}: ${s.value} (${bandLabel(s.band?.label)})`,
      color: numColor(s.band?.label),
      size: Math.max(9, Math.min(16, 9 + (s.value / 60))),
      num: s.value,
    })),
);

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

<div class="lg:grid lg:grid-cols-[1fr_300px] lg:gap-6">
  <div class="min-w-0">
    {#if nowCard.w}
      {@const [nowIcon, nowLabel] = nowCard.w.meta?.code != null ? wmo(String(nowCard.w.meta.code)) : [null, null]}
      <div class="my-1">
        <div class="text-[15px] font-semibold">{townName}{#if app.state}<span class="text-muted">, {app.state}</span>{/if}</div>
        <div class="mt-1 flex items-end justify-between gap-3">
          <div class="flex min-w-0 flex-wrap items-end gap-3">
            {#if nowIcon}<span class="shrink-0 text-[40px] leading-none" aria-hidden="true">{nowIcon}</span>{/if}
            <div class="font-mono text-[46px] font-extrabold leading-none tracking-tighter">{Math.round(nowCard.w.value)}°</div>
            <div class="min-w-0 pb-1">
              <div class="text-[13px] text-muted">{tr("feels")} {Math.round(nowCard.w.meta?.apparentTemp ?? nowCard.w.value)}°</div>
              <div class="text-[12.5px] text-muted">{nowCard.w.meta?.humidity ?? "–"}% {tr("humidity")} · {tr("wind")} {nowCard.w.meta?.wind ?? "–"} km/h · {tr("uv")} {nowCard.a?.meta?.uv ?? "–"}</div>
            </div>
          </div>
          {#if heroAir}
            <div class="shrink-0 rounded-xl border px-3 py-1.5 text-center" style="border-color:{numColor(heroAir.band?.label)}">
              <div class="caption text-[11px]">{tr("airNow")}</div>
              <div class="font-mono text-[22px] font-bold leading-none" style="color:{numColor(heroAir.band?.label)}">{heroAir.value}</div>
              <div class="text-[11px] font-semibold" style="color:{numColor(heroAir.band?.label)}">{bandLabel(heroAir.band?.label)}</div>
            </div>
          {:else}
            <div class="shrink-0 text-right text-[12px] text-muted">{tr("noMonitor")} {townName}</div>
          {/if}
        </div>
      </div>
    {/if}
    {#if app.updated}<p class="caption mb-1 text-[12px]">{trFmt("updatedFrom", { t: app.updated })}</p>{/if}

    <h3 class="qh">{tr("forecast")}</h3>
    <ul class="list-none m-0 border-t border-line p-0">
      {#each myForecast.slice(0, 7) as r (r.station + r.measuredAt)}
        {@const [icon, label] = wmo(String(r.meta?.code))}
        {@const isToday = r.measuredAt.slice(0, 10) === today}
        <li class="flex items-center gap-2.5 border-b border-line px-2.5 py-2.5">
          <span class="w-11 shrink-0 text-[14px] font-semibold">{isToday ? tr("today") : DAYS[new Date(r.measuredAt).getUTCDay()]}</span>
          <span class="min-w-0 flex-1 truncate text-[14px]">{icon} {wmoLabel(label)}</span>
          {#if r.meta?.precip > 0}<span class="w-[58px] shrink-0 text-right text-[12.5px] text-muted">☔ {Math.round(r.meta.precip)}%</span>{:else}<span class="w-[58px] shrink-0"></span>{/if}
          <span class="w-[92px] shrink-0 text-right font-mono text-[14px] font-semibold">
            {Math.round(r.meta?.tmax ?? r.value)}° <span class="ml-1.5 text-muted">{Math.round(r.meta?.tmin ?? 0)}°</span>
          </span>
        </li>
      {/each}
    </ul>

    <button class="navbtn mt-3 w-full text-left font-bold" onclick={() => (openStations = !openStations)} aria-expanded={openStations}>
      {(openStations ? tr("hideAir") : tr("viewAir"))} {trFmt("airStations", { s: app.state, n: stations.length })}
    </button>
    {#if openStations}
      {#if stations.length && worst}
        <p class="caption mt-1">{tr("worst")}: {cityOf(worst.stationName)} at <b style="color:{numColor(worst.band?.label)}">{worst.value}</b> ({bandLabel(worst.band?.label)}). {bandAdvice(worst.band?.label) || worst.band?.advice}</p>
      {/if}
      {#if detail}
        <div class="my-3 rounded-2xl border border-line bg-panel px-4 py-3">
          <div class="flex items-baseline justify-between gap-2">
            <span class="font-bold">{detail.name}</span>
            <span class="font-mono text-[22px] font-semibold" style="color:{detail.color}">{detail.value}</span>
            <span class="flex-1"></span>
            <Seg options={[{ value: 24, label: "24h" }, { value: 168, label: "7d" }]} value={hours} onpick={setHours} />
            <button class="ghostbtn" aria-label="Close trend" onclick={() => (detail = null)}>×</button>
          </div>
          {#if detail.values?.length >= 2}
            <Sparkline values={detail.values} color={detail.color} class="h-[86px] w-full" />
          {/if}
          <p class="caption mt-1">{detail.label} · {hours >= 168 ? tr("past7") : tr("past24")}</p>
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
    {/if}
  </div>

  <aside class="mt-4 lg:mt-0">
    <h3 class="qh">{tr("stationsMap")}</h3>
    {#if stationPts.length}
      <MapView pts={stationPts} />
    {:else}
      <p class="caption">—</p>
    {/if}
  </aside>
</div>
