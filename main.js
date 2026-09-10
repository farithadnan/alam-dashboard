const API_BASE = "./api";

const BANDS = [
  { from: 0,   label: "Good",           color: "#43a047" },
  { from: 51,  label: "Moderate",       color: "#f4a922" },
  { from: 101, label: "Unhealthy",      color: "#e05d2b" },
  { from: 201, label: "Very Unhealthy", color: "#d3342f" },
  { from: 301, label: "Hazardous",      color: "#8e24aa" },
];
function bandColor(v) { let c = BANDS[0].color; for (const b of BANDS) if (v >= b.from) c = b.color; return c; }

function magColor(m) { return m >= 6 ? "#d3342f" : m >= 5 ? "#e05d2b" : "#8a8277"; }
function magWord(m) { return m >= 6 ? "Strong" : m >= 5 ? "Moderate" : "Light"; }

/* WCAG-compliant text colours for numbers/words (vivid band colours stay for dots/borders only) */
const NUM = { "Good": "#2e7d32", "Moderate": "#8f5c00", "Unhealthy": "#b3491a", "Very Unhealthy": "#a51612", "Hazardous": "#6a1b9a" };
function numColor(label) { return NUM[label] || label; }
const MAG_TEXT = { "Light": "#6b6258", "Moderate": "#b3491a", "Strong": "#a51612" };
function magText(word) { return MAG_TEXT[word] || word; }

let nowAll = [];

const $ = (id) => document.getElementById(id);
const list = $("stations");
const legend = $("legend");
const ago = $("ago");
const worst = $("worst");
const detail = $("detail");
const hago = $("hago");
const wago = $("wago");

let selected = null;
let hours = 24;

/* ---- top-bar nav: one view at a time ---- */
const nav = $("nav");
nav.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-view]");
  if (!btn) return;
  switchView(btn.dataset.view);
  const v = btn.dataset.view;
  if (v === "hazards" && !$("quakes").children.length) loadHazards();
  if (v === "weather" && !$("weather").children.length) loadWeather();
});
function switchView(name) {
  nav.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.view === name));
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("on", v.id === "view-" + name));
}

/* ---- air quality ---- */
function renderLegend() {
  legend.innerHTML = "";
  for (const b of BANDS) {
    const li = document.createElement("li");
    const sw = document.createElement("span");
    sw.className = "sw";
    sw.style.background = b.color;
    li.append(sw, document.createTextNode(b.label));
    legend.append(li);
  }
}

function render(current) {
  list.innerHTML = "";
  const rows = [...current].sort((a, b) => b.value - a.value);
  for (const r of rows) {
    const li = document.createElement("li");
    li.style.borderLeftColor = r.band.color;
    if (selected === r.station) li.classList.add("sel");
    const grow = document.createElement("div");
    grow.className = "grow";
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = labelOf(r);
    const band = document.createElement("div");
    band.className = "band";
    band.textContent = r.band.label + " · " + r.band.advice;
    grow.append(name, band);
    const val = document.createElement("div");
    val.className = "val";
    val.textContent = String(r.value);
    val.style.color = numColor(r.band.label);
    const caret = document.createElement("span");
    caret.className = "caret";
    caret.textContent = "›";
    li.append(grow, val, caret);
    li.addEventListener("click", () => selectStation(r));
    list.append(li);
  }
  const top = rows[0];
  if (top) worst.innerHTML = `Worst now: <b>${labelOf(top)}</b> at <b style="color:${numColor(top.band.label)}">${top.value}</b> (${top.band.label}). ${top.band.advice}`;
}
function labelOf(r) { return (r.stationName || r.station).split(",")[0]; }

async function selectStation(r) {
  selected = r.station;
  document.querySelectorAll("#stations li").forEach((li) =>
    li.classList.toggle("sel", li.querySelector(".name")?.textContent === labelOf(r)),
  );
  detail.hidden = false;
  $("dname").textContent = r.stationName || r.station;
  $("dval").textContent = String(r.value);
  $("dval").style.color = r.band.color;
  const rows = await loadHistory(r.station, hours);
  drawChart(rows);
}
function closeDetail() { selected = null; detail.hidden = true; document.querySelectorAll("#stations li").forEach((li) => li.classList.remove("sel")); }

$("seg").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-hours]");
  if (!b) return;
  hours = Number(b.dataset.hours);
  $("seg").querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
  if (selected) loadHistory(selected, hours).then(drawChart);
});

async function loadHistory(station, h) {
  try {
    const res = await fetch(`${API_BASE}/history?source=doe-eqms&station=${encodeURIComponent(station)}&hours=${h}`);
    if (!res.ok) return [];
    return (await res.json()).history || [];
  } catch { return []; }
}

