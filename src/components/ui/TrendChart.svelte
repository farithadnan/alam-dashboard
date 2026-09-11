<script>
let { series = [], color = "#c14a1f", height = 160, ariaLabel = "Trend" } = $props();

// Fixed viewBox with real margins so axis labels never overlap the plot.
const W = 640;
const L = 40;
const R = 12;
const T = 14;
const B = 26;
const innerW = W - L - R;
const innerH = height - T - B;

const values = $derived(series.map((s) => s.v));
const min = $derived(values.length ? Math.min(...values) : 0);
const max = $derived(values.length ? Math.max(...values) : 1);
const span = $derived(max - min || 1);

const px = (i) => L + (i / Math.max(1, values.length - 1)) * innerW;
const py = (v) => T + (1 - (v - min) / span) * innerH;

const line = $derived(values.map((v, i) => `${i ? "L" : "M"}${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(" "));
const area = $derived(line ? `${line} L ${(L + innerW).toFixed(1)} ${T + innerH} L ${L} ${T + innerH} Z` : "");
const yTicks = $derived([max, Math.round((max + min) / 2), min]);
const hhmm = (t) => (/T\d\d:/.test(t || "") ? String(t).slice(11, 16) : "");

/** Up to 5 evenly-spaced x labels (hour marks), never crowding the y axis. */
const xTicks = $derived(
  values.length < 2
    ? []
    : Array.from({ length: Math.min(5, values.length) }, (_, k) => {
        const i = Math.round((k / (Math.min(5, values.length) - 1 || 1)) * (values.length - 1));
        return { i, x: px(i), label: hhmm(series[i]?.t) };
      }),
);
</script>

{#if values.length >= 2}
  <svg viewBox="0 0 {W} {height}" class="mt-1 block w-full" role="img" aria-label={ariaLabel}>
    <!-- horizontal gridlines + y labels -->
    {#each yTicks as t, k (k)}
      <line x1={L} x2={L + innerW} y1={py(t)} y2={py(t)} stroke="currentColor" stroke-opacity="0.14" stroke-width="1" />
      <text x={L - 6} y={py(t) + 3.5} text-anchor="end" font-size="10.5" fill="currentColor" fill-opacity="0.55">{t}</text>
    {/each}
    <path d={area} fill={color} opacity="0.12" />
    <path d={line} fill="none" stroke={color} stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
    <!-- x axis -->
    <line x1={L} x2={L + innerW} y1={T + innerH} y2={T + innerH} stroke="currentColor" stroke-opacity="0.2" stroke-width="1" />
    {#each xTicks as t (t.i)}
      <text x={t.x} y={height - 8} text-anchor="middle" font-size="10.5" fill="currentColor" fill-opacity="0.55">{t.label}</text>
    {/each}
  </svg>
{/if}
