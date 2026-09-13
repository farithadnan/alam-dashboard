  <script>
    import FloodAlerts from "./ui/FloodAlerts.svelte";
    import { app } from "../lib/store.svelte.js";
    import { getFlood } from "../lib/api.js";
    import { tr } from "../lib/i18n.svelte.js";

    // Scope mirrors the AQI/weather pills. Flood is state-level data, so Near me and
    // State both resolve to the user's declared state; Malaysia shows every state.
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
    const pill = (on) => (on ? "cursor-pointer rounded-full bg-accent px-3 py-1 text-[12.5px] font-semibold text-white" : "cursor-pointer rounded-full border border-line px-3 py-1 text-[12.5px] text-muted hover:border-accent");
    const toggleSev = (s) => { sevFilter = sevFilter === s ? "" : s; };
  </script>

  <h3 class="qh">{tr("floodTitle")}</h3>
  <p class="caption -mt-1 mb-1">{tr("floodNote")} · <a class="underline hover:text-accent" href="https://publicinfobanjir.water.gov.my/" target="_blank" rel="noopener">{tr("floodOpen")}</a></p>

  <!-- Scope: the same Near / State / Malaysia pills as AQI & Weather -->
  <div class="mb-2 flex flex-wrap items-center gap-1.5">
    <button type="button" class={pill(scope === "near")} onclick={() => (scope = "near")}>{tr("scopeNear")}</button>
    <button type="button" class={pill(scope === "state")} onclick={() => (scope = "state")}>{tr("scopeState")}</button>
    <button type="button" class={pill(scope === "malaysia")} onclick={() => (scope = "malaysia")}>{tr("scopeMalaysia")}</button>
  </div>

  {#if total}
    <!-- Clickable severity cards (coloured like the quake cards) -->
    <div class="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
      <button type="button" class="glass rounded-xl px-1 py-2 text-center" onclick={() => (sevFilter = "")}
        style={sevFilter === "" ? "border-color:#8a8277;background:#8a8277" : "border-color:transparent"}>
        <div class="font-mono text-[16px] font-bold leading-none">{total}</div>
        <div class="mt-1 text-[11px] text-muted">{tr("floodSevAll")}</div>
      </button>
      {#each present as p (p.s)}
        <button type="button" class="glass rounded-xl px-1 py-2 text-center" onclick={() => toggleSev(p.s)}
          style={sevFilter === p.s ? `border-color:${p.c};color:${p.c};background:${p.c}1a` : `border-color:${p.c}55`}>
          <div class="font-mono text-[16px] font-bold leading-none" style="color:{p.c}">{p.n}</div>
          <div class="mt-1 text-[11px]" style="color:{p.c}">{p.e} {p.label}</div>
        </button>
      {/each}
    </div>
    {#if summary.highest}
      <p class="caption mb-1">🔺 Highest {summary.highest.level} m · {summary.highest.district ?? summary.highest.stationName}</p>
    {/if}
  {/if}

  <FloodAlerts river={data.river} rain={data.rain} loading={loading} state={state} sevFilter={sevFilter} />
