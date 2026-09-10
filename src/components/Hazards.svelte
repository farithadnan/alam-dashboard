<script>
import { app } from "../lib/store.svelte.js";
import { timeAgo, magWord, magText, MAG_BORDER, regionOf, friendlyLoc, severityWord, severityColor } from "../lib/flags.js";

const warnings = $derived(
  (app.data?.hazards?.warnings ?? []).filter((w) => {
    const vt = w.meta?.validTo;
    return !vt || new Date(vt) >= new Date(Date.now() - 3600e3);
  }),
);
const quakes = $derived(app.data?.hazards?.earthquakes ?? []);
const regions = $derived([...new Set(quakes.map((q) => regionOf(q.stationName)))]);
const climate = $derived(app.data?.hazards?.climate ?? null);
let openW = $state({});
/** Human, one-line advisory: extract the "expected over <places> until <time>" clause; mark land vs marine. */
function blurb(t) {
  if (!t) return "";
  const c = t.replace(/\s+/g, " ").trim();
  const m = c.match(/are expected over (the (?:states|waters) of )?([\s\S]{4,220}?) until ([\d:]+ ?(?:AM|PM)?)/i);
  if (m) {
    const places = m[2].trim().replace(/•\s*/g, " • ");
    return `Expected over ${places} — into ${m[3].trim()}` + (m[1] && m[1].includes("states") ? " (on land)" : " (sea areas)");
  }
  const cut = c.length > 150 ? c.slice(0, 147) + "…" : c;
  return cut.replace(/SECTION [AB][\s\S]*?/g, "").trim();
}
function toggle(w) {
  openW[w.station + w.measuredAt] = !openW[w.station + w.measuredAt];
}
</script>

{#if warnings.length || quakes.length}<p class="caption">From <b class="text-fg">MET Malaysia &amp; USGS</b>{#if app.updated} · updated {app.updated}{/if}</p>{/if}

{#if warnings.length}
  <h3 class="qh">Weather warnings · Malaysia</h3>
  <ul class="list-none m-0 border-t border-line p-0">
    {#each warnings as w (w.station + w.measuredAt)}
      <li class="border-b border-line px-2.5 py-2.5 pl-2">
        <div class="flex items-start gap-2">
          <span class="mt-1.5 size-2.5 shrink-0 rounded-full" style="background:{severityColor(w.severity)}"></span>
          <div class="min-w-0 flex-1">
            <div class="text-[14.5px] font-semibold leading-tight">{w.title}</div>
            <div class="text-[12.5px] text-muted">{w.meta?.titleBm || ""}{#if w.meta?.titleBm} ·{/if} {timeAgo(w.measuredAt)}</div>
            {#if w.meta?.validTo}
              <div class="text-[12px] text-muted">Valid until {new Date(w.meta.validTo).toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short" })}</div>
            {/if}
            {#if w.meta?.textEn}
              <p class="mt-0.5 text-[12.5px] text-muted">{openW[w.station + w.measuredAt] ? w.meta.textEn : blurb(w.meta.textEn)}</p>
              {#if blurb(w.meta.textEn) !== w.meta.textEn}
                <button class="ghostbtn mt-1 text-[12px]" onclick={() => toggle(w)}>{openW[w.station + w.measuredAt] ? "Hide" : "Read full advisory"}</button>
              {/if}
            {/if}
          </div>
          <span class="shrink-0 whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-bold" style="color:{severityColor(w.severity)};background:color-mix(in srgb, {severityColor(w.severity)} 14%, transparent)">{severityWord(w.severity)}</span>
        </div>
      </li>
    {/each}
  </ul>
{/if}

<h3 class="qh">Recent earthquakes · 4.5+ · past week</h3>
<p class="caption -mt-1">SE Asia, grouped by region · Magnitude 4.5 and above.</p>

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
            <span class="w-14 shrink-0 text-[13px] font-bold" style="color:{magText(magWord(q.magnitude))}">{magWord(q.magnitude)}</span>
          </div>
        </li>
      {/each}
    </ul>
  {/each}
{:else}
  <p class="caption">No quakes at 4.5+ in the last week around the region.</p>
{/if}

{#if climate}
  {@const phase = climate.meta?.phase || "Neutral"}
  {@const col = phase.includes("El Niño") ? "#2563eb" : phase.includes("La Niña") ? "#2563eb" : "#6b6258"}
  <h3 class="qh">Climate context</h3>
  {#if phase.includes("El Niño")}
    <p class="caption -mt-1">El Niño is active — a warmer Pacific often shifts rainfall around Malaysia.</p>
  {:else if phase.includes("La Niña")}
    <p class="caption -mt-1">La Niña is active — a cooler Pacific often brings wetter, stormier conditions to Malaysia.</p>
  {:else}
    <p class="caption -mt-1">Neutral — the equatorial Pacific is near its normal state.</p>
  {/if}
{/if}
