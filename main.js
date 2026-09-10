const API_BASE = "./api";

const BANDS = [
  { from: 0,   label: "Good",           color: "#43a047" },
  { from: 51,  label: "Moderate",       color: "#f4a922" },
  { from: 101, label: "Unhealthy",      color: "#e05d2b" },
  { from: 201, label: "Very Unhealthy", color: "#d3342f" },
  { from: 301, label: "Hazardous",      color: "#8e24aa" },
];
function bandColor(value) {
  let c = BANDS[0].color;
  for (const b of BANDS) if (value >= b.from) c = b.color;
  return c;
}

const $ = (id) => document.getElementById(id);
const list = $("stations");
const legend = $("legend");
const ago = $("ago");
const worst = $("worst");
const detail = $("detail");

let selected = null; // station id

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
    val.style.color = r.band.color;
    const caret = document.createElement("span");
    caret.className = "caret";
    caret.textContent = "›";
    li.append(grow, val, caret);
    li.addEventListener("click", () => selectStation(r));
    list.append(li);
  }
  const top = rows[0];
  if (top) worst.innerHTML = `Worst now: <b>${labelOf(top)}</b> at <b style="color:${top.band.color}">${top.value}</b> (${top.band.label}). ${top.band.advice}`;
}

function labelOf(r) { return (r.stationName || r.station).split(",")[0]; }

async function selectStation(r) {
  selected = r.station;
  document.querySelectorAll(".stations li").forEach((li) =>
    li.classList.toggle("sel", li.querySelector(".name")?.textContent === labelOf(r)),
  );
  detail.hidden = false;
  $("dname").textContent = r.stationName || r.station;
  $("dval").textContent = String(r.value);
  $("dval").style.color = r.band.color;
  $("dmeta").textContent = `${r.band.label} now · 24-hour trend`;
  const rows = await loadHistory(r.station);
  drawChart(rows);
}

function closeDetail() {
  selected = null;
  detail.hidden = true;
  document.querySelectorAll(".stations li").forEach((li) => li.classList.remove("sel"));
}

async function loadHistory(station) {
  try {
    const res = await fetch(`${API_BASE}/history?source=doe-eqms&station=${encodeURIComponent(station)}&hours=24`);
    if (!res.ok) return [];
    const d = await res.json();
    return d.history || [];
  } catch { return []; }
}

function drawChart(rows) {
  const svg = $("chart");
  const W = 640, H = 100, PAD = 8;
  if (rows.length < 2) {
    svg.innerHTML = `<text x="${W/2}" y="50" text-anchor="middle" fill="#8a8277" font-size="12">not enough trend data yet</text>`;
    return;
  }
  const vals = rows.map((r) => r.value);
  const last = vals[vals.length - 1];
  let mn = Math.min(...vals), mx = Math.max(...vals);
  if (mx - mn < 20) { mn -= 10; mx += 10; }
  const span = mx - mn || 1;
  const pts = rows.map((r, i) => {
    const x = PAD + (i / (rows.length - 1)) * (W - 2 * PAD);
    const y = H - PAD - ((r.value - mn) / span) * (H - 2 * PAD);
    return [x, y];
  });
  let d = "";
  pts.forEach((p, i) => { d += (i ? " L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1); });
  const color = bandColor(last);
  const area = `${d} L ${pts[pts.length - 1][0].toFixed(1)},${H - PAD} L ${pts[0][0].toFixed(1)},${H - PAD} Z`;
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.innerHTML = [
    `<path d="${area}" fill="${color}" opacity="0.12"/>`,
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    `<text x="${W - PAD}" y="${PAD + 12}" text-anchor="end" fill="${color}" font-size="13" font-weight="700">${last}</text>`,
    `<text x="${pts[0][0]}" y="${H - 2}" fill="#8a8277" font-size="11">24h</text>`,
  ].join("");
  $("dmeta").textContent = `${rows[rows.length - 1].value} now (${rows[0].value} ${rows.length - 1}h ago, peak ${mx})`;
}

async function load() {
  try {
    const res = await fetch(`${API_BASE}/current?source=doe-eqms`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    render(data.current || []);
    ago.textContent = new Date().toLocaleTimeString();
  } catch (e) {
    list.innerHTML = `<li class="muted">Could not reach udara-api (${e.message})</li>`;
  }
}

$("refresh").addEventListener("click", load);
$("dclose").addEventListener("click", closeDetail);
renderLegend();
load();
setInterval(load, 60_000);
