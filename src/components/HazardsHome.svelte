  <script>
    import { app } from "../lib/store.svelte.js";
    import { tr } from "../lib/i18n.svelte.js";
    import Flood from "./Flood.svelte";
    import Quakes from "./Hazards.svelte";
  </script>

  <div class="flex items-center gap-2">
    <div class="seg" role="group" aria-label={tr("navHazards")}>
      <button class:on={app.hazard === "flood"} class="segbtn" onclick={() => (app.hazard = "flood")}>{tr("subFlood")}</button>
      <button class:on={app.hazard === "earthquakes"} class="segbtn" onclick={() => (app.hazard = "earthquakes")}>{tr("subQuake")}</button>
    </div>
  </div>

  {#if app.hazard === "flood"}
    <Flood />
  {:else}
    <Quakes />
  {/if}
