// Minimal BM/EN i18n as a shared runes store. Strings keyed; components call tr('key').
const en = {
  navWeather: "Weather", navAQI: "Air quality", navHazards: "Hazards", navAbout: "About", changeLoc: "Change location",
  state: "State", town: "Town", useLoc: "Use my location", locating: "Locating…", location: "Location",
  feels: "Feels like", humidity: "humidity", wind: "wind", uv: "UV",
  noMonitor: "No air monitor in", updated: "Updated", updatedFrom: "Updated {t} · DOE APIMS & Open-Meteo", nearby: "Nearest station:",
  forecast: "7-day forecast", today: "Today",
  viewAir: "View", hideAir: "Hide", airStations: "air stations in {s} ({n})", worst: "Worst",
  airNow: "Air now", yourTown: "Your town", past24: "past 24h", past7: "past 7 days",
  warningsTitle: "Weather warnings · Malaysia", fromSrc2: "MET Malaysia & USGS",
  validUntil: "Valid until", readFull: "Read full advisory", hideFull: "Hide",
  quakeTitle: "Recent earthquakes · 4.5+ · past week", quakeCap: "SE Asia, grouped by region · Magnitude 4.5 and above.",
  noQuakes: "No quakes at 4.5+ in the last week around the region.",
  climateHead: "Climate context", climateEl: "El Niño is active — a warmer Pacific often shifts rainfall around Malaysia.",
  climateLa: "La Niña is active — a cooler Pacific often brings wetter, stormier conditions to Malaysia.",
  climateNeutral: "Neutral — the equatorial Pacific is near its normal state.",
  updating: "Updating…", about: "About Alam", sources: "Sources: DOE · MET · USGS · NOAA · Open-Meteo",
  copyright: "© 2026 Farith Adnan",
  aboutTitle: "About Alam",
  aboutText: "Alam is a free, non-commercial dashboard for air quality, weather and hazard alerts across Malaysia, fed by public data from DOE APIMS, MET Malaysia, USGS, NOAA, and Open-Meteo. Data is not guaranteed; verify official sources before acting on it. Not affiliated with any government body.",
  expectedOver: "Expected over {p} — into {t} {m}",
  onLand: "(on land)", onSea: "(sea areas)",
  band_good: "Good", band_moderate: "Moderate", band_unhealthy: "Unhealthy", band_very: "Very Unhealthy", band_hazardous: "Hazardous",
  advice_good: "Air is clean; a good day to be outside.", advice_moderate: "Acceptable. Sensitive groups: moderate activity is fine.",
  advice_unhealthy: "Reduce prolonged outdoor exertion.", advice_very: "Avoid outdoor activity; keep windows closed.",
  advice_hazardous: "Everyone should stay indoors; serious health risk.",
  sev_high: "High", sev_watch: "Watch", sev_advisory: "Advisory",
  mag_strong: "Strong", mag_moderate: "Moderate", mag_light: "Light",
  wmo_clear: "Clear", wmo_mostly: "Mostly clear", wmo_partly: "Partly cloudy", wmo_overcast: "Overcast",
  wmo_fog: "Fog", wmo_drizzle: "Drizzle", wmo_lightrain: "Light rain", wmo_rain: "Rain", wmo_heavy: "Heavy rain",
  wmo_showers: "Showers", wmo_thunder: "Thunderstorm", wmo_snow: "Snow", wmo_thunderstorm: "Thunderstorm",
  stationsMap: "Stations map", quakesMap: "Earthquake map",
};
const ms = {
  navWeather: "Cuaca", navAQI: "Kualiti udara", navHazards: "Bahaya", navAbout: "Tentang", changeLoc: "Tukar lokasi",
  state: "Negeri", town: "Bandar", useLoc: "Guna lokasi saya", locating: "Mengesan…", location: "Lokasi",
  feels: "Terasa seperti", humidity: "kelembapan", wind: "angin", uv: "UV",
  noMonitor: "Tiada monitor udara di", updated: "Dikemas kini", updatedFrom: "Dikemas kini {t} · DOE APIMS & Open-Meteo", nearby: "Stesen terdekat:",
  forecast: "Ramalan 7 hari", today: "Hari ini",
  viewAir: "Lihat", hideAir: "Sembunyi", airStations: "stesen udara di {s} ({n})", worst: "Paling teruk",
  airNow: "Udara sekarang", yourTown: "Bandar anda", past24: "24 jam lalu", past7: "7 hari lalu",
  warningsTitle: "Amaran cuaca · Malaysia", fromSrc2: "MET Malaysia & USGS",
  validUntil: "Berkuat hingga", readFull: "Baca amaran penuh", hideFull: "Sembunyi",
  quakeTitle: "Gempa bumi terkini · 4.5+ · minggu lalu", quakeCap: "Asia Tenggara, dikumpul ikut rantau · Magnitud 4.5 dan ke atas.",
  noQuakes: "Tiada gempa 4.5+ dalam minggu lalu di rantau ini.",
  climateHead: "Konteks iklim",
  climateEl: "El Niño aktif — Pasifik lebih panas lazimnya mengubah corak hujan di Malaysia.",
  climateLa: "La Niña aktif — Pasifik lebih sejuk lazimnya membawa keadaan lebih basah ke Malaysia.",
  climateNeutral: "Neutral — Pasifik khatulistiwa hampir normal.",
  updating: "Menyegarkan…", about: "Tentang Alam", sources: "Sumber: DOE · MET · USGS · NOAA · Open-Meteo",
  aboutText: "Alam ialah papan pemuka percuma dan bukan komersial untuk kualiti udara, cuaca dan amaran bahaya di seluruh Malaysia, menggunakan data awam daripada DOE APIMS, MET Malaysia, USGS, NOAA dan Open-Meteo. Data tidak dijamin; sahkan sumber rasmi sebelum bertindak. Bukan gabungan mana-mana badan kerajaan.",
  copyright: "© 2026 Farith Adnan",
  aboutTitle: "Tentang Alam",
  expectedOver: "Dijangka di {p} — sehingga {t} {m}",
  onLand: "(di darat)", onSea: "(kawasan laut)",
  band_good: "Baik", band_moderate: "Sederhana", band_unhealthy: "Tidak Sihat", band_very: "Sangat Tidak Sihat", band_hazardous: "Berbahaya",
  advice_good: "Udara bersih; hari yang baik untuk keluar.", advice_moderate: "Boleh diterima. Kumpulan sensitif: aktiviti sederhana adalah ok.",
  advice_unhealthy: "Kurangkan aktiviti luar yang berpanjangan.", advice_very: "Elak aktiviti luar; tutup tingkap.",
  advice_hazardous: "Semua perlu di dalam rumah; risiko kesihatan serius.",
  sev_high: "Tinggi", sev_watch: "Perhatian", sev_advisory: "Nasihat",
  mag_strong: "Kuat", mag_moderate: "Sederhana", mag_light: "Ringan",
  wmo_clear: "Cerah", wmo_mostly: "Cerah Berawan", wmo_partly: "Separa Mendung", wmo_overcast: "Mendung",
  wmo_fog: "Kabut", wmo_drizzle: "Gerimis", wmo_lightrain: "Hujan Renyai", wmo_rain: "Hujan", wmo_heavy: "Hujan Lebat",
  wmo_showers: "Renyai", wmo_thunder: "Ribut Petir", wmo_snow: "Salji",
  stationsMap: "Peta stesen", quakesMap: "Peta gempa",
};

