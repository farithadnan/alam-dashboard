<script>
import { app } from "../lib/store.svelte.js";
import { getOfficial, getHistory } from "../lib/api.js";
import { moonPhase, numColor, uvWord } from "../lib/flags.js";
import { wmo, isNightNow } from "../lib/weather-codes.js";
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
import { weatherSharePayload } from "../lib/share.js";

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
      const [icon] = wmo(String(r.meta?.code), isNightNow(r.meta));
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
// For the 7-day range strip: full-week temp bounds so every day shares the same scale.
const wkDays = $derived(districtDays.slice(0, 7));
const wkLo = $derived(wkDays.length ? Math.min(...wkDays.map((d) => d.tmin ?? 0)) : 0);
const wkHi = $derived(wkDays.length ? Math.max(...wkDays.map((d) => d.tmax ?? 0)) : 1);
const wkSpan = $derived(Math.max(1, wkHi - wkLo));
const barPct = (v) => Math.max(0, Math.min(100, ((v - wkLo) / wkSpan) * 100));
let selDay = $state(0);
// MET's district forecast is Malay free-text; pick a stand-in icon from the wording.
const metIcon = (text) => {
  const t = (text || "").toLowerCase();
  if (/petir|ribut|thunder|storm/.test(t)) return "⛈️";
  if (/lebat|heavy rain/.test(t)) return "🌧️";
  if (/hujan|rain|shower|gerimis|setempat|scattered|localised/.test(t)) return "🌦️";
  if (/kabus|kabut|fog|jerebu|haze/.test(t)) return "🌫️";
  if (/mendung|berawan|overcast|cloudy/.test(t)) return "☁️";
  if (/cerah|panas|sunny|clear|cuaca baik|hot/.test(t)) return "☀️";
  return "🌤️";
};
const hm = (t) => (t ? String(t).slice(11, 16) : "—");
function hourLabel(t) {
  const h = parseInt((t || "").slice(11, 13) || "0", 10) || 0;
  return h < 12 ? `${h || 12}am` : h === 12 ? "12pm" : `${h - 12}pm`;
}
</script>

{#if now}
  {@const [icon, label] = now.meta?.code != null ? wmo(String(now.meta.code), isNightNow(now.meta)) : [null, null]}
  <div class="relative mt-1">
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0">
        <div class="text-[15px] font-semibold">{townName}{#if stateName}<span class="text-muted">, {stateName}</span>{/if}</div>
      </div>
      <div class="flex shrink-0 gap-1.5">
        {#if onClose}<button class="iconbtn" onclick={onClose} aria-label={tr("back")}>← {tr("back")}</button>{/if}
        <ShareButton payload={weatherSharePayload({ town: townName, state: stateName, now, humidity: now.meta?.humidity, wind: now.meta?.wind })} />
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
    <StatCard label={`💨 ${tr("wind")}`} value={`${now.meta?.wind ?? "–"} km/h`} sub={`${tr("gust")} ${now.meta?.gust ?? "–"}`} />
    <StatCard label={`💧 ${tr("humidity")}`} value={`${now.meta?.humidity ?? "–"}%`} />
    <StatCard label={`❄️ ${tr("dewPoint")}`} value={now.meta?.dewPoint != null ? `${Math.round(now.meta.dewPoint)}°` : "–"} />
    <StatCard label={`🧭 ${tr("pressure")}`} value={now.meta?.pressure != null ? `${Math.round(now.meta.pressure)} hPa` : "–"} />
    <StatCard label={`👁 ${tr("visibility")}`} value={now.meta?.visibility != null ? `${(now.meta.visibility / 1000).toFixed(1)} km` : "–"} />
    <StatCard label={`☀️ ${tr("uv")}`} value={air?.meta?.uv ?? "–"} sub={air?.meta?.uv != null ? tr(uvWord(air.meta.uv)) : ""} />
    <StatCard label={`🌅 ${tr("sunrise")}`} value={hm(now.meta?.sunrise)} />
    <StatCard label={`🌇 ${tr("sunset")}`} value={hm(now.meta?.sunset)} />
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
    <p class="caption -mt-0.5 mb-1">{tr("forecastLegend")}</p>
    {#if wkDays.length}
      <div class="grid grid-cols-7 gap-1 overflow-x-auto">
        {#each wkDays as d, i (d.date)}
          {@const w = barPct(d.tmin ?? 0)}
          {@const h = Math.max(2, barPct(d.tmax ?? 0) - w)}
          <button type="button" class="flex min-w-[48px] cursor-pointer flex-col items-center gap-1 pb-1" onclick={() => (selDay = i)}
            style={selDay === i ? "color:var(--color-accent)" : ""}>
            <span class="text-[11px] text-muted">{dayName(d.date)}</span>
            <span class="text-[17px] leading-none" aria-hidden="true">{metIcon(d.summary)}</span>
            <span class="relative h-16 w-2.5 rounded-full bg-line">
              <span class="absolute left-0 right-0 rounded-full" style="bottom:{w}%;height:{h}%;background:#e05d2b"></span>
            </span>
            <span class="text-[11.5px] font-semibold">{d.tmax}°</span>
            <span class="-mt-0.5 text-[10.5px] text-muted">{d.tmin}°</span>
          </button>
        {/each}
      </div>
      {#if wkDays[selDay]}
        <p class="caption mt-2">{wkDays[selDay].summary}{#if wkDays[selDay].when}<span class="text-muted"> · {wkDays[selDay].when}</span>{/if}</p>
      {/if}
    {/if}
  {/if}

  {#if mapPts.length}
    <h3 class="qh">{tr("stationsMap")}</h3>
    <MapView pts={mapPts} fit={!focus} focus={focus} onPick={(id) => (app.picked = id)} class="h-72 w-full rounded-xl lg:h-[52vh] lg:min-h-[400px]" />
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
