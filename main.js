const API_BASE = "./api";

const BANDS = [
  { label: "Good", color: "#43a047" },
  { label: "Moderate", color: "#fbc02d" },
  { label: "Unhealthy", color: "#ef6c00" },
  { label: "Very Unhealthy", color: "#d32f2f" },
  { label: "Hazardous", color: "#8e24aa" },
];

const el = (id) => document.getElementById(id);
const list = el("stations");
const legend = el("legend");
const ago = el("ago");
const worst = el("worst");

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
    const grow = document.createElement("div");
    grow.className = "grow";
    const name = document.createElement("div");
    name.className = "name";
    const city = (r.stationName || r.station).split(",")[0];
    name.textContent = city;
    const band = document.createElement("div");
    band.className = "band";
    band.textContent = r.band.label + " · " + (r.band.advice);
    band.title = r.band.advice;
    grow.append(name, band);
    const val = document.createElement("div");
    val.className = "val";
    val.textContent = String(r.value);
    val.style.color = r.band.color;
    li.append(grow, val);
    list.append(li);
  }
  const top = rows[0];
  if (top) worst.textContent = `Worst now: ${top.stationName.split(",")[0]} at ${top.value} (${top.band.label}). ${top.band.advice}`;
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

el("refresh").addEventListener("click", load);
renderLegend();
load();
setInterval(load, 60_000); // gentle auto-refresh
