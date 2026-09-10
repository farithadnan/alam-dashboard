<script>
import { app } from "../lib/store.svelte.js";
import { timeAgo, regionOf, friendlyLoc, MAG_BORDER, magWord, magText } from "../lib/flags.js";
import { tr, magWordL } from "../lib/i18n.svelte.js";
import MapView from "./ui/MapView.svelte";

const quakes = $derived(app.data?.hazards?.earthquakes ?? []);
const regions = $derived([...new Set(quakes.map((q) => regionOf(q.stationName)))]);
const quakePts = $derived(
  quakes
    .filter((q) => q.meta?.lat && q.meta?.lon)
    .map((q) => ({
      lat: q.meta.lat, lon: q.meta.lon,
      title: `${friendlyLoc(q.stationName) || q.stationName} — M${Number(q.magnitude).toFixed(1)} ${magWordL(q.magnitude)}`,
      color: magText(magWord(q.magnitude)),
      size: Math.max(7, Math.min(22, (q.magnitude - 4) * 7)),
      ripple: true,
    })),
);
</script>

{#if app.loading}<p class="caption mb-2">{tr("updating")}</p>{/if}

<h3 class="qh">{tr("quakeTitle")}</h3>
<p class="caption -mt-1">{tr("quakeCap")}</p>

{#if quakePts.length}
  <MapView pts={quakePts} class="h-72 w-full rounded-xl lg:h-[480px]" />
{:else}
  <p class="caption">—</p>
{/if}

<ul class="mt-2 list-none m-0 border-t border-line p-0">
  {#each quakes as q (q.station + q.measuredAt)}
    <li class="flex items-center gap-2 border-b border-line px-2.5 py-2 pl-2" style="border-left:3px solid {MAG_BORDER(q.magnitude)}">
      <div class="min-w-0 flex-1">
        <div class="text-[14.5px] font-semibold leading-tight">{friendlyLoc(q.stationName) || q.stationName}</div>
        <div class="text-[12.5px] text-muted">{regionOf(q.stationName)} · {timeAgo(q.measuredAt)}</div>
      </div>
      <span class="font-mono text-[18px] font-bold leading-none" style="color:{magText(magWord(q.magnitude))}">{q.magnitude?.toFixed(1)}</span>
      <span class="w-14 shrink-0 text-[13px] font-bold" style="color:{magText(magWord(q.magnitude))}">{magWordL(q.magnitude)}</span>
    </li>
  {/each}
</ul>
