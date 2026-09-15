  <script>
    /** Compact hazard summary. Mobile: a bordered list. Wider screens: a tile grid so the
     * row fills the width without a hollow label->value gap. Same items, same taps. */
    let { items = [], onTap = () => {} } = $props();
  </script>

  {#if items.length}
    <!-- Mobile: compact bordered list (value right-aligned, no gap on a narrow column). -->
    <ul class="mt-1 list-none m-0 overflow-hidden rounded-xl border border-line p-0 sm:hidden">
      {#each items as it (it.key)}
        <li class="border-b border-line last:border-0">
          <button class="flex w-full min-h-[46px] items-center gap-3 px-3 text-left" onclick={() => onTap(it.key)}>
            <span class="shrink-0 text-[18px] leading-none" aria-hidden="true">{it.icon}</span>
            <span class="min-w-0 flex-1 text-[14px] font-medium">{it.label}</span>
            {#if it.value != null && it.value !== ""}
              <span class="shrink-0 font-mono text-[15px] font-bold" style="color:{it.color || 'var(--color-fg)'}">{it.value}</span>
            {/if}
            <span class="shrink-0 text-muted" aria-hidden="true">›</span>
          </button>
        </li>
      {/each}
    </ul>

    <!-- Desktop / tablet: tile grid (value over label, chevron top-right). -->
    <div class="mt-1 hidden grid-cols-1 gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-4">
      {#each items as it (it.key)}
        <button class="flex min-h-[76px] flex-col justify-between gap-1.5 rounded-xl border border-line px-3 py-3 text-left transition hover:border-accent" onclick={() => onTap(it.key)}>
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
  {/if}
