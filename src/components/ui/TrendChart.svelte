<script>
let { values = [], times = [], color = "#c14a1f", height = 130, ariaLabel = "Trend" } = $props();

const W = 600;
const PAD = 10;
const min = $derived(values.length ? Math.min(...values) : 0);
const max = $derived(values.length ? Math.max(...values) : 1);
const span = $derived(max - min || 1);

const pts = $derived(
  values.map((v, i) => [
    (i / Math.max(1, values.length - 1)) * W,
    height - PAD - ((v - min) / span) * (height - 2 * PAD),
  ]),
);
const line = $derived(pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" "));
const area = $derived(line ? `${line} L ${W} ${height} L 0 ${height} Z` : "");
const hhmm = (t) => (t ? String(t).slice(11, 16) : "");
</script>

{#if values.length >= 2}
  <div class="relative">
    <svg viewBox="0 0 {W} {height}" class="block w-full" style="height:{height}px" role="img" aria-label={ariaLabel} preserveAspectRatio="none">
      <path d={area} fill={color} opacity="0.13" />
      <path d={line} fill="none" stroke={color} stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />
    </svg>
    <span class="absolute left-1 top-0 font-mono text-[10.5px] text-muted">{max}</span>
    <span class="absolute bottom-0 left-1 font-mono text-[10.5px] text-muted">{min}</span>
    {#if times.length >= 2}
      <div class="flex justify-between font-mono text-[10.5px] text-muted">
        <span>{hhmm(times[0])}</span>
        <span>{hhmm(times[times.length - 1])}</span>
      </div>
    {/if}
  </div>
{/if}
