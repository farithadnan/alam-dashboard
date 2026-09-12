// Minimal BM/EN i18n as a shared runes store. Strings keyed; components call tr('key').
const en = {
  navWeather: "Weather", navAQI: "AQI", navHazards: "Earthquakes", navAbout: "About", changeLoc: "Change location",
  navHome: "Home", navFlood: "Flood", navNews: "News", homeIntro: "Live weather, air quality and hazard alerts for Malaysia — built on open official data.", homeIntroMore: "More", homeFlood: "{n} flood alerts", homeNews: "{n} hazard stories", searchEndpoints: "Search endpoints…", srcTitle: "Official sources", srcHint: "Straight from the issuing agencies — trusted, not re-sold.", advisories: "Advisories", newsTitle: "Weather & hazard news", explore: "Explore", noNews: "No recent stories.", newsCount: "recent stories", warningsInForce: "{n} warnings in force", quakesWeek: "{n} quakes this week",
  scopeNear: "Near me", scopeState: "State", scopeMalaysia: "Malaysia",
  state: "State", town: "Town", useLoc: "Use my location", locating: "Locating…", location: "Location",
  feels: "Feels like", humidity: "humidity", wind: "wind", uv: "UV",
  gust: "Gusts", pressure: "Pressure", visibility: "Visibility", dewPoint: "Dew point", sunrise: "Sunrise", sunset: "Sunset", moon: "Moon", todayDetail: "Today's details", stormChance: "Thunderstorm chance",
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
  climateElEffect: "Typically drier and warmer for Malaysia, with a higher risk of haze and water shortages.",
  climateLaEffect: "Typically wetter for Malaysia, with more flooding and storms.",
  climateNeutralEffect: "Near-normal rainfall patterns for Malaysia.",
  alertsTitle: "Weather alerts", noAlerts: "No active weather alerts.",
  alertRain: "Heavy rain likely — up to {p}% in {places}",
  alertHeat: "Hot day ahead — up to {c}°C in {places}",
  share: "Share", alertsTelegram: "Telegram alerts", loading: "Loading…", searchNews: "Search news…", noMatches: "No matching stories.", staleData: "Live update failed — showing last known data.", loadFailed: "Could not reach the data service.", loadFailedHint: "Check your connection — nothing has loaded yet.", retry: "Retry", back: "Back", done: "Done", showMore: "Show more", showLess: "Show less", noData: "No data for this place.", avgLine: "Average", high: "high", low: "low", townsWord: "towns",
  catTitle: "Stations by category", nearest: "Use nearest station", hourlyReadings: "Hourly readings (24h)",
  tsunamiFlag: "Tsunami alert issued for this event",
  magnitude: "Magnitude", depth: "Depth", region: "Region", intensity: "Intensity", reportedIntensity: "Reported intensity", significance: "Significance", eventType: "Event type", feltReports: "Felt reports", tsunami: "Tsunami", stationsUsed: "Stations used", status: "Status", yes: "Yes", no: "No",
  stationLbl: "Station", categoryLbl: "Category", parameter: "Parameter",
  chartPast24: "Observed readings, past 24 hours", chartPast7d: "Observed readings, past 7 days",
  cleanestNow: "Cleanest right now", worstNow: "Most polluted right now",
  officialTitle: "Official forecast (MET Malaysia)", officialNote: "Official 7-day forecast from MET Malaysia.", forecastLegend: "High / Low — the day's warmest and coolest temperature.", forecastHigh: "High", forecastLow: "Low",
  locationPrompt: "Showing {place}. Not your place?", useMyLocation: "Use my location", dismiss: "Not now", locHint: "Your pick applies right away. Done closes this.",
  hazeTitle: "Haze outlook", hazeHint: "Peak fine-dust (PM2.5) each day. Lower is better; the daily limit is 25 µg/m³.", hazeAbove: "High: limit time outdoors", hazeBelow: "Typical for the season",
  floodTitle: "Flood & rain alerts", floodRiver: "River levels", floodRain: "Heavy rain", floodAll: "All Malaysia", floodMyPlace: "My place", floodOpen: "Full InfoBanjir live map", floodNone: "No active flood alerts in {state} right now.", floodMonitor: "Watching river levels and rainfall shifts across Malaysia via InfoBanjir (JPS).", floodNote: "Live InfoBanjir (JPS) river levels and heavy-rain alerts. Only stations currently in an alert band appear.",
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
  aboutWhat: "Alam is a free, non-commercial dashboard for air quality, weather, and hazards across Malaysia, built for clarity and speed.",
  featTitle: "Features",
  feat1: "Nationwide air quality (68 monitoring stations, all 16 states)",
  feat2: "Current weather, feels-like, humidity, wind and UV",
  feat3: "Hourly timeline and a 7-day forecast",
  feat4: "Live MET Malaysia weather warnings (land-based)",
  feat5: "Recent earthquakes across Southeast Asia on an interactive map",
  feat6: "Malay and English, light and dark mode, works on phone and desktop",
  apprecTitle: "Appreciation",
  apprecText: "Alam would not exist without open public data. Thank you to DOE APIMS, MET Malaysia, USGS, NOAA, and Open-Meteo, and to CARTO and Leaflet for the maps.",
  discTitle: "Disclaimer",
  discText: "Alam is for general information only. Data comes from public sources and is not guaranteed to be accurate, complete, or timely, and may be delayed. Always confirm with official authorities before making safety decisions. Alam is not affiliated with any government body.",
  privTitle: "Privacy policy",
  privText: "Alam does not collect personal data. Your theme and language preferences are stored only in your own browser (local storage) and never transmitted to a server.",
  contactTitle: "Contact",
  contactText: "Questions, corrections, or feedback? Email dev@farithadnan.net.",
  reportTitle: "Report an issue",
  reportBtn: "Report an issue",
  reportType: "Type",
  reportTypeData: "Wrong or missing data",
  reportTypeBug: "Bug or broken feature",
  reportTypeIdea: "Suggestion",
  reportDesc: "Describe the problem",
  reportDescPh: "What did you see, and where?",
  reportEmail: "Your email (optional)",
  reportSend: "Send",
  reportThanks: "Your email app should open with the report ready to send.",
  apiTitle: "API",
  apiIntro: "Alam serves a small JSON API — the same one powering this site. It is open, free, and requires no key.",
  apiNote: "Be kind: the API is backed by cached public data. Versioned at /v1 (an alias of /api), rate-limited to 120 requests/min per IP — please cache responses.",
  apiTry: "Try an endpoint",
  apiMethods: { summary: "Current + forecast + hazards bundle (optionally per state)", stations: "Known monitoring stations", history: "24h/7d history for a station", hazards: "Warnings, earthquakes and climate" },
};
const ms = {
  navWeather: "Cuaca", navAQI: "AQI", navHazards: "Gempa bumi", navAbout: "Tentang", changeLoc: "Tukar lokasi",
  navHome: "Utama", navFlood: "Banjir", navNews: "Berita", homeIntro: "Cuaca, kualiti udara dan amaran bahaya secara langsung untuk Malaysia — dibina atas data rasmi terbuka.", homeIntroMore: "Lagi", homeFlood: "{n} amaran banjir", homeNews: "{n} berita bahaya", searchEndpoints: "Cari endpoint…", srcTitle: "Sumber rasmi", srcHint: "Terus daripada agensi pengeluar — dipercayai, bukan jualan semula.", advisories: "Nasihat", newsTitle: "Berita cuaca & bahaya", explore: "Terokai", noNews: "Tiada berita terkini.", newsCount: "berita terkini", warningsInForce: "{n} amaran aktif", quakesWeek: "{n} gempa minggu ini",
  scopeNear: "Berdekatan", scopeState: "Negeri", scopeMalaysia: "Malaysia",
  state: "Negeri", town: "Bandar", useLoc: "Guna lokasi saya", locating: "Mengesan…", location: "Lokasi",
  feels: "Terasa seperti", humidity: "kelembapan", wind: "angin", uv: "UV",
  gust: "Tiupan", pressure: "Tekanan", visibility: "Penglihatan", dewPoint: "Titik embun", sunrise: "Matahari terbit", sunset: "Matahari terbenam", moon: "Bulan", todayDetail: "Butiran hari ini", stormChance: "Kemungkinan ribut petir",
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
  climateElEffect: "Lazimnya lebih kering dan panas untuk Malaysia, dengan risiko jerebu dan kekurangan air lebih tinggi.",
  climateLaEffect: "Lazimnya lebih basah untuk Malaysia, dengan lebih banyak banjir dan ribut.",
  climateNeutralEffect: "Corak hujan hampir normal untuk Malaysia.",
  alertsTitle: "Amaran cuaca", noAlerts: "Tiada amaran cuaca aktif.",
  alertRain: "Kemungkinan hujan lebat — sehingga {p}% di {places}",
  alertHeat: "Hari panas dijangka — sehingga {c}°C di {places}",
  share: "Kongsi", alertsTelegram: "Amaran Telegram", loading: "Memuatkan…", searchNews: "Cari berita…", noMatches: "Tiada berita sepadan.", staleData: "Kemas kini langsung gagal — memaparkan data terakhir.", loadFailed: "Tidak dapat menghubungi perkhidmatan data.", loadFailedHint: "Periksa sambungan anda — tiada data dimuatkan lagi.", retry: "Cuba lagi", back: "Kembali", done: "Siap", showMore: "Tunjuk lebih", showLess: "Tunjuk kurang", noData: "Tiada data untuk tempat ini.", avgLine: "Purata", high: "tinggi", low: "rendah", townsWord: "bandar",
  catTitle: "Stesen mengikut kategori", nearest: "Guna stesen terdekat", hourlyReadings: "Bacaan setiap jam (24j)",
  tsunamiFlag: "Amaran tsunami dikeluarkan untuk kejadian ini",
  magnitude: "Magnitud", depth: "Kedalaman", region: "Wilayah", intensity: "Keamatan", reportedIntensity: "Keamatan dilaporkan", significance: "Kepentingan", eventType: "Jenis kejadian", feltReports: "Laporan dirasai", tsunami: "Tsunami", stationsUsed: "Stesen digunakan", status: "Status", yes: "Ya", no: "Tidak",
  stationLbl: "Stesen", categoryLbl: "Kategori", parameter: "Parameter",
  chartPast24: "Bacaan diperhatikan, 24 jam lalu", chartPast7d: "Bacaan diperhatikan, 7 hari lalu",
  cleanestNow: "Paling bersih sekarang", worstNow: "Paling tercemar sekarang",
  officialTitle: "Ramalan rasmi (MET Malaysia)", officialNote: "Ramalan rasmi 7 hari daripada MET Malaysia.", forecastLegend: "Tinggi / Rendah — suhu paling panas dan paling sejuk pada hari itu.", forecastHigh: "Tinggi", forecastLow: "Rendah",
  locationPrompt: "Memaparkan {place}. Bukan lokasi anda?", useMyLocation: "Guna lokasi saya", dismiss: "Bukan sekarang", locHint: "Pilihan anda diterapkan serta-merta. Siap untuk tutup.",
  hazeTitle: "Tinjauan jerebu", hazeHint: "Habuk halus (PM2.5) puncak setiap hari. Semakin rendah semakin baik; had harian ialah 25 µg/m³.", hazeAbove: "Tinggi: hadkan masa di luar", hazeBelow: "Biasa untuk musim ini",
  floodTitle: "Amaran banjir & hujan", floodRiver: "Paras sungai", floodRain: "Hujan lebat", floodAll: "Seluruh Malaysia", floodMyPlace: "Lokasi saya", floodOpen: "Peta InfoBanjir penuh", floodNone: "Tiada amaran banjir aktif di {state} buat masa ini.", floodMonitor: "Memantau paras sungai dan pergerakan hujan di seluruh Malaysia melalui InfoBanjir (JPS).", floodNote: "Paras sungai dan hujan lebat InfoBanjir (JPS). Hanya stesen yang kini dalam keadaan amaran dipaparkan.",
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
  aboutWhat: "Alam ialah papan pemuka percuma dan bukan komersial untuk kualiti udara, cuaca dan bahaya di seluruh Malaysia, dibina untuk kejelasan dan kepantasan.",
  featTitle: "Ciri-ciri",
  feat1: "Kualiti udara seluruh negara (68 stesen pemantauan, 16 negeri)",
  feat2: "Cuaca semasa, terasa seperti, kelembapan, angin dan UV",
  feat3: "Garis masa setiap jam dan ramalan 7 hari",
  feat4: "Amaran cuaca MET Malaysia secara langsung (di darat)",
  feat5: "Gempa bumi terkini di Asia Tenggara pada peta interaktif",
  feat6: "Melayu dan Inggeris, mod terang dan gelap, sesuai di telefon dan desktop",
  apprecTitle: "Penghargaan",
  apprecText: "Alam tidak akan wujud tanpa data awam yang terbuka. Terima kasih kepada DOE APIMS, MET Malaysia, USGS, NOAA dan Open-Meteo, serta CARTO dan Leaflet untuk peta.",
  discTitle: "Penafian",
  discText: "Alam adalah untuk maklumat umum sahaja. Data datang daripada sumber awam dan tidak dijamin tepat, lengkap atau tepat pada masanya, serta mungkin tertunda. Sentiasa sahkan dengan pihak berkuasa rasmi sebelum membuat keputusan keselamatan. Alam bukan gabungan mana-mana badan kerajaan.",
  privTitle: "Dasar privasi",
  privText: "Alam tidak mengumpul data peribadi. Pilihan tema dan bahasa anda disimpan hanya di dalam pelayar anda (local storage) dan tidak pernah dihantar ke pelayan.",
  contactTitle: "Hubungi",
  contactText: "Soalan, pembetulan atau maklum balas? E-mel dev@farithadnan.net.",
  reportTitle: "Laporkan masalah",
  reportBtn: "Laporkan masalah",
  reportType: "Jenis",
  reportTypeData: "Data salah atau tiada",
  reportTypeBug: "Pepijat atau ciri rosak",
  reportTypeIdea: "Cadangan",
  reportDesc: "Terangkan masalah",
  reportDescPh: "Apa yang anda lihat, dan di mana?",
  reportEmail: "E-mel anda (pilihan)",
  reportSend: "Hantar",
  reportThanks: "Aplikasi e-mel anda sepatutnya dibuka dengan laporan sedia untuk dihantar.",
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
