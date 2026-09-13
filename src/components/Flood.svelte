  <script>
    import FloodAlerts from "./ui/FloodAlerts.svelte";
    import { app } from "../lib/store.svelte.js";
    import { STATES } from "../lib/flags.js";
    import { getFlood } from "../lib/api.js";
    import { tr } from "../lib/i18n.svelte.js";

    // Scope: "malaysia" = all grouped by state; "state" = a specific state.
    let mode = $state("malaysia");
    let selState = $state(app.state || "");
    // Severity filter pills: "" = all, else one of Danger/Warning/Alert/Heavy/Moderate.
    let sevFilter = $state("");
    const state = $derived(mode === "state" ? selState : "");
    const SEV_COLOR = { Danger: "var(--color-vunhealthy)", Warning: "var(--color-unhealthy)", Alert: "var(--color-moderate)", Heavy: "var(--color-unhealthy)", Moderate: "var(--color-moderate)" };

    // Fetching lives here (parent owns the selection via its own $state).
    let data = $state({ river: [], rain: [] });
    let loading = $state(false);
    let seq = 0;
    $effect(() => {
      const id = ++seq;
      loading = true;
      getFlood(state || undefined)
        .then((r) => { if (id === seq) data = r ?? { river: [], rain: [] }; })
        .catch(() => { if (id === seq) data = { river: [], rain: [] }; })
        .finally(() => { if (id === seq) loading = false; });
    });

    const summary = $derived.by(() => {
      const sev = (s) => data.river.filter((a) => a.severity === s).length;
      const highest = data.river.reduce((m, a) => (a.level > (m?.level ?? -1) ? a : m), null);
      return {
        danger: sev("Danger"), warning: sev("Warning"), alert: sev("Alert"),
        heavy: data.rain.filter((a) => a.severity === "Heavy").length,
        highest,
      };
    });

    const pill = (on) =>
      on
        ? "cursor-pointer rounded-full bg-accent px-3 py-1 text-[12.5px] font-semibold text-white"
        : "cursor-pointer rounded-full border border-line px-3 py-1 text-[12.5px] text-muted hover:border-accent";
    const sevBtn = (sev, color) =>
      sevFilter === sev
        ? `cursor-pointer rounded-full px-3 py-1 text-[12px] font-semibold border ${color} ${color}1a`
        : `cursor-pointer rounded-full border border-line px-3 py-1 text-[12px] text-muted hover:border-accent`;
    const toggleSev = (sev) => { sevFilter = sevFilter === sev ? "" : sev; };
  </script>

  <h3 class="qh">{tr("floodTitle")}</h3>
  <p class="caption -mt-1 mb-1">{tr("floodNote")} · <a class="underline hover:text-accent" href="https://publicinfobanjir.water.gov.my/" target="_blank" rel="noopener">{tr("floodOpen")}</a></p>

  <!-- Scope: Malaysia / State -->
  <div class="mb-2 flex flex-wrap items-center gap-1.5">
    <button type="button" class={pill(mode === "malaysia")} onclick={() => (mode = "malaysia")}>{tr("floodAll")}</button>
    <button type="button" class={pill(mode === "state")} onclick={() => (mode = "state")}>{tr("floodState")}</button>
  </div>
  {#if mode === "state"}
    <div class="mb-2 flex gap-1.5 overflow-x-auto pb-1">
      {#each STATES as s (s.name)}
        <button type="button" class={pill(selState === s.name)} onclick={() => (selState = s.name)}>{s.name}</button>
      {/each}
    </div>
  {/if}

  <!-- Clickable severity filter (like the quake cards): filters the map + list -->
  {#if data.river.length || data.rain.length}
    <div class="mb-2 flex flex-wrap gap-1.5 text-[12px]">
      <button type="button" class={sevBtn("", "var(--color-muted)")} onclick={() => (sevFilter = "")}>{tr("floodSevAll")}</button>
      {#if summary.danger}<button type="button" class={sevBtn("Danger", SEV_COLOR.Danger)} onclick={() => toggleSev("Danger")} style={sevFilter === "Danger" ? `border-color:${SEV_COLOR.Danger};color:${SEV_COLOR.Danger};background:${SEV_COLOR.Danger}1a` : ""}>🔴 {summary.danger} {tr("sev_danger")}</button>{/if}
      {#if summary.warning}<button type="button" class={sevBtn("Warning", SEV_COLOR.Warning)} onclick={() => toggleSev("Warning")} style={sevFilter === "Warning" ? `border-color:${SEV_COLOR.Warning};color:${SEV_COLOR.Warning};background:${SEV_COLOR.Warning}1a` : ""}>🟠 {summary.warning} {tr("sev_warning")}</button>{/if}
      {#if summary.alert}<button type="button" class={sevBtn("Alert", SEV_COLOR.Alert)} onclick={() => toggleSev("Alert")} style={sevFilter === "Alert" ? `border-color:${SEV_COLOR.Alert};color:${SEV_COLOR.Alert};background:${SEV_COLOR.Alert}1a` : ""}>🟡 {summary.alert} {tr("sev_alert")}</button>{/if}
      {#if summary.heavy}<button type="button" class={sevBtn("Heavy", SEV_COLOR.Heavy)} onclick={() => toggleSev("Heavy")} style={sevFilter === "Heavy" ? `border-color:${SEV_COLOR.Heavy};color:${SEV_COLOR.Heavy};background:${SEV_COLOR.Heavy}1a` : ""}>🌧 {summary.heavy} {tr("sev_heavy")}</button>{/if}
      {#if summary.highest}<span class="badge px-2.5 py-1 text-muted">🔺 Highest {summary.highest.level} m · {summary.highest.district ?? summary.highest.stationName}</span>{/if}
    </div>
  {/if}

  <FloodAlerts river={data.river} rain={data.rain} loading={loading} state={state} sevFilter={sevFilter} />
