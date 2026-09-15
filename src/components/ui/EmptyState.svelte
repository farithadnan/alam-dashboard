  <script>
    /** A calm, centered empty state — used wherever a list/map has truly no data after
     * loading. Skeleton loaders are for loading only; this replaces "nothing here".
     * `action` = { label, onClick } (button) or { label, href } (link). */
    let { icon = "", title = "", desc = "", action = null } = $props();
  </script>

  <div class="mx-auto flex min-h-[190px] w-full max-w-[560px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-panel/40 px-6 py-8 text-center">
    {#if icon}<div class="text-[36px] leading-none" aria-hidden="true">{icon}</div>{/if}
    {#if title}<div class="text-[16px] font-semibold">{title}</div>{/if}
    {#if desc}<p class="mx-auto max-w-[46ch] text-[13px] text-muted">{desc}</p>{/if}
    {#if action}
      {#if action.href}
        <a class="ghostbtn mt-1" href={action.href} onclick={action.onClick}>{action.label}</a>
      {:else}
        <button class="ghostbtn mt-1" onclick={action.onClick}>{action.label}</button>
      {/if}
    {/if}
  </div>
