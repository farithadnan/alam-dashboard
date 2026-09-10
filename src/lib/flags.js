export const STATES = [
  { id: 1, name: "Johor", lat: 1.55, lon: 103.7 },
  { id: 2, name: "Kedah", lat: 5.9, lon: 100.4 },
  { id: 3, name: "Kelantan", lat: 5.3, lon: 102.0 },
  { id: 4, name: "Melaka", lat: 2.3, lon: 102.2 },
  { id: 5, name: "Negeri Sembilan", lat: 2.7, lon: 102.2 },
  { id: 6, name: "Pahang", lat: 3.8, lon: 102.3 },
  { id: 7, name: "Pulau Pinang", lat: 5.4, lon: 100.3 },
  { id: 8, name: "Perak", lat: 4.6, lon: 101.0 },
  { id: 9, name: "Perlis", lat: 6.4, lon: 100.2 },
  { id: 10, name: "Selangor", lat: 3.1, lon: 101.5 },
  { id: 11, name: "Terengganu", lat: 4.8, lon: 103.0 },
  { id: 12, name: "Sabah", lat: 5.9, lon: 117.0 },
  { id: 13, name: "Sarawak", lat: 1.8, lon: 111.0 },
  { id: 14, name: "WP Kuala Lumpur", lat: 3.14, lon: 101.69 },
  { id: 15, name: "WP Labuan", lat: 5.3, lon: 115.2 },
  { id: 16, name: "WP Putrajaya", lat: 2.93, lon: 101.7 },
];

export const BANDS = [
  { from: 0, label: "Good", color: "#43a047" },
  { from: 51, label: "Moderate", color: "#f4a922" },
  { from: 101, label: "Unhealthy", color: "#e05d2b" },
  { from: 201, label: "Very Unhealthy", color: "#d3342f" },
  { from: 301, label: "Hazardous", color: "#8e24aa" },
];
export const bandColor = (v) => (BANDS.filter((b) => v >= b.from).slice(-1)[0]?.color ?? BANDS[0].color);
export const bandLabel = (v) => (BANDS.filter((b) => v >= b.from).slice(-1)[0]?.label ?? "Good");

/** WCAG-compliant text colours (>=4.5 on cream); vivid band colours are for dots/borders. */
export const NUM = { Good: "#2e7d32", Moderate: "#8f5c00", Unhealthy: "#b3491a", "Very Unhealthy": "#a51612", Hazardous: "#6a1b9a" };
export const numColor = (l) => NUM[l] || l;

export const MAG_BORDER = (m) => (m >= 6 ? "#d3342f" : m >= 5 ? "#e05d2b" : "#8a8277");
export const MAG_TEXT = { Light: "#6b6258", Moderate: "#b3491a", Strong: "#a51612" };
export const magWord = (m) => (m >= 6 ? "Strong" : m >= 5 ? "Moderate" : "Light");
export const magText = (w) => MAG_TEXT[w] || w;

export const WMO = {
  "0": ["☀️", "Clear"], "1": ["🌤️", "Mostly clear"], "2": ["⛅", "Partly cloudy"], "3": ["☁️", "Overcast"],
  "45": ["🌫️", "Fog"], "48": ["🌫️", "Fog"],
  "51": ["🌦️", "Drizzle"], "53": ["🌦️", "Drizzle"], "55": ["🌦️", "Drizzle"],
  "61": ["🌧️", "Rain"], "63": ["🌧️", "Rain"], "65": ["🌧️", "Rain"],
  "80": ["🌧️", "Showers"], "81": ["🌧️", "Showers"], "82": ["🌧️", "Showers"],
  "71": ["❄️", "Snow"], "73": ["❄️", "Snow"], "75": ["❄️", "Snow"],
  "95": ["⛈️", "Thunderstorm"], "96": ["⛈️", "Thunderstorm"], "99": ["⛈️", "Thunderstorm"],
};
export const wmo = (code) => WMO[String(code)] || ["🌡️", "—"];
export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Generic group-by returning [{ key, items }] preserving insertion order. */
export const groupBy = (arr, keyFn) => {
  const m = new Map();
  for (const x of arr) {
    const k = keyFn(x);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(x);
  }
  return [...m.entries()].map(([key, items]) => ({ key, items }));
};

