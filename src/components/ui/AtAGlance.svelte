  <script>
    /** A compact, tappable list of hazard summaries: icon + label + value per row. */
    let { items = [], onTap = () => {} } = $props();
  </script>

  <ul class="mt-1 list-none m-0 max-w-[520px] overflow-hidden rounded-xl border border-line p-0">
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
