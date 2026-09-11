<script>
import { app } from "../lib/store.svelte.js";
import { wmo, groupBy, moonPhase, numColor } from "../lib/flags.js";
import { tr, wmoLabel, bandLabel, bandAdvice } from "../lib/i18n.svelte.js";
import { shareCard } from "../lib/sharecard.js";
import MapView from "./ui/MapView.svelte";
import Section from "./ui/Section.svelte";
import Carousel from "./ui/Carousel.svelte";

const weather = $derived(app.data?.weather ?? []);
const towns = $derived(weather.filter((r) => r.kind === "weather"));
const townName = $derived(weather.find((r) => r.station === app.town && r.kind === "weather")?.stationName ?? app.town ?? "");
const now = $derived(weather.find((r) => r.station === app.town && r.kind === "weather"));
const air = $derived(weather.find((r) => r.station === app.town && r.kind === "aqi"));
const forecast = $derived((app.data?.forecast ?? []).filter((r) => r.station === app.town).sort((a, b) => a.measuredAt.localeCompare(b.measuredAt)).slice(0, 10));
const hourly = $derived((app.data?.hourly ?? []).filter((r) => r.station === app.town).sort((a, b) => a.measuredAt.localeCompare(b.measuredAt)));

const tempColor = (v) => (v >= 32 ? "#d3342f" : v >= 29 ? "#e05d2b" : v >= 26 ? "#b3491a" : v >= 22 ? "#2f7d46" : "#2563eb");
const weatherPts = $derived(
  towns
    .filter((r) => r.coords?.lat)
    .map((r) => {
      const [icon, label] = wmo(String(r.meta?.code));
      const col = tempColor(r.value);
      return {
        lat: r.coords.lat, lon: r.coords.lon, emoji: icon, color: col, size: 28,
        html: `<div style="font:600 15px system-ui;color:#242628">${r.stationName}</div><div style="font:800 28px system-ui;line-height:1.1;color:${col}">${Math.round(r.value)}°</div><div style="font:13px system-ui;color:#6b6258">${icon} ${wmoLabel(label)}</div>`,
      };
    }),
);
const scopeGroups = $derived(groupBy(towns.slice().sort((a, b) => a.meta?.state?.localeCompare(b.meta?.state) || 0), (r) => r.meta?.state ?? ""));
const avg = $derived(towns.length ? towns.reduce((s, r) => s + r.value, 0) / towns.length : null);
const hi = $derived(towns.length ? Math.max(...towns.map((r) => r.value)) : null);
const lo = $derived(towns.length ? Math.min(...towns.map((r) => r.value)) : null);
const moon = moonPhase();

let hourEl;
const scrollH = (d) => hourEl?.scrollBy({ left: d * 280, behavior: "smooth" });

function hourLabel(t) {
  const h = parseInt((t || "").slice(11, 13) || "0", 10) || 0;
  return h < 12 ? `${h || 12}am` : h === 12 ? "12pm" : `${h - 12}pm`;
}
const hm = (t) => (t ? String(t).slice(11, 16) : "—");
const stations = $derived(app.data?.stations ?? []);
const townAir = $derived(stations.find((s) => s.station === app.town) ?? null);

async function doShare() {
  const [icon, label] = now?.meta?.code != null ? wmo(String(now.meta.code)) : [null, null];
  await shareCard({
    town: townName,
    state: app.state,
    value: townAir?.value ?? air?.value ?? null,
    band: townAir ? bandLabel(townAir.band?.label) : air ? "US AQI" : "",
    color: townAir ? numColor(townAir.band?.label) : "#c14a1f",
    temp: now ? Math.round(now.value) : null,
    cond: label ? wmoLabel(label) : "",
    advice: townAir ? bandAdvice(townAir.band?.label) : "",
  });
}
</script>

