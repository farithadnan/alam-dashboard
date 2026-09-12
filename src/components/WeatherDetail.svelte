<script>
import { app } from "../lib/store.svelte.js";
import { getOfficial, getHistory } from "../lib/api.js";
import { wmo, moonPhase, numColor } from "../lib/flags.js";
import { mapPopup } from "../lib/popup.js";
import { tr, wmoLabel, bandLabel, bandAdvice } from "../lib/i18n.svelte.js";
import { shareCard } from "../lib/sharecard.js";
import { createLoader } from "../lib/async.js";
import Carousel from "./ui/Carousel.svelte";
import StatCard from "./ui/StatCard.svelte";
import MapView from "./ui/MapView.svelte";
import TrendChart from "./ui/TrendChart.svelte";
import Spinner from "./ui/Spinner.svelte";
import Skeleton from "./ui/Skeleton.svelte";
import ShareButton from "./ui/ShareButton.svelte";
import { sharePayload } from "../lib/share.js";

/** Full detail for ONE town — reused by "near me" and by tapping a card anywhere. */
let { station = "", onClose = null } = $props();

const weather = $derived(app.data?.weather ?? []);
const towns = $derived(weather.filter((r) => r.kind === "weather"));
const now = $derived(towns.find((r) => r.station === station));
const townName = $derived(now?.stationName ?? app.data?.allTowns?.find((t) => t.station === station)?.name ?? "");
const stateName = $derived(now?.meta?.state ?? app.state ?? "");
const air = $derived(weather.find((r) => r.station === station && r.kind === "aqi"));
const stations = $derived(app.data?.stations ?? []);
const townAir = $derived(stations.find((s) => s.station === station) ?? null);
const forecast = $derived((app.data?.forecast ?? []).filter((r) => r.station === station).sort((a, b) => a.measuredAt.localeCompare(b.measuredAt)).slice(0, 10));
const hourly = $derived((app.data?.hourly ?? []).filter((r) => r.station === station).sort((a, b) => a.measuredAt.localeCompare(b.measuredAt)));
let airSeries = $state([]);
let airLoading = $state(false);
const loadAir = createLoader();
$effect(() => {
  const st = townAir?.station;
  if (!st) { airSeries = []; return; }
  airLoading = true;
  loadAir(() => getHistory("doe-eqms", st, 24), {
    onValue: (res) => (airSeries = (res.history ?? []).map((r) => ({ t: r.measuredAt, v: r.value }))),
    onError: () => (airSeries = []),
    onSettled: () => (airLoading = false),
  });
});
const moon = moonPhase();

const mapPts = $derived(
  towns
    .filter((r) => r.coords?.lat)
    .map((r) => {
      const [icon] = wmo(String(r.meta?.code));
      const on = r.station === station;
      return { id: r.station, lat: r.coords.lat, lon: r.coords.lon, emoji: icon, color: on ? "#c14a1f" : "#8a8277", size: on ? 30 : 22, html: mapPopup({ title: r.stationName, value: `${Math.round(r.value)}°`, valueColor: "#6b6258" }) };
    }),
);
const focus = $derived(now?.coords ? { lat: now.coords.lat, lon: now.coords.lon, zoom: 9 } : null);

// MET official forecast for this town's state/district.
let official = $state([]);
let officialLoading = $state(false);
const loadOfficial = createLoader();
$effect(() => {
  const st = stateName;
  if (!st) return;
  officialLoading = true;
  loadOfficial(() => getOfficial(st, station), {
    onValue: (r) => (official = r.official ?? []),
    onError: () => (official = []),
    onSettled: () => (officialLoading = false),
  });
});
// Rows are already scoped to this town's district by the API (town -> district
// mapping lives there, next to the locality and district data). Array.prototype.at
// keeps this a plain read: no district resolved means no rows, so nothing renders.
const district = $derived(official.at(0) ?? null);
const districtDays = $derived(district ? official.filter((o) => o.district === district.district) : []);
const dayName = (d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(d + "T00:00:00").getDay()];
const hm = (t) => (t ? String(t).slice(11, 16) : "—");
function hourLabel(t) {
  const h = parseInt((t || "").slice(11, 13) || "0", 10) || 0;
  return h < 12 ? `${h || 12}am` : h === 12 ? "12pm" : `${h - 12}pm`;
}
</script>

