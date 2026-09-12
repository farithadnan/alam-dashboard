<script>
import { app } from "../lib/store.svelte.js";
import { numColor, atTown, timeAgo } from "../lib/flags.js";
import { wmo } from "../lib/weather-codes.js";
import { tr, trFmt, bandLabel, bandAdvice, wmoLabel } from "../lib/i18n.svelte.js";
import { shareCard } from "../lib/sharecard.js";
import { getHaze } from "../lib/api.js";
import { createLoader } from "../lib/async.js";
import SearchInput from "./ui/SearchInput.svelte";
import ShareButton from "./ui/ShareButton.svelte";
import TelegramAlerts from "./ui/TelegramAlerts.svelte";
import { sharePayload } from "../lib/share.js";
import { activeWarnings } from "../lib/warnings.js";
import Skeleton from "./ui/Skeleton.svelte";
import Warnings from "./Warnings.svelte";

let { onNavigate = () => {} } = $props();

const weather = $derived(app.data?.weather ?? []);
const stations = $derived((app.data?.stations ?? []).slice().sort((a, b) => b.value - a.value));
const townName = $derived(weather.find((r) => r.station === app.town && r.kind === "weather")?.stationName ?? app.data?.allTowns?.find((t) => t.station === app.town)?.name ?? app.town ?? "");
const now = $derived(weather.find((r) => r.station === app.town && r.kind === "weather"));
const air = $derived(weather.find((r) => r.station === app.town && r.kind === "aqi"));
const townAir = $derived(stations.find((s) => atTown(s, townName, app.town)) ?? null);
const warnings = $derived(activeWarnings(app.data?.hazards?.warnings ?? []));
const quakes = $derived(app.data?.hazards?.earthquakes ?? []);
const climate = $derived(app.data?.hazards?.climate ?? null);
const news = $derived(app.data?.news ?? []);
let newsQ = $state("");

// Haze outlook for the saved location: model PM2.5 peak per day (its own endpoint).
let haze = $state([]);
let hazeLoading = $state(false);
const loadHaze = createLoader();
$effect(() => {
  const town = app.town;
  if (!town) { haze = []; return; }
  hazeLoading = true;
  loadHaze(() => getHaze(town), {
    onValue: (r) => (haze = r.haze ?? []),
    onError: () => (haze = []),
    onSettled: () => (hazeLoading = false),
  });
});
let flash = $state(false);

/**
 * Scroll a section into view, optionally highlighting it. Scrolling alone looked like
 * nothing happened when the target was already near the fold.
 */
const jump = (id, highlight = false) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (!highlight) return;
  flash = true;
  setTimeout(() => (flash = false), 1600);
};

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dayLabel = (d) =>
  d === new Date().toISOString().slice(0, 10) ? tr("today") : DOW[new Date(`${d}T00:00:00`).getDay()];
const newsFiltered = $derived(
  news.filter((n) => {
    const q = newsQ.trim().toLowerCase();
    if (!q) return true;
    return `${n.title ?? ""} ${n.outlet ?? ""}`.toLowerCase().includes(q);
  }),
);


</script>

