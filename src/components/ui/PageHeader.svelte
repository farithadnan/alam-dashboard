  <!-- Uniform section header: title (left) + muted "Updated HH:MM" (right).
       Keeps freshness out of the flow and consistent on every data view. -->
  <script>
    import { tr } from "../../lib/i18n.svelte.js";
    let { title = "", updated = "", source = "" } = $props();
  </script>

  <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
    <h3 class="qh">{title}</h3>
    {#if updated}
      <span class="text-[11px] font-normal text-muted">{tr("updated")} {updated}{#if source}<span class="mx-1 opacity-60">·</span>{source}{/if}</span>
    {/if}
  </div>
