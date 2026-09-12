  <script>
    import FloodAlerts from "./ui/FloodAlerts.svelte";
    import { app } from "../lib/store.svelte.js";
    import { STATES } from "../lib/flags.js";
    import { getFlood } from "../lib/api.js";
    import { tr } from "../lib/i18n.svelte.js";

    // "" = all Malaysia, "myplace" = the claimed state, or a specific state name.
    let pick = $state("");
    const state = $derived(pick === "myplace" ? app.state || "" : pick);

    // Fetching lives here (parent owns the selection via its own $state — a $effect
    // should never read a $props member in this Svelte version, it miscompiles).
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

        // Compact summary: how many stations at each alert band, plus the highest river.
        const summary = $derived.by(() => {
        const sev = (s) => data.river.filter((a) => a.severity === s).length;
        const highest = data.river.reduce((m, a) => (a.level > (m?.level ?? -1) ? a : m), null);
        return {
          danger: sev("Danger"),
          warning: sev("Warning"),
          alert: sev("Alert"),
          heavy: data.rain.filter((a) => a.severity === "Heavy").length,
          highest,
        };
        });
        </script>

  <h3 class="qh">{tr("floodTitle")}</h3>
  <p class="caption -mt-1 mb-1">{tr("floodNote")} · <a class="underline hover:text-accent" href="https://publicinfobanjir.water.gov.my/" target="_blank" rel="noopener">{tr("floodOpen")}</a></p>

  <div class="mb-2">
    <select id="flood-scope" class="glass rounded-xl px-3 py-2 text-[13px]" value={pick} onchange={(e) => (pick = e.target.value)} aria-label={tr("floodAll")}>
      <option value="">{tr("floodAll")}</option>
      {#if app.state}<option value="myplace">{tr("floodMyPlace")} — {app.state}</option>{/if}
      {#each STATES as s (s.name)}
        <option value={s.name}>{s.name}</option>
      {/each}
    </select>
  </div>

  {#if data.river.length || data.rain.length}
    <div class="mb-2 flex flex-wrap gap-1.5 text-[12px]">
      {#if summary.danger}<span class="badge" style="color:var(--color-unhealthy);border-color:var(--color-unhealthy)">🔴 {summary.danger} Danger</span>{/if}
      {#if summary.warning}<span class="badge" style="color:var(--color-unhealthy);border-color:var(--color-unhealthy)">🟠 {summary.warning} Warning</span>{/if}
      {#if summary.alert}<span class="badge" style="color:var(--color-moderate);border-color:var(--color-moderate)">🟡 {summary.alert} Alert</span>{/if}
      {#if summary.heavy}<span class="badge" style="color:var(--color-unhealthy);border-color:var(--color-unhealthy)">🌧 {summary.heavy} Heavy rain</span>{/if}
      {#if summary.highest}<span class="badge text-muted">🔺 Highest {summary.highest.level} m · {summary.highest.district ?? summary.highest.stationName}</span>{/if}
    </div>
  {/if}

  <FloodAlerts river={data.river} rain={data.rain} loading={loading} state={state} />
