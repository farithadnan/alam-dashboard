<script>
import { onMount } from "svelte";
import { getCurrent, getForecast, getHazards, clock } from "../lib/api.js";
import { wmo, DAYS } from "../lib/flags.js";
import Seg from "./ui/Seg.svelte";

let { refresh = 0 } = $props();

let nowRows = $state([]); // open-meteo current (weather + aqi)
let forecast = $state([]);
let climate = $state(null);
let city = $state(null);
let updated = $state("");
let err = $state("");

const cities = $derived([...new Set(nowRows.filter((r) => r.kind === "weather").map((r) => r.station))]);
const cityOpts = $derived(cities.map((c) => ({ value: c, label: c === "johor-bahru" ? "Johor Bahru" : c.replace(/-/g, " ") })));
const nowCard = $derived({
  w: nowRows.find((r) => r.station === city && r.kind === "weather"),
  a: nowRows.find((r) => r.station === city && r.kind === "aqi"),
});
const myForecast = $derived(forecast.filter((r) => r.station === city).sort((a, b) => a.measuredAt.localeCompare(b.measuredAt)));
const today = new Date().toISOString().slice(0, 10);

async function load() {
  try {
    const [cur, fc, haz] = await Promise.all([getCurrent("open-meteo"), getForecast(), getHazards()]);
    nowRows = cur.current || [];
    forecast = fc.forecast || [];
    climate = haz.climate || null;
    if (!city) city = nowRows.find((r) => r.kind === "weather")?.station;
    updated = clock();
  } catch (e) {
    err = e.message;
  }
}

$effect(() => {
  if (refresh) load();
});
onMount(() => load());
</script>

{#if err}<p class="caption mb-2">Weather unavailable ({err})</p>{/if}

{#if cityOpts.length}
  <Seg options={cityOpts} value={city} onpick={(c) => (city = c)} />
{/if}

{#if nowCard.w}
  <div class="my-2">
    <div class="font-mono text-[46px] font-extrabold leading-none tracking-tighter">{Math.round(nowCard.w.value)}°</div>
    <p class="caption">
      {nowCard.w.meta?.humidity ?? "–"}% humidity · wind {nowCard.w.meta?.wind ?? "–"} km/h · UV {nowCard.a?.meta?.uv ?? "–"}
    </p>
  </div>
{/if}

<h3 class="qh">7-day forecast</h3>
<ul class="list-none m-0 border-t border-line p-0">
  {#each myForecast.slice(0, 7) as r (r.station + r.measuredAt)}
    {@const [icon, label] = wmo(r.meta?.code)}
    {@const isToday = r.measuredAt.slice(0, 10) === today}
    <li class="flex items-center gap-2.5 border-b border-line px-2.5 py-2">
      <span class="w-11 shrink-0 text-[14px] font-semibold">{isToday ? "Today" : DAYS[new Date(r.measuredAt).getUTCDay()]}</span>
      <span class="min-w-0 flex-1 truncate text-[14px]">{icon} {label}</span>
      {#if r.meta?.precip > 0}<span class="w-[58px] shrink-0 text-right text-[12.5px] text-muted">☔ {Math.round(r.meta.precip)}%</span>{:else}<span class="w-[58px] shrink-0"></span>{/if}
      <span class="w-[92px] shrink-0 text-right font-mono text-[14px] font-semibold">
        {Math.round(r.meta?.tmax ?? r.value)}° <span class="ml-1.5 text-muted">{Math.round(r.meta?.tmin ?? 0)}°</span>
      </span>
    </li>
  {/each}
</ul>

<h3 class="qh">Seasonal climate</h3>
{#if climate}
  {@const phase = climate.meta?.phase || "Neutral"}
  {@const col = phase.includes("El Niño") ? "#d3342f" : phase.includes("La Niña") ? "#2563eb" : "#8f5c00"}
  {@const text = phase.includes("El Niño") ? "El Niño is active — the equatorial Pacific is running warmer than usual." : phase.includes("La Niña") ? "La Niña is active — the equatorial Pacific is running cooler than usual." : "Neither El Niño nor La Niña — the equatorial Pacific is near normal."}
  <p class="text-[15px]"><b style="color:{col}">{phase}</b> — {text}</p>
{:else}
  <p class="caption">No climate phase yet.</p>
{/if}

{#if updated}<p class="caption mt-4">From Open-Meteo &amp; NOAA · updated {updated}</p>{/if}
