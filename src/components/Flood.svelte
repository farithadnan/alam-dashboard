  <script>
    import FloodAlerts from "./ui/FloodAlerts.svelte";
    import { tr } from "../lib/i18n.svelte.js";
  </script>

  <h3 class="qh">{tr("floodTitle")}</h3>
  <p class="caption -mt-1 mb-1">{tr("floodNote")}</p>
  <FloodAlerts />
