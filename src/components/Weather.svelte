<script>
import { app } from "../lib/store.svelte.js";
import { wmo, DAYS } from "../lib/flags.js";
import { tr, trFmt, wmoLabel } from "../lib/i18n.svelte.js";

const weather = $derived(app.data?.weather ?? []);
const townName = $derived(weather.find((r) => r.station === app.town && r.kind === "weather")?.stationName ?? app.town ?? "");
const now = $derived(weather.find((r) => r.station === app.town && r.kind === "weather"));
const air = $derived(weather.find((r) => r.station === app.town && r.kind === "aqi"));
const forecast = $derived((app.data?.forecast ?? []).filter((r) => r.station === app.town).sort((a, b) => a.measuredAt.localeCompare(b.measuredAt)).slice(0, 7));
const today = new Date().toISOString().slice(0, 10);
</script>

{#if app.loading}<p class="caption mb-2">{tr("updating")}</p>{/if}

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
{#if app.updated}<p class="caption mb-1 text-[12px]">{trFmt("updatedFrom", { t: app.updated })}</p>{/if}

<h3 class="qh">{tr("forecast")}</h3>
<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
  {#each forecast as r (r.station + r.measuredAt)}
    {@const [icon, label] = wmo(String(r.meta?.code))}
    {@const isToday = r.measuredAt.slice(0, 10) === today}
    <div class="glass flex items-center gap-3 rounded-xl px-3 py-2.5 sm:flex-col sm:items-center sm:gap-1 sm:py-3">
      <span class="w-11 shrink-0 text-[14px] font-semibold sm:w-auto sm:text-center">{isToday ? tr("today") : DAYS[new Date(r.measuredAt).getUTCDay()]}</span>
      <span class="text-[22px] leading-none" aria-hidden="true">{icon}</span>
      <span class="min-w-0 flex-1 truncate text-[13px] text-muted sm:flex-none sm:text-center">{wmoLabel(label)}</span>
      <span class="font-mono text-[14px] font-semibold">{Math.round(r.meta?.tmax ?? r.value)}° <span class="ml-1 text-muted">{Math.round(r.meta?.tmin ?? 0)}°</span>
      {#if r.meta?.precip > 0}<span class="text-[12px] text-muted">☔ {Math.round(r.meta.precip)}%</span>{/if}
    </div>
  {/each}
</div>
