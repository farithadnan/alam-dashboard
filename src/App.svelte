<script>
import { onMount } from "svelte";
import { app, load, initLoc } from "./lib/store.svelte.js";
import { theme, toggleTheme, applyTheme } from "./lib/theme.svelte.js";
import { lang, setLang, tr } from "./lib/i18n.svelte.js";
import { nearestState } from "./lib/flags.js";
import { NAV, SCOPES } from "./lib/shell.js";
import { locate } from "./lib/location.js";
import Icon from "./components/ui/Icon.svelte";
import Skeleton from "./components/ui/Skeleton.svelte";
import Home from "./components/Home.svelte";
import Weather from "./components/Weather.svelte";
import Air from "./components/Air.svelte";
import Hazards from "./components/Hazards.svelte";
import About from "./components/About.svelte";
import Api from "./components/Api.svelte";

let view = $state("home");
let locOpen = $state(false);
let settingsOpen = $state(false);
let locBusy = $state(false);

const states = $derived(app.data?.states ?? []);
const towns = $derived((app.data?.allTowns ?? []).filter((t) => t.state === app.state));
const townName = $derived(app.data?.weather?.find((r) => r.station === app.town && r.kind === "weather")?.stationName ?? app.data?.allTowns?.find((t) => t.station === app.town)?.name ?? app.town ?? "");

$effect(() => {
  void app.scope;
  void app.town;
  void app.picked;
  if (app.state) load();
});
onMount(() => {
  initLoc();
  load();
  applyTheme();
  const t = setInterval(() => { if (!document.hidden) load(); }, 300000); // 5 min, paused when tab hidden
  return () => clearInterval(t);
});
function onStatePick(e) {
  // Move the town with the state right away, so we never request a town that
  // belongs to the previous state (that returns no hourly/forecast data).
  const st = e.currentTarget.value;
  const first = (app.data?.allTowns ?? []).find((t) => t.state === st);
  if (first) app.town = first.station;
}
async function useLocation() {
  locBusy = true;
  try {
    const { lat, lon } = await locate();
    const near = nearestState(lat, lon);
    if (near && states.includes(near.name)) app.state = near.name;
    locOpen = false;
  } catch {
    /* denied or unavailable — leave the picker open */
  } finally {
    locBusy = false;
  }
}
function toggleLang() {
  setLang(lang.code === "en" ? "ms" : "en");
}
</script>

<header class="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur">
  <div class="mx-auto flex w-full max-w-[1280px] items-center gap-1.5 px-4 py-1.5">
    <button class="mr-1 text-[16px] font-bold tracking-wide" onclick={() => (view = "home")} aria-label="Home">Alam<span class="text-accent">.</span></button>

    <nav class="hidden items-center gap-0.5 sm:flex">
      {#each NAV as n (n.view)}
        <button class:on={view === n.view} class="navbtn inline-flex items-center gap-1.5" onclick={() => (view = n.view)}>
          <Icon name={n.icon} size={16} />{tr(n.key)}
        </button>
      {/each}
    </nav>

    <div class="ml-auto flex items-center gap-1.5">
      {#if (view === "weather" || view === "air") && !app.picked}
        <div class="seg" role="group" aria-label="Scope">
          {#each SCOPES as s (s.value)}
            <button class:on={app.scope === s.value} class="segbtn" onclick={() => (app.scope = s.value)}>{tr(s.key)}</button>
          {/each}
        </div>
      {/if}
      {#if view !== "hazards"}
        <button class="iconbtn" onclick={() => (locOpen = true)} aria-haspopup="dialog">📍 <span class="hidden sm:inline">{townName || tr("changeLoc")}</span></button>
      {/if}
      <button class="iconbtn hidden sm:inline-flex" onclick={toggleLang} aria-label="Language">{lang.code === "en" ? "BM" : "EN"}</button>
      <button class="iconbtn hidden sm:inline-flex" onclick={toggleTheme} aria-label="Toggle dark mode">{theme.dark ? "☀" : "☾"}</button>
      <button class="iconbtn relative sm:hidden" onclick={() => (settingsOpen = !settingsOpen)} aria-label="Settings" aria-expanded={settingsOpen}>⚙</button>
    </div>
  </div>

  {#if settingsOpen}
    <div class="absolute right-4 top-[54px] z-50 w-52 rounded-xl border border-line bg-panel p-3 shadow-2xl sm:hidden">
      <div class="caption text-[12px]">{tr("state") === "State" ? "Language" : "Bahasa"}</div>
      <div class="seg mt-1">
        <button class:on={lang.code === "en"} class="segbtn" onclick={() => setLang("en")}>EN</button>
        <button class:on={lang.code === "ms"} class="segbtn" onclick={() => setLang("ms")}>BM</button>
      </div>
      <div class="caption mt-3 text-[12px]">Theme</div>
      <div class="seg mt-1">
        <button class:on={!theme.dark} class="segbtn" onclick={() => { if (theme.dark) toggleTheme(); }}>☀</button>
        <button class:on={theme.dark} class="segbtn" onclick={() => { if (!theme.dark) toggleTheme(); }}>☾</button>
      </div>
    </div>
  {/if}

  {#if app.loading}
    <div class="absolute inset-x-0 bottom-0 h-[2px] overflow-hidden" aria-hidden="true">
      <div class="loadingbar"></div>
    </div>
  {/if}

  {#if app.error}
    <div class="flex items-center justify-center gap-3 border-t border-line bg-panel px-4 py-2 text-[12.5px]">
      <span class="text-muted">{app.data ? tr("staleData") : tr("loadFailed")}</span>
      <button class="ghostbtn !min-h-0 !py-1 text-[12px]" onclick={load}>{tr("retry")}</button>
    </div>
  {/if}
</header>

{#if locOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onclick={() => (locOpen = false)} role="dialog" aria-modal="true">
    <div class="w-full max-w-sm rounded-2xl border border-line bg-panel p-5 shadow-2xl" onclick={(e) => e.stopPropagation()}>
      <h2 class="mt-0 mb-3 text-[16px] font-bold">{tr("changeLoc")}</h2>
      <label class="flex flex-col gap-1">
        <span class="caption text-[12px]">{tr("state")}</span>
        <select id="state-select" bind:value={app.state} onchange={onStatePick}>
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
  {#if !app.data && app.loading}
    <div class="mt-2 space-y-3">
      <Skeleton h={104} class="!rounded-2xl" />
      <div class="flex gap-2"><Skeleton h={30} w="96px" /><Skeleton h={30} w="96px" /><Skeleton h={30} w="96px" /></div>
      <Skeleton h={14} w="38%" />
      <Skeleton h={170} class="!rounded-xl" />
      <Skeleton h={14} w="24%" />
      <Skeleton h={120} class="!rounded-xl" />
    </div>
  {:else if !app.data}
    <div class="mx-auto mt-16 max-w-sm text-center">
      <p class="text-[15px] font-semibold">{tr("loadFailed")}</p>
      <p class="caption mt-1 text-[13px]">{tr("loadFailedHint")}</p>
      <button class="btn-primary mt-4" onclick={load}>{tr("retry")}</button>
    </div>
  {:else if view === "home"}
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

<footer class="border-t border-line px-4 pt-4 pb-20 text-center text-[12.5px] text-muted sm:pb-5">
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
