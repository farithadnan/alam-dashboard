<script>
import { onMount } from "svelte";
import { app, load } from "./lib/store.svelte.js";
import { theme, toggleTheme, applyTheme } from "./lib/theme.svelte.js";
import { lang, setLang, tr } from "./lib/i18n.svelte.js";
import { nearestState } from "./lib/flags.js";
import Icon from "./components/ui/Icon.svelte";
import Home from "./components/Home.svelte";
import Weather from "./components/Weather.svelte";
import Air from "./components/Air.svelte";
import Hazards from "./components/Hazards.svelte";
import About from "./components/About.svelte";
import Api from "./components/Api.svelte";

let view = $state("home");
let locOpen = $state(false);
let locBusy = $state(false);

const states = $derived(app.data?.states ?? []);
const towns = $derived((app.data?.allTowns ?? []).filter((t) => t.state === app.state));
const townName = $derived(app.data?.weather?.find((r) => r.station === app.town && r.kind === "weather")?.stationName ?? app.data?.allTowns?.find((t) => t.station === app.town)?.name ?? app.town ?? "");

const NAV = [
  { view: "home", icon: "home", key: "navHome" },
  { view: "weather", icon: "weather", key: "navWeather" },
  { view: "air", icon: "air", key: "navAQI" },
  { view: "hazards", icon: "quake", key: "navHazards" },
];

$effect(() => {
  void app.scope;
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

    <nav class="hidden items-center gap-0.5 sm:flex">
      {#each NAV as n (n.view)}
        <button class:on={view === n.view} class="navbtn inline-flex items-center gap-1.5" onclick={() => (view = n.view)}>
          <Icon name={n.icon} size={16} />{tr(n.key)}
        </button>
      {/each}
    </nav>

    <div class="ml-auto flex items-center gap-1.5">
      {#if view !== "hazards" && view !== "home"}
        <div class="seg hidden sm:flex">
          <button class:on={app.scope === "near"} class="segbtn" onclick={() => (app.scope = "near")}>{tr("scopeNear")}</button>
          <button class:on={app.scope === "state"} class="segbtn" onclick={() => (app.scope = "state")}>{tr("scopeState")}</button>
          <button class:on={app.scope === "malaysia"} class="segbtn" onclick={() => (app.scope = "malaysia")}>{tr("scopeMalaysia")}</button>
        </div>
      {/if}
      {#if view !== "hazards"}
        <button class="iconbtn" onclick={() => (locOpen = true)} aria-haspopup="dialog">📍 {townName || tr("changeLoc")}</button>
      {/if}
      <button class="iconbtn" onclick={toggleLang} aria-label="Language">{lang.code === "en" ? "BM" : "EN"}</button>
      <button class="iconbtn" onclick={toggleTheme} aria-label="Toggle dark mode">{theme.dark ? "☀" : "☾"}</button>
    </div>
  </div>
  {#if app.error}
    <div class="border-t border-line bg-panel px-4 py-1 text-center text-[12px] text-muted">
      {app.data ? "Showing last known data — live update failed." : "Data temporarily unavailable — please try again."}
    </div>
  {/if}
</header>

{#if locOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onclick={() => (locOpen = false)} role="dialog" aria-modal="true">
    <div class="w-full max-w-sm rounded-2xl border border-line bg-panel p-5 shadow-2xl" onclick={(e) => e.stopPropagation()}>
      <h2 class="mt-0 mb-3 text-[16px] font-bold">{tr("changeLoc")}</h2>
      <label class="flex flex-col gap-1">
        <span class="caption text-[12px]">{tr("state")}</span>
        <select id="state-select" bind:value={app.state}>
          {#each states as name (name)}
            <option value={name}>{name}</option>
          {/each}
        </select>
      </label>
      <label class="mt-3 flex flex-col gap-1">
        <span class="caption text-[12px]">{tr("town")}</span>
        <select id="town-select" bind:value={app.town} onchange={() => (locOpen = false)}>
          {#each towns as t (t.station)}
            <option value={t.station}>{t.name}</option>
          {/each}
        </select>
      </label>
      <button class="btn-primary mt-4 w-full" onclick={useLocation}>{locBusy ? tr("locating") : tr("useLoc")}</button>
    </div>
  </div>
{/if}

<main class="mx-auto w-full max-w-[1280px] px-4 pt-3 pb-24 sm:pb-10">
  {#if view === "home"}
    <Home onNavigate={(v) => (view = v)} />
  {:else if view === "weather"}
    <Weather />
  {:else if view === "air"}
    <Air />
  {:else if view === "hazards"}
    <Hazards />
  {:else if view === "api"}
    <Api />
  {:else}
    <About />
  {/if}
</main>

<footer class="border-t border-line px-4 py-4 text-center text-[12.5px] text-muted sm:pb-4">
  <div class="flex items-center justify-center gap-2.5">
    <button class="hover:text-fg" onclick={() => (view = "about")}>{tr("navAbout")}</button>
    <span>·</span>
    <button class="hover:text-fg" onclick={() => (view = "api")}>API</button>
    <span>·</span>
    <span>© 2026 Alam</span>
  </div>
</footer>

<nav class="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-bg/90 pt-1 backdrop-blur sm:hidden" aria-label="Main">
  <div class="flex">
    {#each NAV as n (n.view)}
      <button
        class="flex flex-1 flex-col items-center gap-0.5 pb-2 pt-1"
        class:on={view === n.view}
        onclick={() => (view = n.view)}
        aria-current={view === n.view ? "page" : undefined}
      >
        <Icon name={n.icon} size={20} />
        <span class:text-fg={view === n.view} class="text-[11px] text-muted">{tr(n.key)}</span>
      </button>
    {/each}
  </div>
</nav>
