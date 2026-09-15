  <script>
    import { app, load } from "../lib/store.svelte.js";
    import { numColor, atTown, severityColor, apiBandOf } from "../lib/flags.js";
    import { wmo, isNightNow } from "../lib/weather-codes.js";
    import { tr, bandLabel } from "../lib/i18n.svelte.js";
    import WeatherBanner from "./ui/WeatherBanner.svelte";
    import HazardAlerts from "./ui/HazardAlerts.svelte";
    import AtAGlance from "./ui/AtAGlance.svelte";
    import EmptyState from "./ui/EmptyState.svelte";
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

    const wmo2 = $derived.by(() => (now?.meta?.code != null ? wmo(String(now.meta.code), isNightNow(now.meta)) : ["", ""]));
    const bannerAqi = $derived(
      townAir
        ? { value: townAir.value, band: bandLabel(townAir.band?.label), color: numColor(townAir.band?.label) }
        : air
          ? { value: Math.round(air.value), band: bandLabel(apiBandOf(air.value)), color: numColor(apiBandOf(air.value)) }
          : null,
    );

    // Lightweight live flood count for the homepage chip (independent of the Flood tab).
    // Scoped to the current view scope so the number always matches what the Flood page
    // shows when tapped (Malaysia = whole country; Near/State = that state).
    let floodCount = $state(0);
    let floodLoaded = $state(false);
    let floodErrored = $state(false);
    $effect(() => {
      let on = true;
      const scopeState = app.scope === "malaysia" ? undefined : app.state || undefined;
      getFlood(scopeState)
        .then((r) => { if (on) { floodCount = (r?.river?.length ?? 0) + (r?.rain?.length ?? 0); floodLoaded = true; floodErrored = false; } })
        .catch(() => { if (on) { floodLoaded = true; floodErrored = true; } });
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
    {@const payload = sharePayload({ town: townName, state: app.state, now, townAir, air, warnings, floodCount })}
    <div class="mt-1">
      <WeatherBanner icon={wmo2[0]} label={wmo2[1] || tr("weather")} temp={now.value} feels={now.meta?.apparentTemp ?? now.value} townName={townName} appState={app.state || ""} aqi={bannerAqi} town={app.town} state={app.state} share={payload} />
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

  {#if !app.data && !app.loading}
    <EmptyState icon="⚠️" title={tr("loadFailed")} action={{ label: tr("retry"), onClick: () => load() }} class="mt-2" />
  {:else}
    <!-- Primary answer first: active alerts, then a compact at-a-glance. -->
    <HazardAlerts warnings={warnings} onRead={() => jump("advisories", true)} onAll={() => jump("advisories")} />

    <h3 class="qh">{tr("atAGlance")}</h3>
    <AtAGlance
      onTap={(k) => (k === "floods" ? onNavigate("flood") : k === "quakes" ? onNavigate("hazards") : jump("advisories", k === "warnings"))}
      items={[
        { key: "warnings", icon: "⚠️", label: tr("glanceWarnings"), value: `${warnings.length}`, color: warnings.length ? severityColor(warnings[0].severity) : "var(--color-muted)" },
        { key: "floods", icon: "🌊", label: tr("glanceFloods"), value: floodLoaded ? (floodErrored ? "—" : `${floodCount}`) : "…", color: floodCount ? "var(--color-unhealthy)" : "var(--color-muted)" },
        { key: "quakes", icon: "🌐", label: tr("glanceQuakes"), value: `${quakes.length}`, color: quakes.length ? "#8e24aa" : "var(--color-muted)" },
        { key: "climate", icon: "🌡️", label: tr("glanceClimate"), value: climate?.meta?.phase || "", color: climate ? "#b26a00" : "var(--color-muted)" },
      ]}
    />

    {#if app.updated}
      <p class="caption text-muted mt-1">{tr("updated")} {app.updated}</p>
    {/if}
  {/if}

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

  <p class="caption text-muted mt-4">{tr("homeIntro")}</p>

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
