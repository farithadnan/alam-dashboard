  <script>
    import { app } from "../lib/store.svelte.js";
    import { numColor, atTown } from "../lib/flags.js";
    import { wmo } from "../lib/weather-codes.js";
    import { tr, trFmt, bandLabel } from "../lib/i18n.svelte.js";
    import ShareButton from "./ui/ShareButton.svelte";
    import TelegramAlerts from "./ui/TelegramAlerts.svelte";
    import { sharePayload } from "../lib/share.js";
    import { activeWarnings } from "../lib/warnings.js";
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

    let flash = $state(false);
    const jump = (id, highlight = false) => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (!highlight) return;
      flash = true;
      setTimeout(() => (flash = false), 1600);
    };
  </script>

  {#if now}
    {@const [icon, label] = now.meta?.code != null ? wmo(String(now.meta.code)) : [null, null]}
    <div class="glass mt-1 rounded-2xl p-4 sm:p-5">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0 text-[16px] font-semibold">{townName}{#if app.state}<span class="text-muted">, {app.state}</span>{/if}</div>
        <div class="flex shrink-0 items-center gap-1.5">
          <TelegramAlerts town={app.town} state={app.state} />
          <ShareButton payload={sharePayload({ town: townName, state: app.state, now, townAir, air })} />
        </div>
      </div>
      <div class="mt-2 flex items-end justify-between gap-3">
        <div class="flex min-w-0 items-end gap-3">
          {#if icon}<span class="shrink-0 text-[40px] leading-none sm:text-[52px]" aria-hidden="true">{icon}</span>{/if}
          <span class="font-mono text-[44px] font-extrabold leading-none tracking-tighter sm:text-[56px]">{Math.round(now.value)}°</span>
          <span class="pb-1 text-[13px] text-muted">{tr("feels")} {Math.round(now.meta?.apparentTemp ?? now.value)}°</span>
        </div>
        {#if townAir}
          <div class="shrink-0 rounded-xl border px-3 py-1.5 text-center" style="border-color:{numColor(townAir.band?.label)}">
            <div class="caption text-[11px]">{tr("airNow")}</div>
            <div class="font-mono text-[22px] font-bold leading-none" style="color:{numColor(townAir.band?.label)}">{townAir.value}</div>
            <div class="text-[11px] font-semibold" style="color:{numColor(townAir.band?.label)}">{bandLabel(townAir.band?.label)}</div>
          </div>
        {:else if air}
          <div class="shrink-0 text-right"><div class="caption text-[11px]">US AQI</div><div class="font-mono text-[20px] font-semibold">{air.value}</div></div>
        {/if}
      </div>
    </div>
  {:else if app.loading}
    <div class="glass mt-1 space-y-3 rounded-2xl p-4">
      <Skeleton h={16} w="42%" />
      <div class="flex items-end justify-between gap-3">
        <Skeleton h={40} w="45%" />
        <Skeleton h={54} w="86px" class="!rounded-xl" />
      </div>
    </div>
  {/if}

  <!-- Status chips: the 'is there anything to care about right now' moment. -->
  <div class="mt-2 flex flex-wrap gap-2 text-[13px]">
    <button type="button" class="glass chip cursor-pointer rounded-full px-3 py-1 hover:border-accent"
      aria-label={trFmt("warningsInForce", { n: warnings.length })} onclick={() => jump("advisories", true)}>
      {trFmt("warningsInForce", { n: warnings.length })}
    </button>
    <button type="button" class="glass chip cursor-pointer rounded-full px-3 py-1 hover:border-accent"
      aria-label={trFmt("quakesWeek", { n: quakes.length })} onclick={() => onNavigate("hazards")}>
      {trFmt("quakesWeek", { n: quakes.length })}
    </button>
    {#if climate}
      <button type="button" class="glass chip cursor-pointer rounded-full px-3 py-1 hover:border-accent"
        onclick={() => jump("advisories")}>{climate.meta?.phase || "Neutral"}</button>
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

  <h3 class="qh">{tr("explore")}</h3>
  <div class="flex flex-wrap gap-2">
    <button class="glass rounded-xl px-4 py-3 text-[14px] font-semibold" onclick={() => onNavigate("weather")}>{tr("navWeather")}</button>
    <button class="glass rounded-xl px-4 py-3 text-[14px] font-semibold" onclick={() => onNavigate("air")}>{tr("navAQI")}</button>
    <button class="glass rounded-xl px-4 py-3 text-[14px] font-semibold" onclick={() => onNavigate("flood")}>{tr("navFlood")}</button>
    <button class="glass rounded-xl px-4 py-3 text-[14px] font-semibold" onclick={() => onNavigate("hazards")}>{tr("navHazards")}</button>
  </div>
