  <script>
    import FloodAlerts from "./ui/FloodAlerts.svelte";
    import { app } from "../lib/store.svelte.js";
    import { getFlood } from "../lib/api.js";
    import { tr } from "../lib/i18n.svelte.js";
    import { SCOPES } from "../lib/shell.js";

    // Scope is local to Flood (styled like the top-nav seg, but it does NOT change
    // the shared weather/AQI scope). Flood is state-level data, so Near and State
    // both resolve to the user's declared state; Malaysia shows every state.
    let scope = $state("malaysia"); // near | state | malaysia
    let sevFilter = $state(""); // "" = all, else one severity
    const state = $derived(scope === "malaysia" ? "" : app.state || "");
    const SEV = { Danger: { c: "var(--color-vunhealthy)", e: "🔴" }, Warning: { c: "var(--color-unhealthy)", e: "🟠" }, Alert: { c: "var(--color-moderate)", e: "🟡" }, Heavy: { c: "#3b6ea8", e: "🌧" } };

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
      return { danger: sev("Danger"), warning: sev("Warning"), alert: sev("Alert"), heavy: data.rain.filter((a) => a.severity === "Heavy").length, highest };
    });
    const present = $derived(
      [["Danger", summary.danger], ["Warning", summary.warning], ["Alert", summary.alert], ["Heavy", summary.heavy]]
        .filter(([, n]) => n > 0)
        .map(([s, n]) => ({ s, n, c: SEV[s].c, e: SEV[s].e, label: tr(s === "Heavy" ? "sev_heavy" : s === "Danger" ? "sev_danger" : s === "Warning" ? "sev_warning" : "sev_alert") })),
    );
    const total = $derived(data.river.length + data.rain.length);
    const toggleSev = (s) => { sevFilter = sevFilter === s ? "" : s; };
  </script>

  <h3 class="qh">{tr("floodTitle")}</h3>
  <p class="caption -mt-1 mb-1">{tr("floodNote")} · <a class="underline hover:text-accent" href="https://publicinfobanjir.water.gov.my/" target="_blank" rel="noopener">{tr("floodOpen")}</a></p>

  <!-- Scope: the same segmented look as the top nav, but local to Flood -->
  <div class="seg mb-2 inline-flex" role="group" aria-label="Flood scope">
    {#each SCOPES as s (s.value)}
      <button class:on={scope === s.value} class="segbtn" onclick={() => (scope = s.value)}>{tr(s.key)}</button>
    {/each}
  </div>

  <FloodAlerts river={data.river} rain={data.rain} loading={loading} state={state} sevFilter={sevFilter} onSev={toggleSev} present={present} total={total} highest={summary.highest} />
