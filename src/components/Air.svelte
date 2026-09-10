<script>
import { onMount } from "svelte";
import { getCurrent, getHistory, clock } from "../lib/api.js";
import { numColor, cityOf, nearestState } from "../lib/flags.js";
import Sparkline from "./ui/Sparkline.svelte";
import Seg from "./ui/Seg.svelte";

let { refresh = 0 } = $props();

let current = $state([]);
let selState = $state(null);
let nearest = $state(null); // {name, km}
let detail = $state(null); // {name, value, label, values, color}
let hours = $state(24);
let sparks = $state({}); // station -> {values, color}
let updated = $state("");
let err = $state("");

const availableStates = $derived([...new Set(current.map((o) => o.meta?.state).filter(Boolean))]);
const stations = $derived(current.filter((o) => o.meta?.state === selState).sort((a, b) => b.value - a.value));
const worst = $derived(stations[0]);
const hourOpts = [{ value: 24, label: "24h" }, { value: 168, label: "7d" }];

async function loadSparks() {
  const map = {};
  await Promise.all(
    stations.map(async (o) => {
      try {
        const h = await getHistory("doe-eqms", o.station, 24);
        map[o.station] = { values: (h.history || []).map((x) => x.value), color: numColor(o.band?.label) };
      } catch {}
    }),
  );
  sparks = map;
}
async function load() {
  try {
    const d = await getCurrent("doe-eqms");
    current = d.current || [];
    updated = clock();
    if (!selState || !availableStates.includes(selState)) {
      selState = nearest ? nearest.name : availableStates.includes("Johor") ? "Johor" : availableStates[0];
    }
    await loadSparks();
  } catch (e) {
    err = e.message;
  }
}
function onStateChange() {
  detail = null;
  loadSparks();
}
async function openDetail(o) {
  const h = await getHistory("doe-eqms", o.station, hours);
  detail = { name: cityOf(o.stationName), value: o.value, label: o.band?.label, values: (h.history || []).map((x) => x.value), color: numColor(o.band?.label) };
}
function setHours(h) {
  hours = h;
  const o = stations.find((s) => s.station === detailStation);
  if (o) openDetail(o);
}
let detailStation = null;

$effect(() => {
  if (refresh) load();
});
onMount(() => {
  load();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (p) => {
        nearest = nearestState(p.coords.latitude, p.coords.longitude);
        if (nearest && availableStates.includes(nearest.name)) {
          selState = nearest.name;
          loadSparks();
        }
      },
      () => {},
      { maximumAge: 300000, timeout: 8000 },
    );
  }
});
</script>

{#if err}<p class="caption mb-2">Could not reach the API ({err})</p>{/if}

<h3 class="qh -mb-1">Air quality</h3>
<div class="flex flex-wrap items-center gap-2">
  <select class="rounded-lg border border-line bg-panel px-3 py-1.5 text-[14px]" onchange={onStateChange} bind:value={selState}>
    {#each availableStates as name (name)}
      <option value={name}>{name}</option>
    {/each}
  </select>
  {#if nearest}<span class="caption">Nearest estimated: <b class="text-fg">{nearest.name}</b> (~{nearest.km} km)</span>{/if}
</div>
{#if updated}<p class="caption mt-1">From <b class="text-fg">DOE APIMS</b> · updated {updated}</p>{/if}

<ul class="legend flex flex-wrap list-none gap-x-3.5 gap-y-1.5 p-0">
  {#each [{ l: "Good", c: "#43a047" }, { l: "Moderate", c: "#f4a922" }, { l: "Unhealthy", c: "#e05d2b" }, { l: "Very Unhealthy", c: "#d3342f" }, { l: "Hazardous", c: "#8e24aa" }] as b}
    <li class="flex items-center gap-1.5 text-[12.5px] text-muted">
      <span class="inline-block size-2.5 rounded-full" style="background:{b.c}"></span>{b.l}
    </li>
  {/each}
</ul>

{#if detail}
  <div class="mb-4 mt-1 rounded-2xl border border-line bg-panel px-4 py-3">
    <div class="flex items-baseline justify-between gap-2">
      <span class="font-bold">{detail.name}</span>
      <span class="valuenum" style="color:{detail.color}">{detail.value}</span>
      <span class="flex-1"></span>
      <Seg options={hourOpts} value={hours} onpick={setHours} />
      <button class="ghostbtn" aria-label="Close trend" onclick={() => (detail = null)}>×</button>
    </div>
    <Sparkline values={detail.values} color={detail.color} class="h-[86px] w-full" />
    <p class="caption mt-1">{detail.label} · {hours >= 168 ? "past 7 days" : "past 24h"}</p>
  </div>
{/if}

<ul class="list-none border-t border-line m-0 p-0">
  {#each stations as o (o.station)}
    <li
      class="flex cursor-pointer items-center gap-3 border-b border-line px-2.5 py-3 pl-3.5 hover:bg-accent/5"
      style="border-left:3px solid {numColor(o.band?.label)}"
      tabindex="0"
      role="button"
      onclick={() => { detailStation = o.station; openDetail(o); }}
      onkeydown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); detailStation = o.station; openDetail(o); } }}
    >
      <div class="min-w-0 flex-1">
        <div class="text-[15px] font-semibold leading-tight">{cityOf(o.stationName)}</div>
        <div class="text-[12.5px] text-muted">{o.band?.label} · {o.band?.advice}</div>
      </div>
      {#if sparks[o.station]?.values}
        <Sparkline values={sparks[o.station].values} color={sparks[o.station].color} width={120} height={26} />
      {/if}
      <span class="valuenum text-right" style="color:{numColor(o.band?.label)}">{o.value}</span>
      <span class="text-[13px] text-muted">&rsaquo;</span>
    </li>
  {/each}
</ul>

{#if worst}
  <p class="mt-4 text-[14px] text-muted">Worst now: <b class="text-fg">{cityOf(worst.stationName)}</b> at <b style="color:{numColor(worst.band?.label)}">{worst.value}</b> ({worst.band?.label}). {worst.band?.advice}</p>
{/if}

<style>
  .valuenum { font: 650 22px/1 ui-monospace, "SF Mono", Menlo, Consolas, monospace; }
  .legend { margin-top: 12px; margin-bottom: 4px; }
</style>