const D = { en, ms };
export const lang = $state({ code: "en" });

export function initLang() {
  try { const c = localStorage.getItem("alam-lang"); if (c === "ms" || c === "en") lang.code = c; } catch {}
  applyLang();
}
export function setLang(c) {
  lang.code = c;
  try { localStorage.setItem("alam-lang", c); } catch {}
  applyLang();
}
function applyLang() {
  if (typeof document !== "undefined") document.documentElement.lang = lang.code === "ms" ? "ms" : "en";
}
export function tr(k) {
  return (D[lang.code]?.[k] ?? en[k] ?? k);
}
export function trFmt(k, vars) {
  let s = tr(k);
  for (const [key, val] of Object.entries(vars)) s = s.replace(`{${key}}`, String(val));
  return s;
}
export function bandLabel(l) {
  const key = (l || "").trim().toLowerCase().replace(/\s+/g, "_");
  return `band_${key}` in en ? tr(`band_${key}`) : l || "";
}
export function bandAdvice(l) {
  const key = (l || "").trim().toLowerCase().replace(/\s+/g, "_");
  return `advice_${key}` in en ? tr(`advice_${key}`) : "";
}
export function severityWord(s) {
  return s >= 3 ? tr("sev_high") : s === 2 ? tr("sev_watch") : tr("sev_advisory");
}
export function magWordL(m) {
  return m >= 6 ? tr("mag_strong") : m >= 5 ? tr("mag_moderate") : tr("mag_light");
}
export function wmoLabel(label) {
  const base = (label || "").trim().toLowerCase().replace(/\s+/g, "_");
  for (const key of [base, base.replace(/s$/, "")]) if (`wmo_${key}` in en) return tr(`wmo_${key}`);
  return label || "";
}
