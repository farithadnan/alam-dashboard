<script>
import { j } from "../lib/api.js";
import { tr } from "../lib/i18n.svelte.js";

const ENDPOINTS = [
  { m: "GET", p: "/api/summary?state=Johor", d: "Current weather, AQI, forecast, hourly, warnings and earthquakes (optionally filtered per state)." },
  { m: "GET", p: "/api/stations", d: "List of known monitoring stations." },
  { m: "GET", p: "/api/history?source=doe-eqms&station=<slug>&since=<iso>", d: "Observation history for a station." },
  { m: "GET", p: "/api/forecast?source=open-meteo", d: "Daily forecast rows." },
  { m: "GET", p: "/api/hazards", d: "Weather warnings, recent earthquakes and climate phase." },
  { m: "GET", p: "/health", d: "Liveness check." },
];
let result = $state(null);
let err = $state("");
let loading = $state(false);
async function tryIt() {
  loading = true; err = "";
  try { result = await j("./api/summary?state=Johor"); } catch (e) { err = e.message; }
  loading = false;
}
</script>

<section class="mx-auto max-w-[72ch] py-6">
  <h2 class="text-[22px] font-bold">{tr("apiTitle")}</h2>
  <p class="mt-2 leading-relaxed">{tr("apiIntro")}</p>
  <p class="caption mt-2">{tr("apiNote")}</p>

  <ul class="mt-5 list-none space-y-3 p-0">
    {#each ENDPOINTS as e (e.p)}
      <li class="border-b border-line pb-3">
        <div class="flex items-baseline gap-2">
          <span class="shrink-0 rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[11px] font-bold text-accent">{e.m}</span>
          <code class="font-mono text-[13px]">{e.p}</code>
        </div>
        <p class="mt-1 text-[13px] text-muted">{e.d}</p>
      </li>
    {/each}
  </ul>

  <h3 class="mt-6 text-[15px] font-bold">{tr("apiTry")}</h3>
  <button class="btn-primary mt-2" onclick={tryIt}>{loading ? "…" : "GET /api/summary?state=Johor"}</button>
  {#if err}<p class="caption mt-2">Error: {err}</p>{/if}
  {#if result}
    <pre class="mt-3 max-h-[360px] overflow-auto rounded-xl border border-line bg-panel p-3 text-[12px] leading-relaxed">{JSON.stringify(result, null, 2).slice(0, 6000)}</pre>
  {/if}
</section>
