  <script>
    import { tr } from "../../lib/i18n.svelte.js";
    import { telegramAlertsUrl } from "../../lib/share.js";

    /** town (slug) + state open the bot pre-subscribed to that place. */
    let { town, state, class: cls = "" } = $props();
    let url = $derived(telegramAlertsUrl(town, state));
  </script>

  {#if url}
    <a
      class="iconbtn shrink-0 gap-1.5 {cls}"
      href={url}
      target="_blank"
      rel="noopener"
      aria-label={tr("alertsTelegram")}
      title={tr("alertsTelegram")}
    >
      <span aria-hidden="true">🔔</span>
      <span class="hidden text-[12px] font-medium sm:inline">{tr("alertsTelegram")}</span>
    </a>
  {/if}
