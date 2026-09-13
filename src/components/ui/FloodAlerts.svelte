  <script>
    import { app } from "../../lib/store.svelte.js";
    import { tr, trFmt } from "../../lib/i18n.svelte.js";
    import { mapPopup } from "../../lib/popup.js";
    import MapView from "./MapView.svelte";
    import Section from "./Section.svelte";
    import FloodRow from "./FloodRow.svelte";
    import Skeleton from "./Skeleton.svelte";

    /** Presentational: parent fetches and passes river/rain/loading/state/sevFilter.
     * state "" = all Malaysia (grouped by collapsible state); otherwise one state.
     * sevFilter "" = all severities, else only that severity. */
    let { river = [], rain = [], loading = false, state = "", sevFilter = "", present = [], total = 0, highest = null, onSev = null } = $props();

    const PIN_COLOR = { Danger: "#a51110", Warning: "#e05d2b", Alert: "#b26a00", Heavy: "#3b6ea8", Moderate: "#6f8fb0" };

    const friver = $derived(sevFilter ? river.filter((a) => a.severity === sevFilter) : river);
    const frain = $derived(sevFilter ? rain.filter((a) => a.severity === sevFilter) : rain);
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

    <!-- Severity filter cards, below the map -->
    {#if total}
      <div class="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <button type="button" class="glass rounded-xl px-1 py-2 text-center" onclick={() => onSev?.("")}
          style={sevFilter === "" ? "border-color:#8a8277;background:#8a82771a;color:#8a8277" : "border-color:transparent"}>
          <div class="font-mono text-[16px] font-bold leading-none">{total}</div>
          <div class="mt-1 text-[11px] text-muted">{tr("floodSevAll")}</div>
        </button>
        {#each present as p (p.s)}
          <button type="button" class="glass rounded-xl px-1 py-2 text-center" onclick={() => onSev?.(p.s)}
            style={sevFilter === p.s ? `border-color:${p.c};background:${p.c}1a;color:${p.c}` : `border-color:${p.c}55`}>
            <div class="font-mono text-[16px] font-bold leading-none" style="color:{p.c}">{p.n}</div>
            <div class="mt-1 text-[11px]" style="color:{p.c}">{p.e} {p.label}</div>
          </button>
        {/each}
      </div>
      {#if highest}
        <p class="caption mb-1">🔺 Highest {highest.level} m · {highest.district ?? highest.stationName}</p>
      {/if}
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
