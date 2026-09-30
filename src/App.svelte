<script>
import { onMount } from "svelte";
import { app, load, initLoc } from "./core/store.svelte.js";
import { SITE } from "./core/config.js";
import { theme, toggleTheme, applyTheme } from "./core/theme.svelte.js";
import { lang, setLang, tr, trFmt } from "./core/i18n.svelte.js";
import { nearestState } from "./domain/flags.js";
import { NAV, SCOPES } from "./core/shell.js";
import { locate } from "./core/location.js";
import { dialog } from "./core/dialog.js";
import Icon from "./ui/Icon.svelte";
import Skeleton from "./ui/Skeleton.svelte";
import Home from "./routes/Home.svelte";
import Weather from "./routes/Weather.svelte";
import Air from "./routes/Air.svelte";
import Hazards from "./routes/Hazards.svelte";
import News from "./routes/News.svelte";
import About from "./routes/About.svelte";
import Api from "./routes/Api.svelte";

const HASH_TO_VIEW = { "": "home", weather: "weather", air: "air", flood: "hazards", earthquakes: "hazards", news: "news", about: "about", api: "api" };
const VIEW_TO_HASH = { home: "", weather: "weather", air: "air", hazards: "flood", news: "news", about: "about", api: "api" };
function readHash() {
  const h = (typeof location !== "undefined" ? location.hash : "").replace(/^#\/?/, "");
  if (h === "flood" || h === "earthquakes") app.hazard = h;
  return HASH_TO_VIEW[h] ?? "home";
}
let view = $state(readHash());
$effect(() => {
  // Keep the URL in sync (replaceState avoids a hashchange loop). The Hazards center
  // owns its sub-tab in app.hazard, so its hash reflects Flood vs Earthquakes.
  const want = view === "hazards" ? `#/${app.hazard || "flood"}` : VIEW_TO_HASH[view] ? `#/${VIEW_TO_HASH[view]}` : "#/";
  if (typeof location !== "undefined" && location.hash !== want) history.replaceState(null, "", want);
});
let locOpen = $state(false);
let settingsOpen = $state(false);
let locBusy = $state(false);
let locTrigger = null;          // element that opened the dialog, for focus restore
// Was this location ever actually claimed by the user, or are they seeing a default?
let claimed = $state(true);
$effect(() => {
  let stored = "1";
  try { stored = localStorage.getItem("alam.claimed") ?? "0"; } catch {}
  claimed = stored === "1";
});

const states = $derived(app.data?.states ?? []);
const towns = $derived((app.data?.allTowns ?? []).filter((t) => t.state === app.state));
const townName = $derived(app.data?.weather?.find((r) => r.station === app.town && r.kind === "weather")?.stationName ?? app.data?.allTowns?.find((t) => t.station === app.town)?.name ?? app.town ?? "");

let _lastSig = "";
$effect(() => {
  const sig = `${app.scope}|${app.state}|${app.town}|${app.picked}`;
  void sig;
  // Only reload when the visible scope/town/state actually changed. load() itself
  // adopts a default state/town into these fields; without this guard Svelte re-fires
  // the effect (same sig) and load() spins — the loading bar "blinks".
  if (sig === _lastSig) return;
  _lastSig = sig;
  if (app.state) load();
});
onMount(() => {
  initLoc();
  load();
  applyTheme();
  const t = setInterval(() => { if (!document.hidden) load(); }, 300000); // 5 min, paused when tab hidden
  window.addEventListener("hashchange", () => { const v = readHash(); if (v !== view) view = v; });
  return () => { clearInterval(t); window.removeEventListener("hashchange", () => {}); };
});
function onStatePick(e) {
  // Move the town with the state right away, so we never request a town that
  // belongs to the previous state (that returns no hourly/forecast data).
  const st = e.currentTarget.value;
  const first = (app.data?.allTowns ?? []).find((t) => t.state === st);
  if (first) app.town = first.station;
}
// Location search with common informal aliases (JB → Johor Bahru, KL → Kuala Lumpur…).
let q = $state("");
const ALIASES = {
  jb: "johor bahru", "johor bahru": "johor bahru", kl: "kuala lumpur", "kuala lumpur": "kuala lumpur",
  pj: "petaling jaya", "petaling jaya": "petaling jaya", "shah alam": "shah alam", klang: "klang",
  subang: "subang jaya", "subang jaya": "subang jaya", kk: "kota kinabalu", "kota kinabalu": "kota kinabalu",
  kch: "kuching", kuching: "kuching", ipoh: "ipoh", penang: "george town", "george town": "george town",
  melaka: "melaka", miri: "miri", sibu: "sibu", bintulu: "bintulu", bangi: "bangi", cyberjaya: "cyberjaya",
};
const normz = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
const placeMatches = $derived.by(() => {
  const raw = q.trim();
  if (!raw) return [];
  const sub = normz(raw);
  const aliasTarget = normz(ALIASES[sub] || "");
  return (app.data?.allTowns ?? []).filter((t) => {
    const nm = normz(t.name), slug = normz(t.station);
    if (nm.includes(sub) || slug.includes(sub)) return true;
    if (aliasTarget && nm.includes(aliasTarget)) return true;
    if (Object.values(ALIASES).some((tg) => normz(tg) === nm && sub.length >= 3 && nm.includes(sub))) return true;
    return false;
  }).slice(0, 12);
});
function pickPlace(t) {
  app.state = t.state;
  app.town = t.station;
  q = "";
}
function markClaimed() {
  claimed = true;
  try { localStorage.setItem("alam.claimed", "1"); } catch {}
}
function openLoc(evt) {
  locTrigger = evt?.currentTarget ?? null;
  locOpen = true;
}
function closeLoc() {
  locOpen = false;
  if (locTrigger) { locTrigger.focus?.(); locTrigger = null; }
}

async function useLocation() {
  markClaimed();
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
const scopeRelevant = $derived(view === "weather" || view === "air" || (view === "hazards" && app.hazard === "flood"));
</script>

<header class="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-xl">
  <div class="mx-auto flex w-full max-w-[1240px] items-center gap-2 px-3 py-2 sm:px-4">
    <button class="group flex items-center gap-2 pr-1" onclick={() => (view = "home")} aria-label="Home">
      <span class="grid size-8 place-items-center rounded-xl text-white shadow-sm" style="background:linear-gradient(135deg,var(--color-accent),#ff8a5c)">
        <Icon name="air" size={17} stroke={2} />
      </span>
      <span class="text-[17px] font-extrabold tracking-tight">{SITE.name}<span class="text-accent">.</span></span>
    </button>

    <nav class="ml-2 hidden items-center gap-0.5 lg:flex">
      {#each NAV as n (n.view)}
        <button class:on={view === n.view} class="navbtn" onclick={() => (view = n.view)} aria-current={view === n.view ? "page" : undefined}>
          <Icon name={n.icon} size={15} />{tr(n.key)}
        </button>
      {/each}
    </nav>

    <div class="ml-auto flex items-center gap-1.5">
      {#if scopeRelevant && !app.picked}
        <div class="seg scope-seg" role="group" aria-label="Scope">
          {#each SCOPES as s (s.value)}
            <button class:on={app.scope === s.value} class="segbtn" onclick={() => (app.scope = s.value)}>{tr(s.key)}</button>
          {/each}
        </div>
      {/if}
      <button class="iconbtn inline-flex max-w-[42vw] items-center gap-1.5 sm:max-w-none" onclick={openLoc} aria-haspopup="dialog" aria-expanded={locOpen}>
        <Icon name="pin" size={15} class="shrink-0 text-accent" />
        <span class="truncate font-semibold">{townName || tr("changeLoc")}</span>
      </button>
      <div class="relative">
        <button class="iconbtn !px-2.5" onclick={() => (settingsOpen = !settingsOpen)} aria-label="Settings" aria-expanded={settingsOpen} aria-haspopup="true"><Icon name="gear" size={17} /></button>
        {#if settingsOpen}
          <button class="fixed inset-0 z-40 cursor-default" onclick={() => (settingsOpen = false)} aria-label="Close settings" tabindex="-1"></button>
          <div class="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-2xl border border-line bg-panel p-4 shadow-[var(--shadow-pop)]">
            <div class="eyebrow mb-2">Language</div>
            <div class="seg flex w-full">
              <button class:on={lang.code === "en"} class="segbtn flex-1 py-2" onclick={() => setLang("en")}>English</button>
              <button class:on={lang.code === "ms"} class="segbtn flex-1 py-2" onclick={() => setLang("ms")}>Bahasa</button>
            </div>
            <div class="eyebrow mb-2 mt-4">Theme</div>
            <div class="seg flex w-full">
              <button class:on={!theme.dark} class="segbtn flex flex-1 items-center justify-center gap-1.5 py-2" onclick={() => { if (theme.dark) toggleTheme(); }}><Icon name="sun" size={14} /> Light</button>
              <button class:on={theme.dark} class="segbtn flex flex-1 items-center justify-center gap-1.5 py-2" onclick={() => { if (!theme.dark) toggleTheme(); }}><Icon name="moon" size={14} /> Dark</button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>

  {#if app.loading}
    <div class="absolute inset-x-0 bottom-0 h-[2px] overflow-hidden" aria-hidden="true">
      <div class="loadingbar"></div>
    </div>
  {/if}

  {#if app.error && app.data}
    <div class="flex items-center justify-center gap-3 border-t border-line bg-panel px-4 py-2 text-[12.5px]">
      <span class="text-muted">{tr("staleData")}</span>
      <button class="ghostbtn !min-h-0 !py-1 text-[12px]" onclick={load}>{tr("retry")}</button>
    </div>
  {/if}
</header>

{#if locOpen}
  <div class="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
    <button type="button" tabindex="-1" class="absolute inset-0 bg-black/45 backdrop-blur-sm" aria-label={tr("dismiss")} onclick={closeLoc}></button>
    <div use:dialog={{ onClose: closeLoc }} class="relative w-full max-w-md rounded-t-3xl border border-line bg-panel p-5 shadow-2xl sm:rounded-3xl" role="dialog" aria-modal="true" aria-labelledby="loc-title" tabindex="-1">
      <div class="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line sm:hidden"></div>
      <div class="flex items-center justify-between">
        <h2 id="loc-title" class="m-0 text-[17px] font-bold">{tr("changeLoc")}</h2>
        <button class="iconbtn !border-transparent !bg-transparent !px-2" onclick={closeLoc} aria-label={tr("dismiss")}><Icon name="close" size={16} /></button>
      </div>

      <label class="relative mt-3 block">
        <span class="sr-only">{tr("searchPlace")}</span>
        <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"><Icon name="search" size={16} /></span>
        <input class="!pl-10" bind:value={q} placeholder={tr("searchPlacePh")} aria-label={tr("searchPlace")} />
      </label>
      {#if q}
        <ul class="mt-2 max-h-52 list-none overflow-y-auto rounded-xl border border-line bg-panel-2 p-0">
          {#if placeMatches.length}
            {#each placeMatches as t (t.station)}
              <li class="border-b border-line last:border-b-0">
                <button class="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-[14px]" onclick={() => pickPlace(t)}>
                  <span class="min-w-0 truncate font-medium">{t.name}</span>
                  <span class="shrink-0 text-[12px] text-muted">{t.state}</span>
                </button>
              </li>
            {/each}
          {:else}
            <li class="px-3 py-2.5 text-[13px] text-muted">{tr("noSearchResults")}</li>
          {/if}
        </ul>
      {/if}

      <div class="mt-3 grid grid-cols-2 gap-2">
        <label class="flex flex-col gap-1.5">
          <span class="eyebrow">{tr("state")}</span>
          <select id="state-select" bind:value={app.state} onchange={onStatePick}>
            {#each states as name (name)}
              <option value={name}>{name}</option>
            {/each}
          </select>
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="eyebrow">{tr("town")}</span>
          <select id="town-select" bind:value={app.town}>
            {#each towns as t (t.station)}
              <option value={t.station}>{t.name}</option>
            {/each}
          </select>
        </label>
      </div>

      <button class="ghostbtn mt-3 w-full" onclick={useLocation}>
        <Icon name="compass" size={15} /> {locBusy ? tr("locating") : tr("useLoc")}
      </button>
      <p class="caption mt-2 text-center text-[12px]">{tr("locHint")}</p>
      <button class="btn-primary mt-3 w-full" onclick={closeLoc}>{tr("done")}</button>
    </div>
  </div>
{/if}

<a class="skip-link" href="#main-content">{tr("skipToContent")}</a>
<main id="main-content" class="mx-auto w-full max-w-[1240px] px-3 pt-3 pb-24 sm:px-4 lg:pb-10">
  {#if !claimed && view !== "about" && view !== "api" && view !== "hazards" && view !== "news"}
    <!-- Slim, quiet location nudge: the hero owns the first screen. -->
    <div class="mb-3 flex items-center gap-2 rounded-xl border border-line bg-panel px-3 py-2 text-[12.5px]">
      <Icon name="pin" size={14} class="shrink-0 text-accent" />
      <span class="min-w-0 text-muted">{trFmt("locationPrompt", { place: app.state || "Malaysia" })}</span>
      <span class="ml-auto flex shrink-0 items-center gap-1">
        <button type="button" class="ghostbtn !min-h-0 !py-1 text-[12px]" onclick={useLocation}>{locBusy ? "…" : tr("useMyLocation")}</button>
        <button type="button" class="iconbtn !border-transparent !bg-transparent !p-1.5" onclick={markClaimed} aria-label={tr("dismiss")} title={tr("dismiss")}><Icon name="close" size={14} /></button>
      </span>
    </div>
  {/if}
  {#if !app.data && app.loading}
    <div class="mt-2 space-y-3">
      <Skeleton h={150} class="!rounded-2xl" />
      <div class="flex gap-2"><Skeleton h={34} w="104px" /><Skeleton h={34} w="104px" /><Skeleton h={34} w="104px" /></div>
      <Skeleton h={14} w="38%" />
      <Skeleton h={170} class="!rounded-2xl" />
      <Skeleton h={14} w="24%" />
      <Skeleton h={120} class="!rounded-2xl" />
    </div>
  {:else if !app.data}
    <div class="mx-auto mt-16 max-w-sm text-center">
      <div class="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent"><Icon name="alert" size={22} /></div>
      <p class="text-[16px] font-bold">{tr("loadFailed")}</p>
      <p class="caption mt-1">{tr("loadFailedHint")}</p>
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
  {:else if view === "news"}
    <News />
  {:else if view === "api"}
    <Api />
  {:else}
    <About />
  {/if}
</main>

<footer class="border-t border-line px-4 pt-4 pb-20 text-center text-[12.5px] text-muted lg:pb-5">
  <div class="flex items-center justify-center gap-2.5">
    <button class="hover:text-fg" onclick={() => (view = "about")}>{tr("navAbout")}</button>
    <span class="text-faint">·</span>
    <button class="hover:text-fg" onclick={() => (view = "api")}>API</button>
    <span class="text-faint">·</span>
    <span>© {new Date().getFullYear()} {SITE.name}</span>
  </div>
</footer>

<nav class="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-panel/90 pt-1 backdrop-blur-xl lg:hidden" aria-label="Main">
  <div class="mx-auto flex max-w-[560px]">
    {#each NAV as n (n.view)}
      <button
        class="relative flex flex-1 flex-col items-center gap-0.5 pb-2 pt-1.5"
        onclick={() => (view = n.view)}
        aria-current={view === n.view ? "page" : undefined}
      >
        {#if view === n.view}<span class="absolute top-0 h-0.5 w-7 rounded-full bg-accent"></span>{/if}
        <span class={view === n.view ? "text-accent" : "text-muted"}><Icon name={n.icon} size={21} /></span>
        <span class={"text-[11px] font-medium " + (view === n.view ? "text-accent" : "text-muted")}>{tr(n.key)}</span>
      </button>
    {/each}
  </div>
</nav>