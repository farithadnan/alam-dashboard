<script>
import { onMount, onDestroy } from "svelte";
import L from "leaflet";

let { pts = [], fit = true, class: cls = "h-64 w-full rounded-xl" } = $props(); // pts: [{lat, lon, title, color, size}]
let el;
let map;
let icons = [];

onMount(() => {
  if (!el) return;
  map = L.map(el, { zoomControl: true, attributionControl: true }).setView([4.1, 109.2], 5);
  const key = import.meta.env.VITE_CARTO_KEY;
  L.tileLayer(
    `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png${key ? `?key=${key}` : ""}`,
    {
      attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
      subdomains: "abcd",
      maxZoom: 19,
    },
  ).addTo(map);
  draw();
  return () => { if (map) { map.remove(); map = null; } };
});
onDestroy(() => { if (map) { map.remove(); map = null; } });

function draw() {
  if (!map || !pts.length) return;
  for (const i of icons) if (map) map.removeLayer(i);
  icons = [];
  for (const p of pts) {
    const d = p.size || 10;
    const col = p.color || "#c14a1f";
    const pulse = p.ripple ? `<span class="alam-pulse" style="border:2px solid ${col}"></span>` : "";
    const icon = L.divIcon({
      className: "alam-pin",
      html: `<div style="position:relative;width:${d}px;height:${d}px;border-radius:50%;background:${col};border:2px solid #fff;box-shadow:0 0 0 4px ${col}33, 0 2px 6px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;color:#fff;font-size:${Math.max(8, d * 0.55)}px;font-weight:700">${p.num ?? ""}${pulse}</div>`,
      iconSize: [d, d],
      iconAnchor: [d / 2, d / 2],
    });
    const m = L.marker([p.lat, p.lon], { icon }).addTo(map);
    if (p.title) m.bindPopup(p.title);
    icons.push(m);
  }
  if (fit && pts.length) {
    map.fitBounds(L.latLngBounds(pts.map((p) => [p.lat, p.lon])).pad(0.25));
  }
}
$effect(() => {
  if (map) draw();
});
</script>

<div bind:this={el} class={cls} style="z-index:0" aria-label="Map"></div>
