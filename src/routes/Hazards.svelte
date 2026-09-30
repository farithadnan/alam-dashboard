<script>
    import { app } from "../core/store.svelte.js";
    import { tr } from "../core/i18n.svelte.js";
    import Icon from "../ui/Icon.svelte";
    import Flood from "../features/hazards/Flood.svelte";
    import Quakes from "../features/hazards/Quakes.svelte";
  </script>

  <div class="mb-3 inline-flex seg" role="group" aria-label={tr("navHazards")}>
    <button class:on={app.hazard === "flood"} class="segbtn inline-flex items-center gap-1.5 py-2" onclick={() => (app.hazard = "flood")}><Icon name="flood" size={14} />{tr("subFlood")}</button>
    <button class:on={app.hazard === "earthquakes"} class="segbtn inline-flex items-center gap-1.5 py-2" onclick={() => (app.hazard = "earthquakes")}><Icon name="quake" size={14} />{tr("subQuake")}</button>
  </div>

  {#if app.hazard === "flood"}
    <Flood />
  {:else}
    <Quakes />
  {/if}