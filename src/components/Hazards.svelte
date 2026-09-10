<script>
import { app } from "../lib/store.svelte.js";
import { timeAgo, regionOf, friendlyLoc, MAG_BORDER, magWord, magText, severityColor } from "../lib/flags.js";
import { tr, trFmt, severityWord, magWordL } from "../lib/i18n.svelte.js";
import MapView from "./ui/MapView.svelte";

const warnings = $derived(
  (app.data?.hazards?.warnings ?? []).filter((w) => {
    const vt = w.meta?.validTo;
    return !vt || new Date(vt) >= new Date(Date.now() - 3600e3);
  }),
);
const quakes = $derived(app.data?.hazards?.earthquakes ?? []);
const regions = $derived([...new Set(quakes.map((q) => regionOf(q.stationName)))]);
const climate = $derived(app.data?.hazards?.climate ?? null);
const quakePts = $derived(
  quakes
    .filter((q) => q.meta?.lat && q.meta?.lon)
    .map((q) => ({
      lat: q.meta.lat, lon: q.meta.lon,
      title: `${friendlyLoc(q.stationName) || q.stationName} — M${Number(q.magnitude).toFixed(1)} ${magWordL(q.magnitude)}`,
      color: magText(magWord(q.magnitude)),
      size: Math.max(7, Math.min(20, (q.magnitude - 4) * 7)),
      ripple: true,
    })),
);
let openW = $state({});

function parseAdvisory(t) {
  const c = (t || "").replace(/\s+/g, " ").trim();
  const m = c.match(/are expected over (the (?:states|waters) of )?([\s\S]{4,220}?) until ([\d:]+ ?(?:AM|PM)?)/i);
  if (m) return { p: m[2].trim().replace(/•\s*/g, " • "), time: m[3].trim(), marine: !(m[1] && m[1].includes("states")) };
  return c.length > 150 ? c.slice(0, 147) + "…" : c;
}
function toggle(w) {
  openW[w.station + w.measuredAt] = !openW[w.station + w.measuredAt];
}
</script>

{#if warnings.length || quakes.length}
  <p class="caption">{tr("fromSrc2")}{#if app.updated} · {tr("updated")} {app.updated}{/if}</p>
{/if}

{#if warnings.length}
  <h3 class="qh">{tr("warningsTitle")}</h3>
  <ul class="list-none m-0 border-t border-line p-0">
    {#each warnings as w (w.station + w.measuredAt)}
      {@const pb = w.meta?.textEn ? parseAdvisory(w.meta.textEn) : ""}
      <li class="border-b border-line px-2.5 py-2.5 pl-2">
        <div class="flex items-start gap-2">
          <span class="mt-1.5 size-2.5 shrink-0 rounded-full" style="background:{severityColor(w.severity)}"></span>
          <div class="min-w-0 flex-1">
            <div class="text-[14.5px] font-semibold leading-tight">{w.title}</div>
            <div class="text-[12.5px] text-muted">{w.meta?.titleBm || ""}{#if w.meta?.titleBm} ·{/if} {timeAgo(w.measuredAt)}</div>
            {#if w.meta?.validTo}
              <div class="text-[12px] text-muted">{tr("validUntil")} {new Date(w.meta.validTo).toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short" })}</div>
            {/if}
            {#if pb}
              {#if typeof pb === "object"}
                <p class="mt-0.5 text-[12.5px] text-muted">{trFmt("expectedOver", { p: pb.p, t: pb.time, m: pb.marine ? tr("onSea") : tr("onLand") })}</p>
                <button class="ghostbtn mt-1 text-[12px]" onclick={() => toggle(w)}>{openW[w.station + w.measuredAt] ? tr("hideFull") : tr("readFull")}</button>
                {#if openW[w.station + w.measuredAt]}
                  <p class="mt-1 text-[12px] text-muted">{w.meta.textEn}</p>
                {/if}
              {:else}
                <p class="mt-0.5 text-[12.5px] text-muted">{pb}</p>
                {#if w.meta?.textEn?.length > 150}
                  <button class="ghostbtn mt-1 text-[12px]" onclick={() => toggle(w)}>{openW[w.station + w.measuredAt] ? tr("hideFull") : tr("readFull")}</button>
                  {#if openW[w.station + w.measuredAt]}
                    <p class="mt-1 text-[12px] text-muted">{w.meta.textEn}</p>
                  {/if}
                {/if}
              {/if}
            {/if}
          </div>
          <span class="shrink-0 whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-bold" style="color:{severityColor(w.severity)};background:color-mix(in srgb, {severityColor(w.severity)} 14%, transparent)">{severityWord(w.severity)}</span>
        </div>
      </li>
    {/each}
  </ul>
{/if}

<h3 class="qh">{tr("quakeTitle")}</h3>
<p class="caption -mt-1">{tr("quakeCap")}</p>

<div class="lg:grid lg:grid-cols-[300px_1fr] lg:gap-6 lg:items-start">
  <div class="mb-3 lg:mb-0 lg:sticky lg:top-3">
    {#if quakePts.length}
      <MapView pts={quakePts} />
    {:else}
      <p class="caption">—</p>
    {/if}
  </div>
  <div class="min-w-0">
    {#if quakes.length}
      {#each regions as region (region)}
        <div class="qh">{region}</div>
        <ul class="list-none m-0 border-t border-line p-0">
          {#each quakes.filter((q) => regionOf(q.stationName) === region).sort((a, b) => b.magnitude - a.magnitude) as q}
            <li class="border-b border-line px-2.5 py-2.5 pl-2" style="border-left:3px solid {MAG_BORDER(q.magnitude)}">
              <div class="flex items-center gap-2">
                <div class="min-w-0 flex-1">
                  <div class="text-[14.5px] font-semibold leading-tight">{friendlyLoc(q.stationName) || q.stationName}</div>
                  <div class="text-[12.5px] text-muted">{timeAgo(q.measuredAt)}</div>
                </div>
                <span class="font-mono text-[18px] font-bold leading-none" style="color:{magText(magWord(q.magnitude))}">{q.magnitude?.toFixed(1)}</span>
                <span class="w-14 shrink-0 text-[13px] font-bold" style="color:{magText(magWord(q.magnitude))}">{magWordL(q.magnitude)}</span>
              </div>
            </li>
          {/each}
        </ul>
      {/each}
    {:else}
      <p class="caption">{tr("noQuakes")}</p>
    {/if}
  </div>
</div>

{#if climate}
  {@const phase = climate.meta?.phase || "Neutral"}
  <h3 class="qh">{tr("climateHead")}</h3>
  {#if phase.includes("El Niño")}
    <p class="caption -mt-1">{tr("climateEl")}</p>
  {:else if phase.includes("La Niña")}
    <p class="caption -mt-1">{tr("climateLa")}</p>
  {:else}
    <p class="caption -mt-1">{tr("climateNeutral")}</p>
  {/if}
{/if}
