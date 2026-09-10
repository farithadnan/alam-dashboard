<script>
import { onMount } from "svelte";
import { app, load } from "./lib/store.svelte.js";
import { theme, toggleTheme, applyTheme } from "./lib/theme.svelte.js";
import { nearestState } from "./lib/flags.js";
import Area from "./components/Area.svelte";
import Hazards from "./components/Hazards.svelte";

let view = $state("area");
let locBusy = $state(false);
let aboutOpen = $state(false);

const states = $derived(app.data?.states ?? []);
const towns = $derived([...new Set((app.data?.weather ?? []).filter((r) => r.kind === "weather").map((r) => r.station))]);
const townName = $derived(app.data?.weather?.find((r) => r.station === app.town && r.kind === "weather")?.stationName ?? app.town ?? "");

$effect(() => {
  if (app.state) load();
});
onMount(() => {
  load();
  applyTheme();
  const t = setInterval(() => load(), 60000);
  return () => clearInterval(t);
});
function useLocation() {
  if (!navigator.geolocation) return;
  locBusy = true;
  navigator.geolocation.getCurrentPosition(
    (p) => {
      const near = nearestState(p.coords.latitude, p.coords.longitude);
      if (near && states.includes(near.name)) app.state = near.name;
      locBusy = false;
    },
    () => { locBusy = false; },
    { timeout: 8000 },
  );
}
</script>

<header class="mx-auto w-full max-w-[1024px] px-5 pt-[16px]">
  <div class="flex flex-wrap items-center justify-between gap-2">
    <span class="text-[17px] font-bold tracking-wide">Alam<span class="text-accent">.</span></span>
    <div class="flex items-center gap-2">
      {#if app.loading}<span class="caption text-[12px]">Updating…</span>{/if}
      <button class="ghostbtn" onclick={toggleTheme} aria-label="Toggle dark mode" title="Dark mode">{theme.dark ? "☀" : "☾"}</button>
    </div>
  </div>

  <div class="mt-3 flex flex-wrap items-end gap-2">
    <label class="flex flex-col gap-0.5">
      <span class="caption text-[12px]">State</span>
      <select bind:value={app.state}>
        {#each states as name (name)}
          <option value={name}>{name}</option>
        {/each}
      </select>
    </label>
    <label class="flex flex-col gap-0.5">
      <span class="caption text-[12px]">Town</span>
      <select bind:value={app.town}>
        {#each towns as t (t)}
          <option value={t}>{app.data?.weather?.find((r) => r.station === t && r.kind === "weather")?.stationName ?? t}</option>
        {/each}
      </select>
    </label>
    <button class="btn-primary" onclick={useLocation}>{locBusy ? "Locating…" : "Use my location"}</button>
  </div>

  {#if townName && app.state}
    <p class="caption mt-1 uppercase tracking-wide text-[12px]">Location: {townName}, {app.state}</p>
  {/if}
</header>

<nav class="mx-auto w-full max-w-[1024px] mt-3 flex gap-1 border-b border-line px-5">
  <button class:on={view === "area"} class="navbtn" onclick={() => (view = "area")}>Air and weather</button>
  <button class:on={view === "hazards"} class="navbtn" onclick={() => (view = "hazards")}>Hazards</button>
</nav>

<main class="mx-auto w-full max-w-[1024px] px-5 pt-1 pb-10">
  {#if view === "area"}
    <Area />
  {:else}
    <Hazards />
  {/if}
</main>

<footer class="mx-auto w-full max-w-[1024px] border-t border-line px-5 py-5 text-[12.5px] text-muted">
  <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
    <button class="ghostbtn" onclick={() => (aboutOpen = !aboutOpen)} aria-expanded={aboutOpen}>About Alam</button>
    <span>Sources: DOE · MET · USGS · NOAA · Open-Meteo</span>
  </div>
  {#if aboutOpen}
    <p class="mt-2 max-w-[52ch]">Alam is a free, non-commercial dashboard for air quality, weather and hazard alerts across Malaysia, fed by public data from DOE APIMS, MET Malaysia, USGS, NOAA, and Open-Meteo. Data is not guaranteed; verify official sources before acting on it.</p>
  {/if}
  <p class="mt-2">© 2026 Farith Adnan · Not affiliated with any government body.</p>
</footer>
