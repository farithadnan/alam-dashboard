<script>
  import { ICONS } from "../../lib/icons.js";

  /** Draws any icon in lib/icons.js; the geometry lives there, not here. */
  let { name = "", size = 18, class: cls = "" } = $props();

  const shapes = $derived(ICONS[name] ?? []);
</script>

<svg class={cls} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  {#each shapes as shape, i (i)}
    {#if shape.path}<path d={shape.path} />{:else if shape.circle}<circle cx={shape.circle[0]} cy={shape.circle[1]} r={shape.circle[2]} />{/if}
  {/each}
</svg>
