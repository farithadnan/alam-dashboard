<script>
import { onMount } from "svelte";
import { app, load } from "./lib/store.svelte.js";
import { theme, toggleTheme, applyTheme } from "./lib/theme.svelte.js";
import { lang, setLang, tr } from "./lib/i18n.svelte.js";
import { nearestState } from "./lib/flags.js";
import Weather from "./components/Weather.svelte";
import Air from "./components/Air.svelte";
import Hazards from "./components/Hazards.svelte";

let view = $state("weather");
let locOpen = $state(false);
let locBusy = $state(false);

const states = $derived(app.data?.states ?? []);
const towns = $derived([...new Set((app.data?.weather ?? []).filter((r) => r.kind === "weather").map((r) => r.station))]);
const townName = $derived(app.data?.weather?.find((r) => r.station === app.town && r.kind === "weather")?.stationName ?? app.town ?? "");

$effect(() => {
  void app.scope; // reload when scope changes too
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
      locOpen = false;
    },
    () => { locBusy = false; },
    { timeout: 8000 },
  );
}
function toggleLang() {
  setLang(lang.code === "en" ? "ms" : "en");
}
</script>

<header class="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur">
  <div class="mx-auto flex w-full max-w-[1280px] items-center gap-1.5 px-4 py-1.5">
    <button class="mr-1 text-[16px] font-bold tracking-wide" onclick={() => (view = "weather")} aria-label="Home">Alam<span class="text-accent">.</span></button>

    <nav class="flex gap-0.5">
      <button class:on={view === "weather"} class="navbtn" onclick={() => (view = "weather")}>{tr("navWeather")}</button>
      <button class:on={view === "air"} class="navbtn" onclick={() => (view = "air")}>{tr("navAQI")}</button>
      <button class:on={view === "hazards"} class="navbtn" onclick={() => (view = "hazards")}>{tr("navHazards")}</button>
    </nav>

    <div class="ml-auto flex items-center gap-1.5">
      <div class="seg">
        <button class:on={app.scope === "near"} class="segbtn" onclick={() => (app.scope = "near")}>{tr("scopeNear")}</button>
        <button class:on={app.scope === "state"} class="segbtn" onclick={() => (app.scope = "state")}>{tr("scopeState")}</button>
        <button class:on={app.scope === "malaysia"} class="segbtn" onclick={() => (app.scope = "malaysia")}>{tr("scopeMalaysia")}</button>
      </div>
      <button class="iconbtn" onclick={() => (locOpen = true)} aria-haspopup="dialog">📍 {townName || tr("changeLoc")}</button>
      <button class="iconbtn" onclick={toggleLang} aria-label="Language">{lang.code === "en" ? "BM" : "EN"}</button>
      <button class="iconbtn" onclick={toggleTheme} aria-label="Toggle dark mode">{theme.dark ? "☀" : "☾"}</button>
    </div>
  </div>
</header>

{#if locOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onclick={() => (locOpen = false)} role="dialog" aria-modal="true">
    <div class="w-full max-w-sm rounded-2xl border border-line bg-panel p-5 shadow-2xl" onclick={(e) => e.stopPropagation()}>
      <h2 class="mt-0 mb-3 text-[16px] font-bold">{tr("changeLoc")}</h2>
      <label class="flex flex-col gap-1">
        <span class="caption text-[12px]">{tr("state")}</span>
        <select bind:value={app.state}>
          {#each states as name (name)}
            <option value={name}>{name}</option>
          {/each}
        </select>
      </label>
      <label class="mt-3 flex flex-col gap-1">
        <span class="caption text-[12px]">{tr("town")}</span>
        <select bind:value={app.town} disabled={app.loading}>
          {#each towns as t (t)}
            <option value={t}>{app.data?.weather?.find((r) => r.station === t && r.kind === "weather")?.stationName ?? t}</option>
          {/each}
        </select>
      </label>
      <button class="btn-primary mt-4 w-full" onclick={useLocation}>{locBusy ? tr("locating") : tr("useLoc")}</button>
    </div>
  </div>
{/if}

<main class="mx-auto w-full max-w-[1280px] px-4 pt-3 pb-10">
  {#if view === "weather"}
    <Weather />
  {:else if view === "air"}
    <Air />
  {:else if view === "hazards"}
    <Hazards />
  {:else}
    <section class="mx-auto max-w-[56ch] py-8">
      <h2 class="text-[20px] font-bold">{tr("aboutTitle")}</h2>
      <p class="mt-3 leading-relaxed">{tr("aboutText")}</p>
      <p class="caption mt-4">{tr("sources")}</p>
      <button class="btn-primary mt-6" onclick={() => (view = "weather")}>{tr("navWeather")}</button>
    </section>
  {/if}
</main>

<footer class="border-t border-line px-4 py-4 text-center text-[12.5px] text-muted">
  <div class="flex items-center justify-center gap-2.5">
    <button class="hover:text-fg" onclick={() => (view = "about")}>{tr("navAbout")}</button>
    <span>·</span>
    <span>API</span>
    <span>·</span>
    <span>© 2026 Alam</span>
  </div>
</footer>
