<script>
import { app } from "../lib/store.svelte.js";
import { wmo, groupBy } from "../lib/flags.js";
import { tr, wmoLabel } from "../lib/i18n.svelte.js";
import MapView from "./ui/MapView.svelte";
import Section from "./ui/Section.svelte";

const weather = $derived(app.data?.weather ?? []);
const towns = $derived(weather.filter((r) => r.kind === "weather"));
const townName = $derived(weather.find((r) => r.station === app.town && r.kind === "weather")?.stationName ?? app.town ?? "");
const now = $derived(weather.find((r) => r.station === app.town && r.kind === "weather"));
const air = $derived(weather.find((r) => r.station === app.town && r.kind === "aqi"));
const forecast = $derived((app.data?.forecast ?? []).filter((r) => r.station === app.town).sort((a, b) => a.measuredAt.localeCompare(b.measuredAt)).slice(0, 7));
const hourly = $derived((app.data?.hourly ?? []).filter((r) => r.station === app.town).sort((a, b) => a.measuredAt.localeCompare(b.measuredAt)));

const tempColor = (v) => (v >= 32 ? "#d3342f" : v >= 29 ? "#e05d2b" : v >= 26 ? "#b3491a" : v >= 22 ? "#2f7d46" : "#2563eb");
const weatherPts = $derived(
  towns
    .filter((r) => r.coords?.lat)
    .map((r) => ({ lat: r.coords.lat, lon: r.coords.lon, title: `${r.stationName}: ${Math.round(r.value)}° (${wmoLabel(wmo(String(r.meta?.code))[1])})`, emoji: wmo(String(r.meta?.code))[0], color: tempColor(r.value), size: 26 })),
);
const scopeGroups = $derived(groupBy(towns.slice().sort((a, b) => a.meta?.state?.localeCompare(b.meta?.state) || 0), (r) => r.meta?.state ?? ""));

const avg = $derived(towns.length ? towns.reduce((s, r) => s + r.value, 0) / towns.length : null);
const hi = $derived(towns.length ? Math.max(...towns.map((r) => r.value)) : null);
const lo = $derived(towns.length ? Math.min(...towns.map((r) => r.value)) : null);

function hourLabel(t) {
  const h = parseInt((t || "").slice(11, 13) || "0", 10) || 0;
  return h < 12 ? `${h || 12} am` : h === 12 ? "12 pm" : `${h - 12} pm`;
}
</script>

{#if app.loading}<p class="caption mb-2">{tr("updating")}</p>{/if}

{#if app.scope === "near"}
  {#if now}
    {@const [icon, label] = now.meta?.code != null ? wmo(String(now.meta.code)) : [null, null]}
    <div class="mt-1">
      <div class="text-[15px] font-semibold">{townName}{#if app.state}<span class="text-muted">, {app.state}</span>{/if}</div>
      <div class="mt-1 flex items-end gap-4">
        {#if icon}<span class="shrink-0 text-[52px] leading-none" aria-hidden="true">{icon}</span>{/if}
        <div class="font-mono text-[60px] font-extrabold leading-none tracking-tighter">{Math.round(now.value)}°</div>
        <div class="pb-1.5">
          <div class="text-[14px] text-muted">{tr("feels")} {Math.round(now.meta?.apparentTemp ?? now.value)}° · {wmoLabel(label)}</div>
          <div class="text-[13px] text-muted">{now.meta?.humidity ?? "–"}% {tr("humidity")} · {tr("wind")} {now.meta?.wind ?? "–"} km/h · {tr("uv")} {air?.meta?.uv ?? "–"}</div>
        </div>
      </div>
    </div>
  {/if}

  {#if hourly.length}
    <div class="mt-3 flex flex-wrap gap-1.5">
      {#each hourly as h, i (h.measuredAt)}
        {@const [icon] = wmo(String(h.meta?.code))}
        <div class="glass flex min-w-[56px] flex-col items-center rounded-lg px-2 py-1.5">
          <span class="text-[11px] text-muted">{i === 0 ? tr("today") : hourLabel(h.measuredAt)}</span>
          <span class="text-[18px] leading-none" aria-hidden="true">{icon}</span>
          <span class="font-mono text-[13px] font-semibold">{Math.round(h.value)}°</span>
          {#if h.meta?.precip > 0}<span class="text-[10px] text-muted">☔ {Math.round(h.meta.precip)}%</span>{/if}
        </div>
      {/each}
    </div>
  {/if}

  <h3 class="qh">{tr("forecast")}</h3>
  <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
    {#each forecast as r (r.station + r.measuredAt)}
      {@const [icon, label] = wmo(String(r.meta?.code))}
      {@const isToday = r.measuredAt.slice(0, 10) === new Date().toISOString().slice(0, 10)}
      <div class="glass flex items-center gap-3 rounded-xl px-3 py-2.5 sm:flex-col sm:items-center sm:gap-1 sm:py-3">
        <span class="w-11 shrink-0 text-[14px] font-semibold sm:w-auto sm:text-center">{isToday ? tr("today") : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(r.measuredAt).getUTCDay()]}</span>
        <span class="text-[22px] leading-none" aria-hidden="true">{icon}</span>
        <span class="min-w-0 flex-1 truncate text-[13px] text-muted sm:flex-none sm:text-center">{wmoLabel(label)}</span>
        <span class="font-mono text-[14px] font-semibold">{Math.round(r.meta?.tmax ?? r.value)}° <span class="ml-1 text-muted">{Math.round(r.meta?.tmin ?? 0)}°</span>
        {#if r.meta?.precip > 0}<span class="text-[12px] text-muted">☔ {Math.round(r.meta.precip)}%</span>{/if}
      </div>
    {/each}
  </div>
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
