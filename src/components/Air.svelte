  <script>
    import { app } from "../lib/store.svelte.js";
    import { getHistory, getHaze } from "../lib/api.js";
    import { numColor, cityOf, groupBy, atTown } from "../lib/flags.js";
    import { bandCounts, seriesStats, legendOf, airMapPoints, nearestBy } from "../lib/air.js";
    import { locate } from "../lib/location.js";
    import ShareButton from "./ui/ShareButton.svelte";
    import PageHeader from "./ui/PageHeader.svelte";
    import { airSharePayload } from "../lib/share.js";
    import { createLoader } from "../lib/async.js";
    import { tr, bandLabel, bandAdvice } from "../lib/i18n.svelte.js";
    import TrendChart from "./ui/TrendChart.svelte";
    import Spinner from "./ui/Spinner.svelte";
    import Skeleton from "./ui/Skeleton.svelte";
    import MapView from "./ui/MapView.svelte";
    import Section from "./ui/Section.svelte";

    const stations = $derived((app.data?.stations ?? []).slice().sort((a, b) => b.value - a.value));
    const weather = $derived(app.data?.weather ?? []);
    const townName = $derived(weather.find((r) => r.station === app.town && r.kind === "weather")?.stationName ?? app.town ?? "");
    const airTown = $derived(weather.find((r) => r.station === app.town && r.kind === "aqi"));
    const heroAir = $derived(stations.find((s) => atTown(s, townName, app.town)) ?? stations[0] ?? null);

    const counts = $derived(bandCounts(stations));
    let bandFilter = $state(""); // "" = all, else a band label
    const shownStations = $derived(bandFilter ? stations.filter((o) => o.band?.label === bandFilter) : stations);
    const allPts = $derived(airMapPoints(shownStations));
    const mapFocus = $derived(open ? (() => { const s = stations.find((x) => x.station === open); return s?.coords ? { lat: s.coords.lat, lon: s.coords.lon, zoom: 11 } : null; })() : null);
    const legend = $derived(legendOf(stations));
    const groups = $derived(groupBy(shownStations, (s) => s.meta?.state ?? ""));

    let range = $state(24);
    let open = $state(null);
    let nearInfo = $state("");

    /** The station currently being charted: the expanded row, or the "near me" hero. */
    const target = $derived(open ? stations.find((s) => s.station === open) ?? null : app.scope === "near" ? heroAir : null);
    let series = $state([]);
    let seriesLoading = $state(false);
    const loadSeries = createLoader();
    $effect(() => {
      const st = target?.station;
      const h = range;
      if (!st) { series = []; return; }
      seriesLoading = true;
      loadSeries(() => getHistory("doe-eqms", st, h), {
        onValue: (res) => (series = (res.history ?? []).map((r) => ({ t: r.measuredAt, v: r.value }))),
        onError: () => (series = []),
        onSettled: () => (seriesLoading = false),
      });
    });

    const stats = $derived(seriesStats(series));

    // Haze outlook (model PM2.5) for the saved town — dust belongs with air quality.
    let haze = $state([]);
    let hazeLoading = $state(false);
    const loadHaze = createLoader();
    const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayLabel = (d) => (d === new Date().toISOString().slice(0, 10) ? tr("today") : DOW[new Date(`${d}T00:00:00`).getDay()]);
    const hazeBand = (v) => (v >= 55 ? "Unhealthy" : v >= 25 ? "Moderate" : "Good");
    const hazeEmoji = (b) => (b === "Unhealthy" ? "🟠" : b === "Moderate" ? "🟡" : "🟢");
    $effect(() => {
      const town = app.town;
      if (!town) { haze = []; return; }
      hazeLoading = true;
      loadHaze(() => getHaze(town), {
        onValue: (r) => (haze = r.haze ?? []),
        onError: () => (haze = []),
        onSettled: () => (hazeLoading = false),
      });
    });

    function setRange(h) {
      range = h;
    }

    function toggleRow(o) {
      open = open === o.station ? null : o.station;
      range = 24;
    }

    /** Find the monitoring station closest to the user and open it. */
    async function nearestStation() {
      nearInfo = tr("locating");
      try {
        const me = await locate();
        const hit = nearestBy(stations, me);
        if (hit) {
          open = hit.item.station;
          setRange(24);
          nearInfo = `${cityOf(hit.item.stationName)} · ${hit.km.toFixed(1)} km`;
        } else nearInfo = "";
      } catch {
        nearInfo = "";
      }
    }
  </script>

  <PageHeader title={`${tr("navAQI")} · ${app.scope === "malaysia" ? "Malaysia" : app.state}`} updated={app.updated} />
  <MapView pts={allPts} class="h-72 w-full rounded-xl lg:h-[52vh] lg:min-h-[400px]" fitMax={app.scope === "near" ? 12 : app.scope === "state" ? 9 : 8} focus={mapFocus} />
  {#if legend.length}
    <ul class="mt-2 flex list-none flex-wrap gap-2 p-0 text-[12px]">
      {#each legend as [label, color] (label)}
        <li class="flex items-center gap-1"><span class="inline-block size-3 rounded-full" style="background:{color}"></span> {bandLabel(label)}</li>
      {/each}
    </ul>
  {/if}

  {#if app.scope !== "near" && counts.length}
    <h3 class="qh">{tr("catTitle")}</h3>
    <div class="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3">
      {#each counts as c (c.label)}
        {#if counts.length > 1}
          <button type="button" class="glass flex items-center justify-between rounded-xl px-3 py-2"
            onclick={() => (bandFilter = bandFilter === c.label ? "" : c.label)}
            style={bandFilter === c.label ? `border-color:${numColor(c.label)};background:${numColor(c.label)}1a` : ""}>
            <span class="flex items-center gap-2 text-[13px]">
              <span class="inline-block size-3 rounded-full" style="background:{numColor(c.label)}"></span>{bandLabel(c.label)}
            </span>
            <span class="font-mono text-[18px] font-bold" style="color:{numColor(c.label)}">{c.n}</span>
          </button>
        {:else}
          <div class="glass flex items-center justify-between rounded-xl px-3 py-2">
            <span class="flex items-center gap-2 text-[13px]">
              <span class="inline-block size-3 rounded-full" style="background:{numColor(c.label)}"></span>{bandLabel(c.label)}
            </span>
            <span class="font-mono text-[18px] font-bold" style="color:{numColor(c.label)}">{c.n}</span>
          </div>
        {/if}
      {/each}
    </div>
    {#if counts.length > 1 && bandFilter}
      <button class="caption mt-1 cursor-pointer underline hover:text-accent" onclick={() => (bandFilter = "")}>Clear filter ({shownStations.length})</button>
    {/if}
  {/if}

  {#if app.scope !== "near" && stations.length > 3}
    <div class="mt-3 grid gap-2 sm:grid-cols-2">
      <div class="glass rounded-xl p-3">
        <div class="caption text-[12px]">🟢 {tr("cleanestNow")}</div>
        <ul class="mt-1 list-none p-0">
          {#each stations.slice().sort((a, b) => a.value - b.value).slice(0, 3) as s (s.station)}
            <li class="flex items-center justify-between py-0.5 text-[13px]">
              <span class="truncate">{cityOf(s.stationName)}</span>
              <span class="font-mono font-semibold" style="color:{numColor(s.band?.label)}">{s.value}</span>
            </li>
          {/each}
        </ul>
      </div>
      <div class="glass rounded-xl p-3">
        <div class="caption text-[12px]">🔴 {tr("worstNow")}</div>
        <ul class="mt-1 list-none p-0">
          {#each stations.slice(0, 3) as s (s.station)}
            <li class="flex items-center justify-between py-0.5 text-[13px]">
              <span class="truncate">{cityOf(s.stationName)}</span>
              <span class="font-mono font-semibold" style="color:{numColor(s.band?.label)}">{s.value}</span>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  {/if}

  {#if app.scope === "near"}
    <div class="mt-3 flex items-center gap-2">
      <button class="ghostbtn" onclick={nearestStation}>{tr("nearest")}</button>
      {#if nearInfo}<span class="font-mono text-[12.5px] text-muted">{nearInfo}</span>{/if}
    </div>
  {/if}

  {#if app.scope === "near" && heroAir}
    <div class="flex items-center justify-between gap-2">
      <h3 class="qh">{cityOf(heroAir.stationName)}</h3>
      <ShareButton payload={airSharePayload({ station: cityOf(heroAir.stationName), state: app.state, value: heroAir.value, band: bandLabel(heroAir.band?.label), color: numColor(heroAir.band?.label), advice: bandAdvice(heroAir.band?.label) || heroAir.band?.advice || "" })} />
    </div>
    <div class="glass mt-1 rounded-2xl p-4">
      <div class="flex items-center justify-between gap-4">
        <div>
          <div class="font-mono text-[44px] font-bold leading-none" style="color:{numColor(heroAir.band?.label)}">{heroAir.value}</div>
          <div class="mt-1 text-[15px] font-semibold" style="color:{numColor(heroAir.band?.label)}">{bandLabel(heroAir.band?.label)}</div>
        </div>
        <div class="flex gap-2 rounded-xl border border-line p-2 text-[12.5px]">
          <div class="text-center"><div class="caption text-[10px]">PM2.5</div><div class="font-mono font-semibold">{airTown?.meta?.pm2_5 ?? "—"}</div></div>
          <div class="text-center"><div class="caption text-[10px]">PM10</div><div class="font-mono font-semibold">{airTown?.meta?.pm10 ?? "—"}</div></div>
          <div class="text-center"><div class="caption text-[10px]">UV</div><div class="font-mono font-semibold">{airTown?.meta?.uv ?? "—"}</div></div>
        </div>
      </div>
      <p class="mt-2 text-[13px] text-muted">{bandAdvice(heroAir.band?.label) || heroAir.band?.advice}</p>
      <div class="mt-2 flex gap-2">
        <button class:on={range === 24} class="segbtn" onclick={() => setRange(24)}>24h</button>
        <button class:on={range === 168} class="segbtn" onclick={() => setRange(168)}>7d</button>
      </div>
      <p class="caption mt-1 text-[12px]">{range === 24 ? tr("chartPast24") : tr("chartPast7d")}</p>
      {#if seriesLoading}
        <div class="flex h-[170px] items-center justify-center"><Spinner size={22} label={tr("loading")} /></div>
      {:else if series.length >= 2}
        <TrendChart series={series} color={numColor(heroAir.band?.label)} ariaLabel="Air quality trend" mode={range === 168 ? "days" : "hours"} />
        {#if stats}<p class="caption mt-1 text-[12px]">{"min " + stats.min + " · avg " + stats.avg + " · max " + stats.max}</p>{/if}
      {/if}
    </div>
  {:else}
    {#if app.loading && !stations.length}
      <div class="mt-2 space-y-2">
        <Skeleton h={14} w="35%" />
        <Skeleton h={52} class="!rounded-xl" />
        <Skeleton h={52} class="!rounded-xl" />
        <Skeleton h={52} class="!rounded-xl" />
      </div>
    {:else}
    {#each groups as g (g.key)}
      <Section title={g.key} startOpen={groups.length === 1}>
        <ul class="list-none m-0 p-0">
          {#each g.items as o (o.station)}
            <li class="border-b border-line" style="border-left:3px solid {numColor(o.band?.label)}">
              <button class="flex w-full items-center gap-3 px-2.5 py-2.5 pl-3.5 text-left" onclick={() => toggleRow(o)} aria-expanded={open === o.station}>
                <div class="min-w-0 flex-1">
                  <div class="text-[15px] font-semibold leading-tight">{cityOf(o.stationName)}</div>
                  <div class="text-[12.5px] text-muted">{bandLabel(o.band?.label)}</div>
                </div>
                <span class="font-mono text-[20px] font-semibold" style="color:{numColor(o.band?.label)}">{o.value}</span>
                <span class="font-mono text-muted">{open === o.station ? "−" : "+"}</span>
              </button>
              {#if open === o.station}
                <div class="px-3 pb-3">
                  <p class="text-[13px] text-muted">{bandAdvice(o.band?.label) || o.band?.advice}</p>
                  <div class="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[12.5px] text-muted">
                    {#if o.meta?.place}<div>{tr("stationLbl")}</div><div class="text-fg">{o.meta.place}</div>{/if}
                    {#if o.meta?.category}<div>{tr("categoryLbl")}</div><div class="text-fg">{o.meta.category}</div>{/if}
                    {#if o.meta?.region}<div>{tr("region")}</div><div class="text-fg">{o.meta.region}</div>{/if}
                    {#if o.meta?.param}<div>{tr("parameter")}</div><div class="text-fg">{o.meta.param}</div>{/if}
                    {#if o.meta?.pm10 != null}<div>PM10</div><div class="font-mono text-fg">{o.meta.pm10}</div>{/if}
                  </div>
                  <div class="mt-2 flex gap-2">
                    <button class:on={range === 24} class="segbtn" onclick={() => setRange(24)}>24h</button>
                    <button class:on={range === 168} class="segbtn" onclick={() => setRange(168)}>7d</button>
                  </div>
                  <p class="caption mt-1 text-[12px]">{range === 24 ? tr("chartPast24") : tr("chartPast7d")}</p>
                  {#if seriesLoading}
                    <div class="flex h-[170px] items-center justify-center"><Spinner size={22} label={tr("loading")} /></div>
                  {:else if series.length >= 2}
                    <TrendChart series={series} color={numColor(o.band?.label)} ariaLabel="Air quality trend" mode={range === 168 ? "days" : "hours"} />
                    {#if stats}<p class="caption mt-1 text-[12px]">{"min " + stats.min + " · avg " + stats.avg + " · max " + stats.max}</p>{/if}
                  {/if}
                </div>
              {/if}
            </li>
          {/each}
        </ul>
      </Section>
    {/each}
    {/if}
  {/if}

  {#if app.scope === "near" && (hazeLoading || haze.length)}
    <h3 class="qh">{tr("hazeTitle")}<span class="text-muted"> · {tr("yourTown")}</span></h3>
    {#if hazeLoading && !haze.length}
      <Skeleton h={54} />
    {:else}
      <p class="caption mb-1">{tr("hazeHint")}</p>
      <ul class="list-none m-0 border-t border-line p-0">
        {#each haze.slice(0, 4) as d (d.date)}
          <li class="flex items-center gap-3 border-b border-line px-2.5 py-2 text-[13.5px]">
            <span class="w-12 shrink-0 text-muted">{dayLabel(d.date)}</span>
            <span class="shrink-0"><span class="badge" style="color:{numColor(hazeBand(d.pm25Max))};border-color:{numColor(hazeBand(d.pm25Max))}">{hazeEmoji(hazeBand(d.pm25Max))} {bandLabel(hazeBand(d.pm25Max))}</span></span>
            <span class="shrink-0 font-mono text-[13px] font-semibold">{Math.round(d.pm25Max)}<span class="text-muted"> µg/m³</span></span>
          </li>
        {/each}
      </ul>
    {/if}
  {/if}