{#if now}
  {@const [icon, label] = now.meta?.code != null ? wmo(String(now.meta.code)) : [null, null]}
  <div class="glass mt-1 rounded-2xl p-4">
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0 text-[15px] font-semibold">{townName}{#if app.state}<span class="text-muted">, {app.state}</span>{/if}</div>
      <div class="flex shrink-0 items-center gap-1.5">
        <TelegramAlerts town={app.town} state={app.state} />
        <ShareButton payload={sharePayload({ town: townName, state: app.state, now, townAir, air })} />
      </div>
    </div>
    <div class="mt-1 flex items-end justify-between gap-3">
      <div class="flex min-w-0 items-end gap-3">
        {#if icon}<span class="shrink-0 text-[30px] leading-none sm:text-[40px]" aria-hidden="true">{icon}</span>{/if}
        <span class="font-mono text-[34px] font-extrabold leading-none tracking-tighter sm:text-[44px]">{Math.round(now.value)}°</span>
        <span class="pb-1 text-[13px] text-muted">{tr("feels")} {Math.round(now.meta?.apparentTemp ?? now.value)}°</span>
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
  </div>
{:else if app.loading}
  <!-- Settlement loading: never show the previous town's numbers as if they were current. -->
  <div class="glass mt-1 space-y-3 rounded-2xl p-4">
    <Skeleton h={16} w="42%" />
    <div class="flex items-end justify-between gap-3">
      <Skeleton h={40} w="45%" />
      <Skeleton h={54} w="86px" class="!rounded-xl" />
    </div>
  </div>
{/if}

<!-- Live chips: the highest-agency elements on the page, so they act. Warnings and
     climate jump to the advisory below; quakes open the Earthquakes view. -->
<div class="mt-2 flex flex-wrap gap-2 text-[13px]">
  <button type="button" class="glass chip cursor-pointer rounded-full px-3 py-1 hover:border-accent"
    aria-label={trFmt("warningsInForce", { n: warnings.length })} onclick={() => jump("advisories", true)}>
    {trFmt("warningsInForce", { n: warnings.length })}
  </button>
  <button type="button" class="glass chip cursor-pointer rounded-full px-3 py-1 hover:border-accent"
    aria-label={trFmt("quakesWeek", { n: quakes.length })} onclick={() => onNavigate("hazards")}>
    {trFmt("quakesWeek", { n: quakes.length })}
  </button>
  {#if climate}
    <button type="button" class="glass chip cursor-pointer rounded-full px-3 py-1 hover:border-accent"
      aria-label={String(climate.meta?.phase || "Neutral")} onclick={() => jump("advisories")}>
      {climate.meta?.phase || "Neutral"}
    </button>
  {/if}
</div>

<h3 class="qh" id="advisories" class:text-accent={flash}>{tr("advisories")}</h3>
<Warnings />
{#if climate}
  {@const phase = climate.meta?.phase || "Neutral"}
  {@const v = climate.meta?.value}
  {@const season = climate.meta?.season}
  <p class="caption mt-1">
    {phase.includes("El Niño") ? tr("climateEl") : phase.includes("La Niña") ? tr("climateLa") : tr("climateNeutral")}{#if v != null} · {v > 0 ? "+" : ""}{v}°C{#if season} ({season}){/if}{/if}
  </p>
  <p class="caption">{phase.includes("El Niño") ? tr("climateElEffect") : phase.includes("La Niña") ? tr("climateLaEffect") : tr("climateNeutralEffect")}</p>
{/if}

{#if hazeLoading && !haze.length}
  <h3 class="qh">{tr("hazeTitle")}</h3>
  <Skeleton h={54} />
{:else if haze.length}
  <h3 class="qh">{tr("hazeTitle")} <span class="text-muted">µg/m³</span></h3>
  <ul class="list-none m-0 border-t border-line p-0">
    {#each haze.slice(0, 4) as d (d.date)}
      <li class="flex items-center gap-3 border-b border-line px-2.5 py-2 text-[13.5px]">
        <span class="w-10 shrink-0 text-muted">{dayLabel(d.date)}</span>
        <span class="min-w-0 flex-1 text-muted">{d.aboveGuideline ? tr("hazeAbove") : tr("hazeBelow")}</span>
        <span class="shrink-0 font-mono text-[13px] font-semibold">{Math.round(d.pm25Max)}</span>
      </li>
    {/each}
  </ul>
{/if}

<h3 class="qh">{tr("newsTitle")}</h3>
{#if news.length}
  <SearchInput bind:value={newsQ} placeholder={tr("searchNews")} ariaLabel={tr("searchNews")} />
  {#if newsFiltered.length}
  <ul class="list-none m-0 border-t border-line p-0">
    {#each newsFiltered as n, i (n.url ?? n.title + i)}
      <li class="border-b border-line px-2.5 py-2.5">
        <a class="text-[14px] font-semibold hover:text-accent" href={n.url} target="_blank" rel="noopener">{n.title}</a>
        <div class="text-[12px] text-muted">{n.outlet}{#if n.publishedAt} · {timeAgo(n.publishedAt)}{/if}</div>
      </li>
    {/each}
  </ul>
  {:else}
    <p class="caption">{tr("noMatches")}</p>
  {/if}
{:else}
  <p class="caption">{tr("noNews")}</p>
{/if}

<h3 class="qh">{tr("explore")}</h3>
<div class="flex flex-wrap gap-2">
  <button class="glass rounded-xl px-4 py-3 text-[14px] font-semibold" onclick={() => onNavigate("weather")}>{tr("navWeather")}</button>
  <button class="glass rounded-xl px-4 py-3 text-[14px] font-semibold" onclick={() => onNavigate("air")}>{tr("navAQI")}</button>
  <button class="glass rounded-xl px-4 py-3 text-[14px] font-semibold" onclick={() => onNavigate("hazards")}>{tr("navHazards")}</button>
</div>