export function timeAgo(iso) {  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}
export const cityOf = (s) => (s || "").split(",")[0];
export const stateOf = (o) => o.meta?.state || (o.stationName || "").split(",").pop()?.trim() || "";
export const stateName = (id) => STATES.find((s) => s.id === id)?.name;
export const distKm = (aLat, aLon, bLat, bLon) => {
  const R = 6371, dLa = ((bLat - aLat) * Math.PI) / 180, dLo = ((bLon - aLon) * Math.PI) / 180;
  const x = Math.sin(dLa / 2) ** 2 + Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLo / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};
export const nearestState = (lat, lon) => {
  let best = null, bestD = Infinity;
  for (const s of STATES) { const d = distKm(lat, lon, s.lat, s.lon); if (d < bestD) { bestD = d; best = s; } }
  return best ? { name: best.name, km: Math.round(bestD) } : null;
};

/* Surface a bbox-normalized SVG line (used by the shared Sparkline component). */
export function sparkline(values, color, width = 120, height = 26) {
  if (!values || values.length < 2) return null;
  const P = 2, mn = Math.min(...values), mx = Math.max(...values);
  const range = (mx - mn) || 1, lo = mn - range * 0.15, hi = mx + range * 0.15;
  const pts = values.map((v, i) => [P + (i / (values.length - 1)) * (width - 2 * P), height - P - ((v - lo) / (hi - lo)) * (height - 2 * P)]);
  let d = "";
  pts.forEach((p, i) => { d += (i ? " L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1); });
  const last = pts[pts.length - 1];
  return {
    d,
    area: `${d} L ${last[0].toFixed(1)},${height - P} L ${pts[0][0].toFixed(1)},${height - P} Z`,
    color,
    last: values[values.length - 1],
    width,
    height,
  };
}

/* MET warning severity (FIRST/SECOND/THIRD category -> 1/2/3) + presentation. */
export const severityWord = (s) => (s >= 3 ? "High" : s === 2 ? "Watch" : "Advisory");
export const severityColor = (s) => (s >= 3 ? "#a51612" : s === 2 ? "#b3491a" : "#8f5c00");

const REGION_KEYS = ["Indonesia", "Philippines", "Malaysia", "Singapore", "Brunei", "Thailand", "Vietnam", "Taiwan", "Papua New Guinea", "Australia", "New Zealand", "Vanuatu", "Fiji", "Tonga", "Solomon Islands", "Sri Lanka", "India", "Myanmar"];
export function regionOf(place) {
  const s = place || "", tail = (s.split(",").pop() || "").trim();
  if (tail && /[A-Za-z]/.test(tail)) return tail;
  for (const c of REGION_KEYS) if (s.includes(c)) return c;
  return "Other";
}
const COMPASS = { NNW:"north-northwest", NW:"northwest", WNW:"west-northwest", N:"north", NNE:"north-northeast", NE:"northeast", ENE:"east-northeast", E:"east", ESE:"east-southeast", SE:"southeast", SSE:"south-southeast", S:"south", SSW:"south-southwest", SW:"southwest", WSW:"west-southwest", W:"west" };
export function friendlyLoc(place) {
  let s = place || "";
  for (const [a, w] of Object.entries(COMPASS)) s = s.replace(new RegExp(`\\b${a}\\b`), w);
  return s.split(",")[0];
}

/** Approximate moon phase from date (simple synodic-month calc). */
export function moonPhase(date = new Date()) {
  const synodic = 29.530588853;
  const ref = Date.UTC(2000, 0, 6, 18, 14);
  const days = (date.getTime() - ref) / 86400000;
  const age = ((days % synodic) + synodic) % synodic;
  const i = Math.round((age / synodic) * 8) % 8;
  const names = ["New moon", "Waxing crescent", "First quarter", "Waxing gibbous", "Full moon", "Waning gibbous", "Last quarter", "Waning crescent"];
  const emojis = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];
  return { name: names[i], emoji: emojis[i], age: Math.round(age) };
}
