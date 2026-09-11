<script>
let { history = [], color = "#c14a1f" } = $props();

const rows = $derived(
  history
    .slice()
    .sort((a, b) => a.t.localeCompare(b.t))
    .map((r) => ({ t: String(r.t).slice(11, 16), v: r.v })),
);
</script>

{#if rows.length}
  <div class="mt-2 grid grid-cols-4 gap-1 sm:grid-cols-6">
    {#each rows as r (r.t)}
      <div class="rounded-lg border border-line px-1.5 py-1 text-center">
        <div class="caption font-mono text-[10px]">{r.t}</div>
        <div class="font-mono text-[14px] font-semibold" style="color:{color}">{r.v}</div>
      </div>
    {/each}
  </div>
{/if}
