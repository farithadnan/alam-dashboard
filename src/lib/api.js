const B = "./api";

export async function j(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
}

export const getCurrent = (src) => j(`${B}/current?source=${src}`);
export const getHistory = (src, station, hours) =>
  j(`${B}/history?source=${src}&station=${encodeURIComponent(station)}&hours=${hours}`);
export const getForecast = () => j(`${B}/forecast?source=open-meteo`);
export const getHazards = () => j(`${B}/hazards`);
export const getOfficial = (state, town) => {
  const q = new URLSearchParams();
  if (state) q.set("state", state);
  if (town) q.set("town", town);
  return j(`${B}/official${q.size ? `?${q}` : ""}`);
};

export const getHaze = (town) => j(`${B}/haze${town ? `?town=${encodeURIComponent(town)}` : ""}`);

export const clock = () => new Date().toLocaleTimeString();
