<script>
import { app } from "../lib/store.svelte.js";
import { timeAgo, regionOf, friendlyLoc, magWord, magText, groupBy } from "../lib/flags.js";
import { tr, magWordL } from "../lib/i18n.svelte.js";
import MapView from "./ui/MapView.svelte";
import Section from "./ui/Section.svelte";

const quakes = $derived(app.data?.hazards?.earthquakes ?? []);
const quakePts = $derived(
  quakes
    .filter((q) => q.meta?.lat && q.meta?.lon)
    .map((q) => {
      const col = magText(magWord(q.magnitude));
      const depth = q.meta?.depth != null ? `Depth ${Math.round(q.meta.depth)} km` : "";
      const meta = [depth, regionOf(q.stationName)].filter(Boolean).join(" · ");
      return {
        lat: q.meta.lat, lon: q.meta.lon, color: col, num: Number(q.magnitude).toFixed(1), size: 26, ripple: true,
        html: `<div style="font:600 15px system-ui;color:#242628">${friendlyLoc(q.stationName) || q.stationName}</div><div style="font:800 26px system-ui;line-height:1.1;color:${col}">M${Number(q.magnitude).toFixed(1)}</div><div style="font:600 12px system-ui;color:${col}">${magWordL(q.magnitude)}</div><div style="font:12px system-ui;color:#6b6258">${meta}</div>`,
      };
    }),
);
const groups = $derived(groupBy(quakes.slice().sort((a, b) => b.magnitude - a.magnitude), (q) => regionOf(q.stationName)));
let open = $state(null);
</script>


<h3 class="qh">{tr("quakeTitle")}</h3>
<p class="caption -mt-1">{tr("quakeCap")}</p>

{#if quakePts.length}
  <MapView pts={quakePts} class="h-72 w-full rounded-xl lg:h-[52vh] lg:min-h-[400px]" fitMax={8} />
{/if}

{#each groups as g (g.key)}
  <Section title={g.key} startOpen={groups.length === 1}>
    <ul class="list-none m-0 p-0">
      {#each g.items as q (q.station)}
        <li class="border-b border-line" style="border-left:3px solid {magText(magWord(q.magnitude)) === "#6b6258" ? "transparent" : magText(magWord(q.magnitude))}">
          <button class="flex w-full items-center gap-2 px-2.5 py-2.5 text-left" onclick={() => (open = open === q.station ? null : q.station)} aria-expanded={open === q.station}>
            <div class="min-w-0 flex-1">
              <div class="text-[14.5px] font-semibold leading-tight">{friendlyLoc(q.stationName) || q.stationName}</div>
              <div class="text-[12px] text-muted">{timeAgo(q.measuredAt)}</div>
            </div>
            <span class="font-mono text-[18px] font-bold leading-none" style="color:{magText(magWord(q.magnitude))}">{q.magnitude?.toFixed(1)}</span>
            <span class="font-mono text-muted">{open === q.station ? "−" : "+"}</span>
          </button>
          {#if open === q.station}
            <div class="px-3 pb-3 text-[13px] text-muted">
              <p class="m-0">Magnitude {q.magnitude?.toFixed(1)} · {magWordL(q.magnitude)}</p>
              {#if q.meta?.depth != null}<p class="m-0">Depth {Math.round(q.meta.depth)} km · {regionOf(q.stationName)}</p>
              {:else}<p class="m-0">{regionOf(q.stationName)}</p>{/if}
              {#if q.meta?.url}<p class="m-0"><a class="text-accent underline" href={q.meta.url} target="_blank" rel="noopener">USGS event page ↗</a></p>{/if}
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  </Section>
{/each}
