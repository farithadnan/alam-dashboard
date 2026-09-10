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
    .map((q) => ({
      lat: q.meta.lat, lon: q.meta.lon,
      title: `${friendlyLoc(q.stationName) || q.stationName} — M${Number(q.magnitude).toFixed(1)} ${magWordL(q.magnitude)}`,
      color: magText(magWord(q.magnitude)),
      size: Math.max(12, Math.min(24, 12 + (q.magnitude - 4) * 5)),
      num: Number(q.magnitude).toFixed(1),
      ripple: true,
    })),
);
const groups = $derived(groupBy(quakes.slice().sort((a, b) => b.magnitude - a.magnitude), (q) => regionOf(q.stationName)));
let open = $state(null);
</script>

{#if app.loading}<p class="caption mb-2">{tr("updating")}</p>{/if}

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
              <p class="m-0">Depth {q.meta?.depth ? `${q.meta.depth} km` : "—"} · {regionOf(q.stationName)}</p>
              {#if q.meta?.url}<p class="m-0"><a class="text-accent underline" href={q.meta.url} target="_blank" rel="noopener">USGS event page ↗</a></p>{/if}
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  </Section>
{/each}
