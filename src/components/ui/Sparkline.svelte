<script>
import { sparkline } from "../../lib/flags.js";

let { values = [], color = "#8a8277", width = 120, height = 26, strokeWidth = 1.5, class: cls = "", ariaLabel = "trend" } = $props();
const data = $derived(sparkline(values, color, width, height));
</script>

{#if data}
  <svg class={cls} width={data.width} height={data.height} viewBox="0 0 {data.width} {data.height}" preserveAspectRatio="none" role="img" aria-label={ariaLabel}>
    <path d={data.area} fill={data.color} opacity="0.12" />
    <path d={data.d} fill="none" stroke={data.color} stroke-width={strokeWidth} stroke-linecap="round" stroke-linejoin="round" />
  </svg>
{:else}
  <span style="width:{width}px;height:{height}px;display:inline-block"></span>
{/if}