function drawChart(rows) {
  const svg = $("chart");
  const W = 640, H = 100, PAD = 8;
  if (rows.length < 2) { svg.innerHTML = `<text x="${W/2}" y="50" text-anchor="middle" fill="#8a8277" font-size="12">not enough trend data yet</text>`; return; }
  const vals = rows.map((r) => r.value);
  const last = vals[vals.length - 1];
  let mn = Math.min(...vals), mx = Math.max(...vals);
  if (mx - mn < 20) { mn -= 10; mx += 10; }
  const span = mx - mn || 1;
  const pts = rows.map((r, i) => {
    const x = PAD + (i / (rows.length - 1)) * (W - 2 * PAD);
    return [x, H - PAD - ((r.value - mn) / span) * (H - 2 * PAD)];
  });
  let d = "";
  pts.forEach((p, i) => { d += (i ? " L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1); });
  const color = bandColor(last);
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.innerHTML = [
    `<path d="${d} L ${pts[pts.length - 1][0].toFixed(1)},${H - PAD} L ${pts[0][0].toFixed(1)},${H - PAD} Z" fill="${color}" opacity="0.12"/>`,
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    `<text x="${W - PAD}" y="${PAD + 12}" text-anchor="end" fill="${color}" font-size="13" font-weight="700">${last}</text>`,
  ].join("");
  $("dmeta").textContent = `Now ${last}, ${hours >= 168 ? "7d" : "24h"} ago ${rows[0].value}, peak ${mx}.`;
}

/* ---- hazards: quakes grouped by region, plain language ---- */
const COMPASS = { NNW:"north-northwest", NW:"northwest", WNW:"west-northwest", N:"north", NNE:"north-northeast", NE:"northeast", ENE:"east-northeast", E:"east", ESE:"east-southeast", SE:"southeast", SSE:"south-southeast", S:"south", SSW:"south-southwest", SW:"southwest", WSW:"west-southwest", W:"west" };
const REGION_KEYS = ["Indonesia","Philippines","Malaysia","Singapore","Brunei","Thailand","Vietnam","Taiwan","Papua New Guinea","Australia","New Zealand","Vanuatu","Fiji","Tonga","Solomon Islands","Sri Lanka","India","Myanmar"];

function friendlyLoc(p) {
  let s = p || "";
  for (const [abbr, word] of Object.entries(COMPASS)) s = s.replace(new RegExp(`\\b${abbr}\\b`), word);
  return s.split(",")[0]; // drop country, the group heading shows it
}
function regionOf(p) {
  const s = p || "";
  const tail = (s.split(",").pop() || "").trim();
  if (tail && /[A-Za-z]/.test(tail)) return tail;
  for (const c of REGION_KEYS) if (s.includes(c)) return c;
  return "Other";
}
function timeAgo(iso) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return `${Math.round(s / 86400)}d ago`;
}

function renderQuakes(quakes) {
  const root = $("quakes");
  root.innerHTML = "";
  if (!quakes.length) { root.innerHTML = '<p class="muted">No quakes at 4.5+ in the last week around the region.</p>'; return; }
  const byRegion = new Map();
  for (const q of quakes) {
    const k = regionOf(q.stationName);
    if (!byRegion.has(k)) byRegion.set(k, []);
    byRegion.get(k).push(q);
  }
  for (const [region, items] of byRegion) {
    const itemsSorted = [...items].sort((a, b) => b.magnitude - a.magnitude);
    const h = document.createElement("h3");
    h.className = "qh";
    h.textContent = region;
    root.append(h);
    const ul = document.createElement("ul");
    ul.className = "stations";
    for (const q of itemsSorted) {
      const li = document.createElement("li");
      li.style.cursor = "default";
      li.style.borderLeftColor = magColor(q.magnitude);
      const grow = document.createElement("div");
      grow.className = "grow";
      const name = document.createElement("div");
      name.className = "name";
      name.textContent = friendlyLoc(q.stationName) || q.stationName;
      const meta = document.createElement("div");
      meta.className = "band";
      meta.textContent = timeAgo(q.measuredAt);
      grow.append(name, meta);
      const word = document.createElement("span");
      word.className = "rword";
      word.textContent = magWord(q.magnitude);
      word.style.color = magText(magWord(q.magnitude));
      li.append(grow, word);
      ul.append(li);
    }
    root.append(ul);
  }
}
async function loadHazards() {
  try {
    const res = await fetch(`${API_BASE}/hazards`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const d = await res.json();
    renderQuakes(d.earthquakes || []);
    hago.textContent = new Date().toLocaleTimeString();
  } catch (e) { $("quakes").innerHTML = '<p class="muted">Hazards unavailable (' + e.message + ")</p>"; }
}

/* ---- weather + climate ---- */
function renderNow() {
  const card = $("nowcard");
  card.innerHTML = "";
  const w = nowAll.find((x) => x.station === fCity && x.kind === "weather");
  const a = nowAll.find((x) => x.station === fCity && x.kind === "aqi");
  if (!w) { card.textContent = "No current weather yet."; return; }
  const big = el("div", "now-temp", Math.round(w.value) + "°");
  const meta = el("div", "band", `${w.meta?.humidity ?? "–"}% humidity · wind ${w.meta?.wind ?? "–"} km/h · UV ${a?.meta?.uv ?? "–"}`);
  card.append(big, meta);
}

function renderClimate(climate) {
  const el = $("climate");
  if (!climate) { el.textContent = "No climate phase yet."; return; }
  const phase = climate.meta?.phase || "Neutral";
  const color = phase.includes("El Niño") ? "#d3342f" : phase.includes("La Niña") ? "#2563eb" : "#8a8277";
  const text = phase.includes("El Niño")
    ? "El Niño is active — the equatorial Pacific is running warmer than usual."
    : phase.includes("La Niña")
    ? "La Niña is active — the equatorial Pacific is running cooler than usual."
    : "Neither El Niño nor La Niña — the equatorial Pacific is near normal.";
  el.innerHTML = "";
  const b = document.createElement("b");
  b.textContent = phase;
  b.style.color = color;
  el.append(b, document.createTextNode(" — " + text));
}

/* ---- 7-day forecast (mobile-app style) ---- */
const WMO = {
  "0": ["☀️", "Clear"], "1": ["🌤️", "Mostly clear"], "2": ["⛅", "Partly cloudy"], "3": ["☁️", "Overcast"],
  "45": ["🌫️", "Fog"], "48": ["🌫️", "Fog"],
  "51": ["🌦️", "Drizzle"], "53": ["🌦️", "Drizzle"], "55": ["🌦️", "Drizzle"],
  "61": ["🌧️", "Rain"], "63": ["🌧️", "Rain"], "65": ["🌧️", "Rain"],
  "80": ["🌧️", "Showers"], "81": ["🌧️", "Showers"], "82": ["🌧️", "Showers"],
  "71": ["❄️", "Snow"], "73": ["❄️", "Snow"], "75": ["❄️", "Snow"],
  "95": ["⛈️", "Thunderstorm"], "96": ["⛈️", "Thunderstorm"], "99": ["⛈️", "Thunderstorm"],
};
function wmo(code) { return WMO[String(code)] || ["🌡️", "—"]; }
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
let fCity = null;
let lastForecast = [];

function el(tag, cls, text) { const n = document.createElement(tag); n.className = cls; if (text != null) n.textContent = text; return n; }

function buildCityPicker(cities) {
  if ($("fcity").children.length) return;
  const seg = $("fcity");
  for (const c of cities) {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.city = c;
    b.textContent = c === "johor-bahru" ? "Johor Bahru" : c.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
    if (!fCity) { fCity = c; b.classList.add("on"); }
    seg.append(b);
  }
  seg.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-city]");
    if (!btn) return;
    fCity = btn.dataset.city;
    seg.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === btn));
    renderNow();
    renderForecast(lastForecast);
  });
}

