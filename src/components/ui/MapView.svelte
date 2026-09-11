<script>
import { onMount, onDestroy } from "svelte";
import L from "leaflet";

let { pts = [], fit = true, fitMax = 10, focus = null, onPick = null, class: cls = "h-64 w-full rounded-xl" } = $props();
let el;
let map;
let icons = [];

/** Bigger icons when zoomed out, smaller when zoomed in — capped so they don't overlap. */
function zoomFactor(z) {
  return Math.max(0.8, Math.min(1.6, 1 + (8 - z) * 0.12));
}

onMount(() => {
  if (!el) return;
  map = L.map(el, { zoomControl: true, attributionControl: true }).setView([4.1, 109.2], 5);
  const key = import.meta.env.VITE_CARTO_KEY;
  L.tileLayer(
    `https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png${key ? `?key=${key}` : ""}`,
    {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    },
  ).addTo(map);
  map.on("zoomend", drawIcons);
  drawIcons();
  fitView();
  return () => { if (map) { map.remove(); map = null; } };
});
onDestroy(() => { if (map) { map.remove(); map = null; } });

function drawIcons() {
  if (!map) return;
  for (const i of icons) map.removeLayer(i);
  icons = [];
  const zf = zoomFactor(map.getZoom());
  for (const p of pts) {
    const d = Math.round((p.size || 12) * zf);
    const col = p.color || "#c14a1f";
    const pulse = p.ripple ? `<span class="alam-pulse" style="border:2px solid ${col}"></span>` : "";
    const label = p.emoji
      ? `<span style="font-size:${Math.max(12, d * 0.85)}px;line-height:1">${p.emoji}</span>`
      : `<span style="font-size:${Math.max(9, d * 0.5)}px;font-weight:700;color:#fff">${p.num ?? ""}</span>`;
    const icon = L.divIcon({
      className: "alam-pin",
      html: `<div style="position:relative;width:${d}px;height:${d}px;border-radius:50%;background:${col};border:2px solid #fff;box-shadow:0 0 0 ${Math.round(d * 0.18)}px ${col}33, 0 2px 6px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center">${label}${pulse}</div>`,
      iconSize: [d, d],
      iconAnchor: [d / 2, d / 2],
    });
    const m = L.marker([p.lat, p.lon], { icon }).addTo(map);
    if (p.html || p.title) m.bindPopup(p.html || p.title, { maxWidth: 260 });
    if (onPick && p.id) m.on("click", () => onPick(p.id));
    icons.push(m);
  }
}

function fitView() {
  if (!map) return;
  if (focus) { map.setView([focus.lat, focus.lon], focus.zoom ?? 11); return; }
  if (fit && pts.length) map.fitBounds(L.latLngBounds(pts.map((p) => [p.lat, p.lon])).pad(0.25), { maxZoom: fitMax });
}

$effect(() => {
  if (!map) return;
  void pts;
  drawIcons();
  fitView();
});
</script>

<div class="relative">
  <div bind:this={el} class={cls} style="z-index:0" aria-label="Map"></div>
  <button
    class="absolute right-2 top-2 z-[400] grid size-8 place-items-center rounded-lg border border-line bg-panel/90 text-[15px] shadow"
    onclick={() => { if (map && pts.length) map.fitBounds(L.latLngBounds(pts.map((p) => [p.lat, p.lon])).pad(0.25), { maxZoom: fitMax }); }}
    aria-label="Reset view"
    title="Reset view"
  >⤢</button>
</div>
