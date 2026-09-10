<script>
let { title = "", startOpen = false, children } = $props();
let open = $state(startOpen);
</script>

<div class="border-b border-line">
  <button class="flex w-full items-center justify-between gap-2 py-2.5 text-left" onclick={() => (open = !open)} aria-expanded={open}>
    <span class="text-[14.5px] font-semibold">{title}</span>
    <span class="font-mono text-[16px] text-muted">{open ? "−" : "+"}</span>
  </button>
  {#if open}
    <div class="pb-2">{@render children()}</div>
  {/if}
</div>