{#if app.scope === "near"}
  {#if now}
    {@const [icon, label] = now.meta?.code != null ? wmo(String(now.meta.code)) : [null, null]}
    <div class="relative mt-1">
      <div class="text-[15px] font-semibold">{townName}{#if app.state}<span class="text-muted">, {app.state}</span>{/if}</div>
      <button class="iconbtn absolute right-0 top-0" onclick={doShare} aria-label={tr("share")} title={tr("share")}>↗</button>
      <div class="mt-1 flex items-end gap-4">
        {#if icon}<span class="shrink-0 text-[52px] leading-none" aria-hidden="true">{icon}</span>{/if}
        <div class="font-mono text-[60px] font-extrabold leading-none tracking-tighter">{Math.round(now.value)}°</div>
        <div class="pb-1.5">
          <div class="text-[14px] text-muted">{tr("feels")} {Math.round(now.meta?.apparentTemp ?? now.value)}° · {wmoLabel(label)}</div>
        </div>
      </div>
    </div>
  {/if}

  {#if hourly.length}
    <Carousel class="mt-3">
      {#each hourly as h, i (h.measuredAt)}
        {@const [icon] = wmo(String(h.meta?.code))}
        <div class="glass flex w-[22%] shrink-0 flex-col items-center rounded-xl px-2 py-3 sm:w-[18%]">
          <span class="text-[12px] text-muted">{i === 0 ? tr("today") : hourLabel(h.measuredAt)}</span>
          <span class="text-[24px] leading-none" aria-hidden="true">{icon}</span>
          <span class="font-mono text-[15px] font-semibold">{Math.round(h.value)}°</span>
          {#if h.meta?.precip > 0}<span class="text-[11px] text-muted">☔ {Math.round(h.meta.precip)}%</span>{/if}
        </div>
      {/each}
    </Carousel>
  {/if}

  {#if now}
    <h3 class="qh">{tr("todayDetail")}</h3>
    <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      <div class="glass rounded-xl px-3 py-2"><div class="caption text-[11px]">{tr("wind")}</div><div class="text-[15px] font-semibold">{now.meta?.wind ?? "–"} km/h</div><div class="caption text-[11px]">{tr("gust")} {now.meta?.gust ?? "–"}</div></div>
      <div class="glass rounded-xl px-3 py-2"><div class="caption text-[11px]">{tr("humidity")}</div><div class="text-[15px] font-semibold">{now.meta?.humidity ?? "–"}%</div></div>
      <div class="glass rounded-xl px-3 py-2"><div class="caption text-[11px]">{tr("dewPoint")}</div><div class="text-[15px] font-semibold">{now.meta?.dewPoint != null ? `${Math.round(now.meta.dewPoint)}°` : "–"}</div></div>
      <div class="glass rounded-xl px-3 py-2"><div class="caption text-[11px]">{tr("pressure")}</div><div class="text-[15px] font-semibold">{now.meta?.pressure != null ? `${Math.round(now.meta.pressure)} hPa` : "–"}</div></div>
      <div class="glass rounded-xl px-3 py-2"><div class="caption text-[11px]">{tr("visibility")}</div><div class="text-[15px] font-semibold">{now.meta?.visibility != null ? `${(now.meta.visibility / 1000).toFixed(1)} km` : "–"}</div></div>
      <div class="glass rounded-xl px-3 py-2"><div class="caption text-[11px]">{tr("uv")}</div><div class="text-[15px] font-semibold">{air?.meta?.uv ?? "–"}</div></div>
      <div class="glass rounded-xl px-3 py-2"><div class="caption text-[11px]">PM2.5</div><div class="text-[15px] font-semibold">{air?.meta?.pm2_5 ?? "–"}</div></div>
      <div class="glass rounded-xl px-3 py-2"><div class="caption text-[11px]">PM10</div><div class="text-[15px] font-semibold">{air?.meta?.pm10 ?? "–"}</div></div>
      <div class="glass rounded-xl px-3 py-2"><div class="caption text-[11px]">{tr("sunrise")}</div><div class="text-[15px] font-semibold">{hm(now.meta?.sunrise)}</div></div>
      <div class="glass rounded-xl px-3 py-2"><div class="caption text-[11px]">{tr("sunset")}</div><div class="text-[15px] font-semibold">{hm(now.meta?.sunset)}</div></div>
      <div class="glass flex items-center gap-2 rounded-xl px-3 py-2"><span class="text-[20px]">{moon.emoji}</span><div><div class="caption text-[11px]">{tr("moon")}</div><div class="text-[14px] font-semibold">{moon.name}</div></div></div>
    </div>
  {/if}

  <h3 class="qh">{tr("forecast")}</h3>
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
{:else}
  {@const scopeLabel = app.scope === "malaysia" ? "Malaysia" : app.state}
  <h3 class="qh">{tr("navWeather")} · {scopeLabel}</h3>
  {#if avg != null}
    <p class="caption -mt-1">Average {Math.round(avg)}° · high {Math.round(hi)}° · low {Math.round(lo)}° · {towns.length} towns</p>
  {/if}
  {#if weatherPts.length}
    <MapView pts={weatherPts} class="h-72 w-full rounded-xl lg:h-[56vh]" fitMax={app.scope === "state" ? 9 : 8} />
  {/if}
  {#each scopeGroups as g (g.key)}
    <Section title={g.key}>
      <ul class="mt-1 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-3 lg:grid-cols-4">
        {#each g.items as r (r.station)}
          {@const [icon, label] = wmo(String(r.meta?.code))}
          <li class="glass flex items-center gap-2 rounded-xl px-3 py-2">
            <span class="text-[20px]" aria-hidden="true">{icon}</span>
            <div class="min-w-0">
              <div class="truncate text-[13.5px] font-semibold">{r.stationName}</div>
              <div class="text-[12px] text-muted">{Math.round(r.value)}° · {wmoLabel(label)}</div>
            </div>
          </li>
        {/each}
      </ul>
    </Section>
  {/each}
{/if}
