  <script>
    import { app } from "../lib/store.svelte.js";
    import { numColor, atTown } from "../lib/flags.js";
    import { wmo } from "../lib/weather-codes.js";
    import { tr, trFmt, bandLabel } from "../lib/i18n.svelte.js";
    import ShareButton from "./ui/ShareButton.svelte";
    import TelegramAlerts from "./ui/TelegramAlerts.svelte";
    import WeatherBanner from "./ui/WeatherBanner.svelte";
    import { sharePayload } from "../lib/share.js";
    import { activeWarnings } from "../lib/warnings.js";
    import { getFlood } from "../lib/api.js";
    import Skeleton from "./ui/Skeleton.svelte";
    import Warnings from "./Warnings.svelte";

    let { onNavigate = () => {} } = $props();

    const weather = $derived(app.data?.weather ?? []);
    const stations = $derived((app.data?.stations ?? []).slice().sort((a, b) => b.value - a.value));
    const townName = $derived(weather.find((r) => r.station === app.town && r.kind === "weather")?.stationName ?? app.data?.allTowns?.find((t) => t.station === app.town)?.name ?? app.town ?? "");
    const now = $derived(weather.find((r) => r.station === app.town && r.kind === "weather"));
    const air = $derived(weather.find((r) => r.station === app.town && r.kind === "aqi"));
    const townAir = $derived(stations.find((s) => atTown(s, townName, app.town)) ?? null);
    const warnings = $derived(activeWarnings(app.data?.hazards?.warnings ?? []));
    const quakes = $derived(app.data?.hazards?.earthquakes ?? []);
    const climate = $derived(app.data?.hazards?.climate ?? null);
    const newsCount = $derived(app.data?.news?.length ?? 0);
    const airBad = $derived(["Unhealthy", "Very Unhealthy", "Hazardous"].includes(townAir?.band?.label ?? ""));

    const wmo2 = $derived.by(() => (now?.meta?.code != null ? wmo(String(now.meta.code)) : ["", ""]));
    const bannerAqi = $derived(
      townAir
        ? { value: townAir.value, band: bandLabel(townAir.band?.label), color: numColor(townAir.band?.label) }
        : air
          ? { value: Math.round(air.value), band: "AQI", color: numColor("Moderate") }
          : null,
    );

    // Lightweight live flood count for the homepage chip (independent of the Flood tab).
    let floodCount = $state(0);
    let floodLoaded = $state(false);
    $effect(() => {
      let on = true;
      getFlood()
        .then((r) => { if (on) { floodCount = (r?.river?.length ?? 0) + (r?.rain?.length ?? 0); floodLoaded = true; } })
        .catch(() => { if (on) floodLoaded = true; });
      return () => (on = false);
    });

    let flash = $state(false);
    const jump = (id, highlight = false) => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (!highlight) return;
      flash = true;
      setTimeout(() => (flash = false), 1600);
    };

    const OFFICIAL = [
      { name: "MET Malaysia", by: "Weather & warnings", href: "https://www.met.gov.my/" },
      { name: "JPS InfoBanjir", by: "River levels & floods", href: "https://publicinfobanjir.water.gov.my/" },
      { name: "DOE APIMS", by: "Air quality", href: "https://apims.doe.gov.my/" },
      { name: "NADMA", by: "Disaster info", href: "https://portalbencana.nadma.gov.my/" },
      { name: "USGS", by: "Earthquakes", href: "https://earthquake.usgs.gov/" },
    ];
  </script>

  {#if now}
    {@const payload = sharePayload({ town: townName, state: app.state, now, townAir, air })}
    <div class="mt-1">
      <WeatherBanner icon={wmo2[0]} label={wmo2[1] || tr("weather")} temp={now.value} feels={now.meta?.apparentTemp ?? now.value} townName={townName} appState={app.state || ""} aqi={bannerAqi}>
        <svelte:fragment slot="actions">
          <TelegramAlerts town={app.town} state={app.state} />
          <ShareButton payload={payload} />
        </svelte:fragment>
      </WeatherBanner>
      <p class="caption mt-1.5 text-muted">{tr("homeIntro")}</p>
    </div>
  {:else if app.loading}
    <div class="glass mt-1 h-[190px] rounded-2xl p-4">
      <Skeleton h={18} w="55%" />
      <div class="mt-10 flex items-end justify-between gap-3">
        <Skeleton h={44} w="42%" />
        <Skeleton h={54} w="92px" class="!rounded-xl" />
      </div>
    </div>
  {/if}

  <!-- Status + live counts: what to care about right now. -->
  <div class="mt-2 flex flex-wrap gap-2 text-[13px]">
    {#if warnings.length > 0}
      <button type="button" class="glass chip cursor-pointer rounded-full px-3 py-1 hover:border-accent"
        aria-label={trFmt("warningsInForce", { n: warnings.length })} onclick={() => jump("advisories", true)}>
        {trFmt("warningsInForce", { n: warnings.length })}
      </button>
    {/if}
    {#if quakes.length > 0}
      <button type="button" class="glass chip cursor-pointer rounded-full px-3 py-1 hover:border-accent"
        aria-label={trFmt("quakesWeek", { n: quakes.length })} onclick={() => onNavigate("hazards")}>
        {trFmt("quakesWeek", { n: quakes.length })}
      </button>
    {/if}
    {#if climate}
      <button type="button" class="glass chip cursor-pointer rounded-full px-3 py-1 hover:border-accent"
        onclick={() => jump("advisories")}>{climate.meta?.phase || "Neutral"}</button>
    {/if}
    {#if floodLoaded && floodCount > 0}
      <button type="button" class="glass chip cursor-pointer rounded-full px-3 py-1 hover:border-accent"
        onclick={() => onNavigate("flood")}>{trFmt("homeFlood", { n: floodCount })}</button>
    {/if}
    {#if newsCount > 0}
      <button type="button" class="glass chip cursor-pointer rounded-full px-3 py-1 hover:border-accent"
        onclick={() => onNavigate("news")}>{trFmt("homeNews", { n: newsCount })}</button>
    {/if}
    {#if airBad}
      <button type="button" class="glass chip cursor-pointer rounded-full px-3 py-1 hover:border-accent"
        style="border-color:var(--color-unhealthy);color:var(--color-unhealthy)" onclick={() => onNavigate("air")}>
        ⚠️ {bandLabel(townAir.band?.label)} air
      </button>
    {/if}
  </div>

  <h3 class="qh" id="advisories" class:text-accent={flash}>{tr("advisories")}</h3>
  <Warnings />
  {#if climate}
    {@const phase = climate.meta?.phase || "Neutral"}
    {@const v = climate.meta?.value}
    {@const season = climate.meta?.season}
    <p class="caption mt-1">
      {phase.includes("El Niño") ? tr("climateEl") : phase.includes("La Niña") ? tr("climateLa") : tr("climateNeutral")}{#if v != null} · {v > 0 ? "+" : ""}{v}°C{#if season} ({season}){/if}{/if}
    </p>
    <p class="caption">{phase.includes("El Niño") ? tr("climateElEffect") : phase.includes("La Niña") ? tr("climateLaEffect") : tr("climateNeutralEffect")}</p>
  {/if}

  <h3 class="qh">{tr("srcTitle")}</h3>
  <p class="caption -mt-1 mb-1">{tr("srcHint")}</p>
  <ul class="list-none m-0 border-t border-line p-0">
    {#each OFFICIAL as s (s.href)}
      <li class="border-b border-line">
        <a class="flex items-center justify-between gap-2 px-2.5 py-2 text-[14px] font-semibold hover:text-accent" href={s.href} target="_blank" rel="noopener">
          <span class="min-w-0">{s.name}</span>
          <span class="shrink-0 text-[12px] font-normal text-muted">{s.by}</span>
        </a>
      </li>
    {/each}
  </ul>
