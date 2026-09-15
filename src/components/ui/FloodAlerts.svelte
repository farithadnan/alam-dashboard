  <script>
    import { app } from "../../lib/store.svelte.js";
    import { tr, trFmt } from "../../lib/i18n.svelte.js";
    import { mapPopup } from "../../lib/popup.js";
    import MapView from "./MapView.svelte";
    import Section from "./Section.svelte";
    import FilterPills from "./FilterPills.svelte";
    import FloodRow from "./FloodRow.svelte";
    import Skeleton from "./Skeleton.svelte";

    /** Presentational: parent fetches and passes river/rain/loading/state/sevFilter.
     * state "" = all Malaysia (grouped by collapsible state); otherwise one state.
     * sevFilter "" = all severities, else only that severity. */
    let { river = [], rain = [], loading = false, state = "", sevFilter = "", present = [], total = 0, highest = null, onSev = null } = $props();

    const PIN_COLOR = { Danger: "#a51110", Warning: "#e05d2b", Alert: "#b26a00", Heavy: "#3b6ea8", Moderate: "#6f8fb0" };

    // The feed can list a station more than once — show each station once (worst severity).
    const RANK = { Danger: 0, Warning: 1, Alert: 2, Moderate: 3, Heavy: 3 };
    const dedupe = (list) => {
      const m = new Map();
      for (const a of list) {
        const cur = m.get(a.station);
        const rk = RANK[a.severity] ?? 9;
        if (!cur || rk < (RANK[cur.severity] ?? 9)) m.set(a.station, a);
      }
      return [...m.values()];
    };

    const friver = $derived(dedupe(sevFilter ? river.filter((a) => a.severity === sevFilter) : river));
    const frain = $derived(dedupe(sevFilter ? rain.filter((a) => a.severity === sevFilter) : rain));
    const hasData = $derived(friver.length > 0 || frain.length > 0);
    const displayState = $derived(state || app.state || "Malaysia");

    const floodPts = $derived.by(() => {
      const out = [];
      for (const a of friver) {
        if (typeof a.lat === "number" && typeof a.lon === "number") {
          out.push({
            lat: a.lat, lon: a.lon, color: PIN_COLOR[a.severity] ?? "#8a8277", num: Number(a.level).toFixed(1), size: 24, ripple: true,
            html: mapPopup({ title: a.stationName, value: `${a.level} m`, valueColor: PIN_COLOR[a.severity] ?? "#6b6258", flag: a.severity, sub: `${a.district}, ${a.state}` }),
          });
        }
      }
      for (const a of frain) {
        if (typeof a.lat === "number" && typeof a.lon === "number") {
          out.push({
            lat: a.lat, lon: a.lon, color: PIN_COLOR[a.severity] ?? "#6f8fb0", num: String(Math.round(a.mmHour)), size: 20, ripple: true,
            html: mapPopup({ title: a.stationName, value: `${a.mmHour} mm/hr`, valueColor: PIN_COLOR[a.severity] ?? "#6b6258", flag: a.severity, sub: `${a.district}, ${a.state}` }),
          });
        }
      }
      return out;
    });

    // All-Malaysia view: one collapsible section per state (river + rain rows inside).
    const sections = $derived.by(() => {
      const map = new Map();
      const add = (list, isRain) => {
        for (const a of list) {
          const k = a.state || "Other";
          let g = map.get(k);
          if (!g) { g = { state: k, river: [], rain: [] }; map.set(k, g); }
          (isRain ? g.rain : g.river).push(a);
        }
      };
      add(friver, false);
      add(frain, true);
      return [...map.values()].sort((a, b) => a.state.localeCompare(b.state));
    });
  </script>

  {#if loading && !hasData}
    <div class="space-y-2">
      <Skeleton h={288} class="!rounded-xl" />
      <Skeleton h={54} />
      <Skeleton h={54} />
      <Skeleton h={54} />
    </div>
  {:else if hasData}
    {#if floodPts.length}
      <MapView pts={floodPts} class="mb-3 h-72 w-full rounded-xl lg:h-[52vh] lg:min-h-[400px]" fitMax={9} />
    {/if}

    <!-- Severity filter: compact pills (the old cards read as unexplained counts) -->
    {#if total}
      <FilterPills pills={[{ key: "", label: tr("floodSevAll"), count: total, color: "#8a8277" }, ...present.map((p) => ({ key: p.s, label: `${p.e} ${p.label}`, count: p.n, color: p.c }))]} value={sevFilter} onPick={(k) => onSev?.(k)} class="mb-1" />
      <p class="caption -mt-1 mb-2 text-muted">{tr("floodSevHint")}</p>
    {/if}
    {#if present.length}
      <div class="mb-2 rounded-xl border border-line px-3 py-2 text-[12.5px] text-muted">
        <div class="font-semibold text-fg">{tr("floodLevelTitle")}</div>
        <ul class="mt-1 list-none m-0 space-y-0.5 p-0">
          <li class="flex items-start gap-1.5"><span class="mt-1.5 size-2 shrink-0 rounded-full" style="background:#b26a00"></span>{tr("floodMeanAlert")}</li>
          <li class="flex items-start gap-1.5"><span class="mt-1.5 size-2 shrink-0 rounded-full" style="background:#e05d2b"></span>{tr("floodMeanWarning")}</li>
          <li class="flex items-start gap-1.5"><span class="mt-1.5 size-2 shrink-0 rounded-full" style="background:#a51110"></span>{tr("floodMeanDanger")}</li>
        </ul>
      </div>
    {/if}
    {#if highest}
      <div class="mb-2 flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-[13px]">
        <span aria-hidden="true">🔺</span>
        <span>{tr("floodHighest")} <span class="font-mono font-bold">{highest.level} m</span> · {highest.district ?? highest.stationName}</span>
      </div>
    {/if}
    {#if state}
      <ul class="list-none m-0 border-t border-line p-0">
        {#if friver.length}
        <li class="caption mb-0.5 mt-1 list-none pl-2.5 pr-2.5 text-[12.5px]">{tr("floodRiver")}</li>
        {#each friver as a, i (i)}
          <FloodRow {a} />
        {/each}
        {/if}
        {#if frain.length}
        <li class="caption mb-0.5 mt-2 list-none pl-2.5 pr-2.5 text-[12.5px]">{tr("floodRain")}</li>
        {#each frain as a, i1 (i1)}
          <FloodRow {a} isRain />
        {/each}
        {/if}
      </ul>
    {:else}
      {#each sections as sec (sec.state)}
        <Section title={sec.state} startOpen={false}>
          {#if sec.river.length}
            <div class="caption mb-0.5 mt-1 px-2.5 text-[12px] text-muted">{tr("floodRiver")}</div>
            <ul class="list-none m-0 p-0">
              {#each sec.river as a, i (i)}
                <FloodRow {a} />
              {/each}
            </ul>
          {/if}
          {#if sec.rain.length}
            <div class="caption mb-0.5 mt-1 px-2.5 text-[12px] text-muted">{tr("floodRain")}</div>
            <ul class="list-none m-0 p-0">
              {#each sec.rain as a, i1 (i1)}
                <FloodRow {a} isRain />
              {/each}
            </ul>
          {/if}
        </Section>
      {/each}
    {/if}
  {:else}
    <p class="caption">{trFmt("floodNone", { state: displayState })}</p>
    <p class="caption mt-0.5">{tr("floodMonitor")}</p>
  {/if}
