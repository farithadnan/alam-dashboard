  <script>
    import { tr } from "../../lib/i18n.svelte.js";
    import { shareCard, shareText, shareCaption, shareIntent } from "../../lib/sharecard.js";

    /** `payload` comes from lib/share.js so every share entry point is identical. */
    let { payload, textOnly = false, class: cls = "" } = $props();
    let open = $state(false);
    const msg = $derived(textOnly ? payload?.text || shareCaption(payload) : shareCaption(payload));
    const items = $derived([
      { label: "WhatsApp", href: shareIntent("wa", msg) },
      { label: "X (Twitter)", href: shareIntent("x", msg) },
      { label: "Facebook", href: shareIntent("fb", msg) },
      { label: "Telegram", href: shareIntent("t", msg) },
    ]);
  </script>

  <div class="relative inline-flex">
    <button
      class="iconbtn shrink-0 gap-1.5 {cls}"
      onclick={() => (open = !open)}
      aria-label={tr("share")}
      title={tr("share")}
      aria-haspopup="menu"
      aria-expanded={open}
    >
      <span aria-hidden="true">↗</span>
      <span class="hidden text-[12px] font-medium sm:inline">{tr("share")}</span>
    </button>

    {#if open}
      <button class="fixed inset-0 z-40 cursor-default" onclick={() => (open = false)} aria-label="Close share menu"></button>
      <div class="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-line bg-panel p-1 text-[13px] shadow-xl" role="menu">
        <button class="shareitem" role="menuitem" onclick={() => { open = false; void (textOnly ? shareText(payload) : shareCard(payload)); }}>
          <span aria-hidden="true">🖼</span>{tr("shareCardBtn")}
        </button>
        <a class="shareitem" role="menuitem" href="https://wa.me/?text={encodeURIComponent(msg)}" target="_blank" rel="noopener" onclick={() => (open = false)}>
          <span aria-hidden="true">💬</span>WhatsApp
        </a>
        <a class="shareitem" role="menuitem" href={items[1].href} target="_blank" rel="noopener" onclick={() => (open = false)}>
          <span aria-hidden="true">𝕏</span>X (Twitter)
        </a>
        <a class="shareitem" role="menuitem" href={items[2].href} target="_blank" rel="noopener" onclick={() => (open = false)}>
          <span aria-hidden="true">📘</span>Facebook
        </a>
        <a class="shareitem" role="menuitem" href={items[3].href} target="_blank" rel="noopener" onclick={() => (open = false)}>
          <span aria-hidden="true">✈️</span>Telegram
        </a>
        <button class="shareitem" role="menuitem" onclick={() => { open = false; void navigator.clipboard?.writeText(msg).catch(() => {}); }}>
          <span aria-hidden="true">📋</span>{tr("copyText")}
        </button>
      </div>
    {/if}
  </div>

  <style>
    .shareitem { display: flex; align-items: center; gap: 0.5rem; width: 100%; border-radius: 0.5rem; padding: 0.45rem 0.6rem; text-align: left; cursor: pointer; }
    .shareitem:hover { background: var(--color-line); }
  </style>
