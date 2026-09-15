  <script>
    /** A compact, tappable hazard summary. One row on mobile, tiles on wider screens so
     * the row never leaves a hollow gap: value sits over the label, chevron top-right. */
    let { items = [], onTap = () => {} } = $props();
  </script>

  <div class="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
    {#each items as it (it.key)}
      <button class="flex min-h-[76px] flex-col justify-between gap-1.5 rounded-xl border border-line px-3 py-3 text-left transition hover:border-accent" onclick={() => onTap(it.key)} role="listitem">
        <span class="flex w-full items-center justify-between">
          <span class="text-[17px] leading-none" aria-hidden="true">{it.icon}</span>
          <span class="text-muted" aria-hidden="true">›</span>
        </span>
        <span class="min-w-0">
          {#if it.value != null && it.value !== ""}
            <span class="block truncate font-mono text-[19px] font-bold leading-none" style="color:{it.color || 'var(--color-fg)'}">{it.value}</span>
          {/if}
          <span class="mt-1 block truncate text-[12.5px] font-medium text-muted">{it.label}</span>
        </span>
      </button>
    {/each}
  </div>