function renderForecast(rows) {
  lastForecast = rows;
  const ul = $("forecast");
  ul.innerHTML = "";
  const mine = rows.filter((r) => r.station === fCity).sort((a, b) => a.measuredAt.localeCompare(b.measuredAt));
  if (!mine.length) { ul.innerHTML = '<li class="muted">No forecast yet.</li>'; return; }
  const today = new Date().toISOString().slice(0, 10);
  for (const r of mine.slice(0, 7)) {
    const d = new Date(r.measuredAt);
    const dayName = r.measuredAt.slice(0, 10) === today ? "Today" : DAYS[d.getUTCDay()];
    const [icon, label] = wmo(r.meta?.code);
    const rain = r.meta?.precip;
    const li = document.createElement("li");
    li.append(
      el("span", "fday", dayName),
      el("span", "fcond", `${icon} ${label}`),
      el("span", "frain", rain != null && rain > 0 ? "☔ " + Math.round(rain) + "%" : ""),
    );
    const temps = document.createElement("span");
    temps.className = "ftemps";
    temps.append(
      el("span", "hi", Math.round(r.meta?.tmax ?? r.value) + "°"),
      el("span", "lo", Math.round(r.meta?.tmin ?? 0) + "°"),
    );
    li.append(temps);
    ul.append(li);
  }
}

async function loadWeather() {
  try {
    const [cur, fc, haz] = await Promise.all([
      fetch(`${API_BASE}/current?source=open-meteo`).then((r) => r.json()),
      fetch(`${API_BASE}/forecast?source=open-meteo`).then((r) => r.json()),
      fetch(`${API_BASE}/hazards`).then((r) => r.json()),
    ]);
    nowAll = cur.current || [];
    buildCityPicker([...new Set(nowAll.map((r) => r.station))]);
    renderNow();
    renderForecast(fc.forecast || []);
    renderClimate(haz.climate || null);
    wago.textContent = new Date().toLocaleTimeString();
  } catch (e) { $("weather").innerHTML = '<li class="muted">Weather unavailable (' + e.message + ")</li>"; }
}

/* ---- boot ---- */
async function load() {
  try {
    const res = await fetch(`${API_BASE}/current?source=doe-eqms`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    render((await res.json()).current || []);
    ago.textContent = new Date().toLocaleTimeString();
  } catch (e) { list.innerHTML = `<li class="muted">Could not reach the API (${e.message})</li>`; }
}

$("refresh").addEventListener("click", () => { load(); loadHazards(); loadWeather(); });
$("dclose").addEventListener("click", closeDetail);
renderLegend();
load();
loadHazards();
loadWeather();
setInterval(load, 60_000);
setInterval(loadHazards, 5 * 60_000);
setInterval(loadWeather, 10 * 60_000);
