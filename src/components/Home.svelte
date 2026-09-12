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

    const OFFICIAL = [
      { name: "MET Malaysia", by: "Weather & warnings", href: "https://www.met.gov.my/" },
      { name: "JPS InfoBanjir", by: "River levels & floods", href: "https://publicinfobanjir.water.gov.my/" },
      { name: "DOE APIMS", by: "Air quality", href: "https://apims.doe.gov.my/" },
      { name: "NADMA", by: "Disaster info", href: "https://portalbencana.nadma.gov.my/" },
      { name: "USGS", by: "Earthquakes", href: "https://earthquake.usgs.gov/" },
    ];
  </script>

  {#if now}
    {@const [icon, label] = now.meta?.code != null ? wmo(String(now.meta.code)) : [null, null]}
    <div class="glass mt-1 rounded-2xl p-3 sm:p-4">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0 text-[15px] font-semibold">{townName}{#if app.state}<span class="text-muted">, {app.state}</span>{/if}</div>
        <div class="flex shrink-0 items-center gap-1.5">
          <TelegramAlerts town={app.town} state={app.state} />
          <ShareButton payload={sharePayload({ town: townName, state: app.state, now, townAir, air })} />
        </div>
      </div>
      <div class="mt-1.5 flex items-end justify-between gap-3">
        <div class="flex min-w-0 items-end gap-3">
          {#if icon}<span class="shrink-0 text-[30px] leading-none sm:text-[36px]" aria-hidden="true">{icon}</span>{/if}
          <span class="font-mono text-[32px] font-extrabold leading-none sm:text-[40px]">{Math.round(now.value)}°</span>
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
