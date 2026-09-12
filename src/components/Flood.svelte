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

  <FloodAlerts river={data.river} rain={data.rain} loading={loading} state={state} />
