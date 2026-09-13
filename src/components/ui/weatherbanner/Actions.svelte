  <!-- Generic overlay actions for the banner: Telegram + Share as small white
       pills, styled like the condition label. Each is INDEPENDENT — pass
       showTelegram / showShare to show either, both, or neither (default both). -->
  <script>
    import TelegramAlerts from "../TelegramAlerts.svelte";
    import ShareButton from "../ShareButton.svelte";

    let { town = "", state = "", share = null, showTelegram = true, showShare = true, class: cls = "" } = $props();
  </script>

  <div class="actions">
    {#if showTelegram && town}<TelegramAlerts pill {town} {state} class={cls} />{/if}
    {#if showShare && share}<ShareButton pill payload={share} class={cls} />{/if}
  </div>

  <style>
    .actions { display: flex; align-items: center; gap: 6px; }
  </style>
