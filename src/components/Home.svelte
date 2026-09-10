<script>
import { app } from "../lib/store.svelte.js";
import { wmo, cityOf, numColor } from "../lib/flags.js";
import { tr, trFmt, bandLabel, bandAdvice } from "../lib/i18n.svelte.js";
import Warnings from "./Warnings.svelte";

let { onNavigate = () => {} } = $props();

const weather = $derived(app.data?.weather ?? []);
const stations = $derived((app.data?.stations ?? []).slice().sort((a, b) => b.value - a.value));
const townName = $derived(weather.find((r) => r.station === app.town && r.kind === "weather")?.stationName ?? app.data?.allTowns?.find((t) => t.station === app.town)?.name ?? app.town ?? "");
const now = $derived(weather.find((r) => r.station === app.town && r.kind === "weather"));
const air = $derived(weather.find((r) => r.station === app.town && r.kind === "aqi"));
const townAir = $derived(stations.find((s) => atTown(s)) ?? null);
const warnings = $derived(app.data?.hazards?.warnings ?? []);
const quakes = $derived(app.data?.hazards?.earthquakes ?? []);
const climate = $derived(app.data?.hazards?.climate ?? null);
const news = $derived(app.data?.news ?? []);

function atTown(o) {
  const t = (townName || "").toLowerCase().replace(/\s+/g, " ");
  const s = (o.stationName || "").toLowerCase().replace(/\s+/g, " ");
  return t && s && (s.includes(t) || t.includes(s) || o.station === app.town);
}
</script>

{#if now}
  {@const [icon, label] = now.meta?.code != null ? wmo(String(now.meta.code)) : [null, null]}
  <div class="glass mt-1 flex items-center gap-4 rounded-2xl p-4">
    <div class="min-w-0 flex-1">
      <div class="text-[15px] font-semibold">{townName}{#if app.state}<span class="text-muted">, {app.state}</span>{/if}</div>
      <div class="mt-1 flex items-end gap-3">
        {#if icon}<span class="text-[40px] leading-none" aria-hidden="true">{icon}</span>{/if}
        <span class="font-mono text-[44px] font-extrabold leading-none tracking-tighter">{Math.round(now.value)}°</span>
        <span class="pb-1 text-[13px] text-muted">{tr("feels")} {Math.round(now.meta?.apparentTemp ?? now.value)}° · {label ? "" : ""}</span>
      </div>
    </div>
    {#if townAir}
      <div class="shrink-0 rounded-xl border px-3 py-1.5 text-center" style="border-color:{numColor(townAir.band?.label)}">
        <div class="caption text-[11px]">{tr("airNow")}</div>
        <div class="font-mono text-[22px] font-bold leading-none" style="color:{numColor(townAir.band?.label)}">{townAir.value}</div>
        <div class="text-[11px] font-semibold" style="color:{numColor(townAir.band?.label)}">{bandLabel(townAir.band?.label)}</div>
      </div>
    {:else if air}
      <div class="shrink-0 text-right"><div class="caption text-[11px]">US AQI</div><div class="font-mono text-[20px] font-semibold">{air.value}</div></div>
    {/if}
  </div>
{/if}

<div class="mt-2 flex flex-wrap gap-2 text-[13px]">
  <span class="glass rounded-full px-3 py-1">{trFmt("warningsInForce", { n: warnings.length })}</span>
  <span class="glass rounded-full px-3 py-1">{trFmt("quakesWeek", { n: quakes.length })}</span>
  {#if climate}<span class="glass rounded-full px-3 py-1">{climate.meta?.phase || "Neutral"}</span>{/if}
</div>

<h3 class="qh">{tr("advisories")}</h3>
<Warnings />
{#if climate}
  {@const phase = climate.meta?.phase || "Neutral"}
  <p class="caption mt-1">{phase.includes("El Niño") ? tr("climateEl") : phase.includes("La Niña") ? tr("climateLa") : tr("climateNeutral")}</p>
{/if}

<h3 class="qh">{tr("newsTitle")}</h3>
{#if news.length}
  <ul class="list-none m-0 border-t border-line p-0">
    {#each news as n (n.url)}
      <li class="border-b border-line px-2.5 py-2.5">
        <a class="text-[14px] font-semibold hover:text-accent" href={n.url} target="_blank" rel="noopener">{n.title}</a>
        <div class="text-[12px] text-muted">{n.outlet}</div>
      </li>
    {/each}
  </ul>
{:else}
  <p class="caption">{tr("noNews")}</p>
{/if}

<h3 class="qh">{tr("explore")}</h3>
<div class="flex flex-wrap gap-2">
  <button class="glass rounded-xl px-4 py-3 text-[14px] font-semibold" onclick={() => onNavigate("weather")}>{tr("navWeather")}</button>
  <button class="glass rounded-xl px-4 py-3 text-[14px] font-semibold" onclick={() => onNavigate("air")}>{tr("navAQI")}</button>
  <button class="glass rounded-xl px-4 py-3 text-[14px] font-semibold" onclick={() => onNavigate("hazards")}>{tr("navHazards")}</button>
</div>
