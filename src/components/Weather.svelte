<script>
import { app } from "../lib/store.svelte.js";
import { wmo, groupBy } from "../lib/flags.js";
import { tr, wmoLabel } from "../lib/i18n.svelte.js";
import MapView from "./ui/MapView.svelte";
import Section from "./ui/Section.svelte";
import WeatherDetail from "./WeatherDetail.svelte";

const weather = $derived(app.data?.weather ?? []);
const towns = $derived(weather.filter((r) => r.kind === "weather"));
const tempColor = (v) => (v >= 32 ? "#d3342f" : v >= 29 ? "#e05d2b" : v >= 26 ? "#b3491a" : v >= 22 ? "#2f7d46" : "#2563eb");
const weatherPts = $derived(
  towns
    .filter((r) => r.coords?.lat)
    .map((r) => {
      const [icon, label] = wmo(String(r.meta?.code));
      const col = tempColor(r.value);
      return {
        lat: r.coords.lat, lon: r.coords.lon, emoji: icon, color: col, size: 28,
        html: `<div style=\"font:600 15px system-ui;color:#242628\">${r.stationName}</div><div style=\"font:800 28px system-ui;line-height:1.1;color:${col}\">${Math.round(r.value)}°</div><div style=\"font:13px system-ui;color:#6b6258\">${icon} ${wmoLabel(label)}</div>`,
      };
    }),
);
const scopeGroups = $derived(groupBy(towns.slice().sort((a, b) => a.meta?.state?.localeCompare(b.meta?.state) || 0), (r) => r.meta?.state ?? ""));
const avg = $derived(towns.length ? towns.reduce((s, r) => s + r.value, 0) / towns.length : null);
const hi = $derived(towns.length ? Math.max(...towns.map((r) => r.value)) : null);
const lo = $derived(towns.length ? Math.min(...towns.map((r) => r.value)) : null);

/** Tapping a card or map marker inspects that town without changing the saved location. */
const picked = $derived(app.picked);
</script>

{#if picked}
  <WeatherDetail station={picked} onClose={() => (app.picked = null)} />
{:else if app.scope === "near"}
  <WeatherDetail station={app.town} />
{:else}
  {@const scopeLabel = app.scope === "malaysia" ? "Malaysia" : app.state}
  <h3 class="qh">{tr("navWeather")} · {scopeLabel}</h3>
  {#if avg != null}
    <p class="caption -mt-1">{tr("avgLine")} {Math.round(avg)}° · {tr("high")} {Math.round(hi)}° · {tr("low")} {Math.round(lo)}° · {towns.length} {tr("townsWord")}</p>
  {/if}
  {#if weatherPts.length}
    <MapView pts={weatherPts} onPick={(id) => (app.picked = id)} class="h-64 w-full rounded-xl lg:h-[46vh]" fitMax={app.scope === "state" ? 9 : 8} />
  {/if}
  {#each scopeGroups as g (g.key)}
    <Section title={g.key} startOpen={scopeGroups.length === 1}>
      <ul class="mt-1 grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-3 lg:grid-cols-4">
        {#each g.items as r (r.station)}
          {@const [icon, label] = wmo(String(r.meta?.code))}
          <li>
            <button class="glass flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left" onclick={() => (app.picked = r.station)}>
              <span class="text-[20px]" aria-hidden="true">{icon}</span>
              <span class="min-w-0">
                <span class="block truncate text-[13.5px] font-semibold">{r.stationName}</span>
                <span class="block text-[12px] text-muted">{Math.round(r.value)}° · {wmoLabel(label)}</span>
              </span>
            </button>
          </li>
        {/each}
      </ul>
    </Section>
  {/each}
{/if}
