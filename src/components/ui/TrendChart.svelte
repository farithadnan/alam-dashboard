<script>
let { series = [], color = "#c14a1f", height = 170, ariaLabel = "Trend", unit = "", mode = "auto" } = $props();

// Fixed viewBox with real margins so axis labels never overlap the plot.
const W = 640;
const L = 40;
const R = 14;
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

/** Explicit range wins; "auto" falls back to the span (>48h = daily labels). */
const daily = $derived.by(() => {
  if (mode === "days") return true;
  if (mode === "hours") return false;
  if (series.length < 2) return false;
  const a = Date.parse(series[0]?.t ?? "");
  const b = Date.parse(series[series.length - 1]?.t ?? "");
  return Number.isFinite(a) && Number.isFinite(b) ? b - a > 48 * 3_600_000 : false;
});
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function tickLabel(t) {
  if (!t) return "";
  const d = new Date(String(t).replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return String(t).slice(11, 16);
  return daily ? `${DAYS[d.getDay()]} ${d.getDate()}` : String(t).slice(11, 16);
}

/** Up to 5 evenly-spaced x ticks. */
const xTicks = $derived(
  values.length < 2
    ? []
    : Array.from({ length: Math.min(5, values.length) }, (_, k) => {
        const i = Math.round((k / (Math.min(5, values.length) - 1 || 1)) * (values.length - 1));
        return { i, x: px(i), label: tickLabel(series[i]?.t) };
      }),
);

// --- hover / touch readout -------------------------------------------------
let host;
let hover = $state(null);
const point = $derived(hover != null ? { v: values[hover], t: series[hover]?.t, x: px(hover), y: py(values[hover]) } : null);

function onMove(e) {
  if (!host || !values.length) return;
  const rect = host.getBoundingClientRect();
  const vx = ((e.clientX - rect.left) / rect.width) * W;
  const i = Math.round(((vx - L) / innerW) * (values.length - 1));
  hover = Math.max(0, Math.min(values.length - 1, i));
}
</script>

{#if values.length >= 2}
  <div
    class="relative mt-1"
    bind:this={host}
    role="img"
    aria-label={ariaLabel}
    onpointermove={onMove}
    onpointerdown={onMove}
    onpointerleave={() => (hover = null)}
  >
    <svg viewBox="0 0 {W} {height}" class="block w-full touch-pan-y select-none">
      {#each yTicks as t, k (k)}
        <line x1={L} x2={L + innerW} y1={py(t)} y2={py(t)} stroke="currentColor" stroke-opacity="0.14" stroke-width="1" />
        <text x={L - 6} y={py(t) + 3.5} text-anchor="end" font-size="10.5" fill="currentColor" fill-opacity="0.55">{t}</text>
      {/each}
      <path d={area} fill={color} opacity="0.12" />
      <path d={line} fill="none" stroke={color} stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
      <line x1={L} x2={L + innerW} y1={T + innerH} y2={T + innerH} stroke="currentColor" stroke-opacity="0.2" stroke-width="1" />
      {#each xTicks as t (t.i)}
        <text x={t.x} y={height - 8} text-anchor="middle" font-size="10.5" fill="currentColor" fill-opacity="0.55">{t.label}</text>
      {/each}
      {#if point}
        <line x1={point.x} x2={point.x} y1={T} y2={T + innerH} stroke={color} stroke-opacity="0.45" stroke-width="1" />
        <circle cx={point.x} cy={point.y} r="4.5" fill={color} stroke="#fff" stroke-width="1.5" />
      {/if}
    </svg>

    {#if point}
      <div
        class="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg border border-line bg-panel px-2 py-1 text-center shadow-lg"
        style="left:{Math.min(88, Math.max(12, (point.x / W) * 100))}%"
      >
        <div class="font-mono text-[14px] font-bold" style="color:{color}">{point.v}{unit}</div>
        <div class="whitespace-nowrap text-[10.5px] text-muted">{tickLabel(point.t)}</div>
      </div>
    {/if}
  </div>
{/if}
