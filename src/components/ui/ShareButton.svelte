<script>
  import { tr } from "../../lib/i18n.svelte.js";
  import { shareCard, shareText } from "../../lib/sharecard.js";

  /** `payload` comes from lib/share.js so every share entry point is identical. */
  let { payload, textOnly = false, class: cls = "" } = $props();
</script>

<!-- Labelled from sm upwards, icon-only on mobile: an unlabelled arrow is easy to miss. -->
<button
  class="iconbtn shrink-0 gap-1.5 {cls}"
  onclick={() => (textOnly ? shareText(payload) : shareCard(payload))}
  aria-label={tr("share")}
  title={tr("share")}
>
  <span aria-hidden="true">↗</span>
  <span class="hidden text-[12px] font-medium sm:inline">{tr("share")}</span>
</button>
