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
let openW = $state({});
function short(t) {
  if (!t) return "";
  const c = t.replace(/\s+/g, " ").trim();
  if (c.length <= 110) return c;
  return c.slice(0, 107) + "…";
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
            <div class="text-[14.5px] font-semibold leading-tight">{w.meta?.titleBm || w.title}</div>
            <div class="text-[12.5px] text-muted">{w.title} · {timeAgo(w.measuredAt)}</div>
            {#if w.meta?.validTo}
              <div class="text-[12px] text-muted">Valid until {new Date(w.meta.validTo).toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short" })}</div>
            {/if}
            {#if w.meta?.textEn}
              <p class="mt-0.5 text-[12.5px] text-muted">{openW[w.station + w.measuredAt] ? w.meta.textEn : short(w.meta.textEn)}</p>
              {#if short(w.meta.textEn) !== w.meta.textEn}
                <button class="ghostbtn mt-1 text-[12px]" onclick={() => toggle(w)}>Details</button>
              {/if}
            {/if}
          </div>
          <span class="shrink-0 text-[12px] font-semibold" style="color:{severityColor(w.severity)}">{severityWord(w.severity)}</span>
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
            <span class="shrink-0 text-[13px] font-bold" style="color:{magText(magWord(q.magnitude))}">{magWord(q.magnitude)}</span>
          </div>
        </li>
      {/each}
    </ul>
  {/each}
{:else}
  <p class="caption">No quakes at 4.5+ in the last week around the region.</p>
{/if}