{#if now}
  {@const [icon, label] = now.meta?.code != null ? wmo(String(now.meta.code)) : [null, null]}
  <div class="relative mt-1">
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <div class="text-[15px] font-semibold">{townName}{#if stateName}<span class="text-muted">, {stateName}</span>{/if}</div>
      </div>
      <div class="flex shrink-0 gap-1.5">
        {#if onClose}<button class="iconbtn" onclick={onClose} aria-label={tr("back")}>← {tr("back")}</button>{/if}
        <ShareButton payload={sharePayload({ town: townName, state: stateName, now, townAir, air })} />
      </div>
    </div>
    <div class="mt-1 flex items-end gap-3 sm:gap-4">
      {#if icon}<span class="shrink-0 text-[34px] leading-none sm:text-[52px]" aria-hidden="true">{icon}</span>{/if}
      <div class="font-mono text-[40px] font-extrabold leading-none tracking-tighter sm:text-[60px]">{Math.round(now.value)}°</div>
      <div class="pb-1 text-[13px] text-muted sm:pb-1.5 sm:text-[14px]">{tr("feels")} {Math.round(now.meta?.apparentTemp ?? now.value)}° · {wmoLabel(label)}</div>
    </div>
  </div>

  {#if hourly.length}
    <Carousel class="mt-3">
      {#each hourly as h, i (h.measuredAt)}
        {@const [icon] = wmo(String(h.meta?.code))}
        <div class="glass flex w-[24%] shrink-0 flex-col items-center rounded-xl px-2 py-3 sm:w-[18%]">
          <span class="text-[12px] text-muted">{i === 0 ? tr("today") : hourLabel(h.measuredAt)}</span>
          <span class="text-[24px] leading-none" aria-hidden="true">{icon}</span>
          <span class="font-mono text-[15px] font-semibold">{Math.round(h.value)}°</span>
          {#if h.meta?.precip > 0}<span class="text-[11px] text-muted">☔ {Math.round(h.meta.precip)}%</span>{/if}
        </div>
      {/each}
    </Carousel>
  {:else if app.loading}
    <p class="caption mt-2 text-[12px]">{tr("loading")}</p>
    <div class="flex gap-2 overflow-hidden">
      {#each Array(6) as _, i (i)}
        <Skeleton h={76} w="76px" class="!shrink-0 !rounded-xl" />
      {/each}
    </div>
  {/if}

  <h3 class="qh">{tr("todayDetail")}</h3>
  <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
    <StatCard label={tr("wind")} value={`${now.meta?.wind ?? "–"} km/h`} sub={`${tr("gust")} ${now.meta?.gust ?? "–"}`} />
    <StatCard label={tr("humidity")} value={`${now.meta?.humidity ?? "–"}%`} />
    <StatCard label={tr("dewPoint")} value={now.meta?.dewPoint != null ? `${Math.round(now.meta.dewPoint)}°` : "–"} />
    <StatCard label={tr("pressure")} value={now.meta?.pressure != null ? `${Math.round(now.meta.pressure)} hPa` : "–"} />
    <StatCard label={tr("visibility")} value={now.meta?.visibility != null ? `${(now.meta.visibility / 1000).toFixed(1)} km` : "–"} />
    <StatCard label={tr("uv")} value={air?.meta?.uv ?? "–"} />
    <StatCard label={tr("sunrise")} value={hm(now.meta?.sunrise)} />
    <StatCard label={tr("sunset")} value={hm(now.meta?.sunset)} />
    <div class="glass flex items-center gap-2 rounded-xl px-3 py-2"><span class="text-[20px]">{moon.emoji}</span><div><div class="caption text-[11px]">{tr("moon")}</div><div class="text-[14px] font-semibold">{moon.name}</div></div></div>
  </div>

  {#if townAir && airSeries.length >= 2}
    <h3 class="qh">{tr("airNow")}</h3>
    <div class="glass rounded-xl p-3">
      <div class="flex items-baseline gap-2">
        <span class="font-mono text-[28px] font-bold" style="color:{numColor(townAir.band?.label)}">{townAir.value}</span>
        <span class="text-[13px] font-semibold" style="color:{numColor(townAir.band?.label)}">{bandLabel(townAir.band?.label)}</span>
        <span class="text-[12px] text-muted">{tr("chartPast24")}</span>
      </div>
      {#if airLoading}
        <div class="flex h-[170px] items-center justify-center"><Spinner size={22} label={tr("loading")} /></div>
      {:else}
        <TrendChart series={airSeries} color={numColor(townAir.band?.label)} ariaLabel="Air quality trend" />
      {/if}
    </div>
  {/if}

  <h3 class="qh">{tr("forecast")}</h3>
  {#if app.loading && !forecast.length}
    <div class="flex gap-2 overflow-hidden">
      {#each Array(7) as _, i (i)}
        <Skeleton h={112} w="104px" class="!shrink-0 !rounded-xl" />
      {/each}
    </div>
  {:else}
  <Carousel>
    {#each forecast as r (r.station + r.measuredAt)}
      {@const [icon, label] = wmo(String(r.meta?.code))}
      {@const isToday = r.measuredAt.slice(0, 10) === new Date().toISOString().slice(0, 10)}
      <div class="glass flex w-[30%] shrink-0 flex-col items-center gap-1 rounded-xl px-2 py-3 sm:w-[17%]">
        <span class="text-[13px] font-semibold">{isToday ? tr("today") : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(r.measuredAt).getUTCDay()]}</span>
        <span class="text-[26px] leading-none" aria-hidden="true">{icon}</span>
        <span class="text-[12px] text-muted">{wmoLabel(label)}</span>
        <span class="font-mono text-[15px] font-semibold">{Math.round(r.meta?.tmax ?? r.value)}° <span class="ml-1 text-muted">{Math.round(r.meta?.tmin ?? 0)}°</span></span>
        {#if r.meta?.precip > 0}<span class="text-[11px] text-muted">☔ {Math.round(r.meta.precip)}%</span>{/if}
      </div>
    {/each}
  </Carousel>
  {/if}

  {#if officialLoading}
    <h3 class="qh">{tr("officialTitle")}</h3>
    <div class="mt-1 space-y-2">
      <Skeleton h={14} w="45%" />
      <Skeleton h={34} />
      <Skeleton h={34} />
      <Skeleton h={34} />
    </div>
  {:else if district}
    <h3 class="qh">{tr("officialTitle")}</h3>
    <p class="caption -mt-1">{tr("officialNote")} · {district.district}</p>
    <ul class="list-none m-0 border-t border-line p-0">
      {#each districtDays.slice(0, 7) as d (d.date)}
        <li class="flex items-center gap-3 border-b border-line px-2.5 py-2 text-[13.5px]">
          <span class="w-10 shrink-0 text-muted">{dayName(d.date)}</span>
          <span class="min-w-0 flex-1">{d.summary}{#if d.when}<span class="text-muted"> · {d.when}</span>{/if}</span>
          <span class="shrink-0 font-mono text-[13px] font-semibold">{d.tmax}° <span class="text-muted">{d.tmin}°</span></span>
        </li>
      {/each}
    </ul>
  {/if}

  {#if mapPts.length}
    <h3 class="qh">{tr("stationsMap")}</h3>
    <MapView pts={mapPts} fit={!focus} focus={focus} onPick={(id) => (app.picked = id)} class="h-64 w-full rounded-xl lg:h-[40vh]" />
  {/if}
{:else if app.loading}
  <div class="mt-2 space-y-3">
    <Skeleton h={16} w="40%" />
    <Skeleton h={72} w="55%" />
    <div class="flex gap-2 overflow-hidden">
      {#each Array(6) as _, i (i)}
        <Skeleton h={76} w="76px" class="!shrink-0 !rounded-xl" />
      {/each}
    </div>
    <Skeleton h={14} w="30%" />
    <Skeleton h={64} class="!rounded-xl" />
    <Skeleton h={14} w="22%" />
    <div class="flex gap-2 overflow-hidden">
      {#each Array(5) as _, i (i)}
        <Skeleton h={112} w="104px" class="!shrink-0 !rounded-xl" />
      {/each}
    </div>
  </div>
{:else}
  <div class="flex min-h-[45vh] items-center justify-center">
    <p class="caption">{tr("noData")}</p>
  </div>
{/if}
