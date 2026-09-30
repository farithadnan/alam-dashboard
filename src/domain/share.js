import { numColor, regionOf, apiBandOf } from "./flags.js";
import { wmo } from "./weather-codes.js";
import { SITE } from "../core/config.js";

const slug = (s) =>
  String(s ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/** The site root or a view link, with no trailing slash. */
const linkTo = (hash = "") => `${SITE.url}${hash}`;

/** "Unhealthy" -> "the unhealthy side", for the friendly phrasing. */
function bandMood(label) {
  const l = String(label || "").toLowerCase();
  return l.includes("unhealthy") ? "the unhealthy side" : l || "moderate";
}

/**
 * Every share note is one object: { place, text, plus card fields: headline, valueLabel,
 * band, tip, extra, footer, color, build }. The SAME object feeds the friendly text and the
 * drawn card, so what you preview is exactly what gets sent.
 */
function note(place, lines, overrides) {
  return Object.assign(
    {
      town: place, state: "", place, text: lines.join("\n"), build: "note",
      headline: "", valueLabel: null, icon: "", band: "", tip: "", extra: "", stats: [],
      footer: linkTo(""), color: "#c14a1f",
    },
    overrides,
  );
}

/** Home: a quick, reassuring read on the location overall (air + weather + nearby alerts). */
export function homeSharePayload({ town, state, now, townAir, air = null, warnings = [], floodCount = 0, high = null, low = null, precip = null, rainAt = "" }) {
  const place = [town, state].filter(Boolean).join(", ") || "your area";
  const value = townAir?.value ?? air?.value ?? null;
  const band = townAir?.band?.label ?? (air?.value != null ? apiBandOf(air.value) : null);
  const advice = townAir?.band?.advice ?? "";
  const temp = now ? Math.round(now.value) : null;
  const cond = now?.meta?.code != null ? wmo(String(now.meta.code))[1] || "" : "";

  const lines = [`Quick look at how things are in ${place} right now.`];
  if (value != null && band) {
    const mood = advice ? " It's a good idea to keep outdoor time short, easy on yourself if the air usually gets to you." : "";
    lines.push(`The air is on ${bandMood(band)} today (AQI ${Math.round(value)}).${mood}`);
  }
  if (temp != null) lines.push(`It's ${cond ? cond.toLowerCase() + " and " : ""}${temp}°.`);
  const extras = [
    warnings.length ? `${warnings.length} weather warning${warnings.length > 1 ? "s" : ""} in force` : "",
    floodCount ? `${floodCount} flood alert${floodCount > 1 ? "s" : ""} nearby` : "",
  ].filter(Boolean);
  if (extras.length) lines.push(`There are also ${extras.join(" and ")} worth keeping an eye on before heading out.`);
  lines.push(`Follow it live here: ${linkTo("")}`);

  return note(place, lines, {
    headline: cond || "Your area now",
    valueLabel: temp != null ? `${temp}°` : value != null ? `AQI ${Math.round(value)}` : null,
    icon: now?.meta?.code != null ? wmo(String(now.meta.code))[0] : "",
    band: band || "",
    tip: advice || "",
    stats: [
      value != null ? { label: "Air quality", value: `AQI ${Math.round(value)}` } : null,
      now?.meta?.apparentTemp != null ? { label: "Feels like", value: `${Math.round(now.meta.apparentTemp)}°` } : null,
      now?.meta?.humidity != null ? { label: "Humidity", value: `${now.meta.humidity}%` } : null,
      now?.meta?.wind != null ? { label: "Wind", value: `${now.meta.wind} km/h` } : null,
      high != null && low != null ? { label: "High / Low", value: `${Math.round(high)}° / ${Math.round(low)}°` } : null,
      precip != null ? { label: "Rain chance", value: `${Math.round(precip)}%${rainAt ? ` · ${rainAt}` : ""}` } : null,
    ].filter(Boolean),
    footer: linkTo(""),
    color: band ? numColor(band) : "#c14a1f",
  });
}
export const sharePayload = homeSharePayload; // kept name so Home / preview callers stay stable

/** Weather: the current conditions as a small infographic card. */
export function weatherSharePayload({ town, state, now, humidity = now?.meta?.humidity ?? null, wind = now?.meta?.wind ?? null, precip = now?.meta?.precip ?? null, high = null, low = null, feels = null, haze = null, rainAt = "" }) {
  const place = [town, state].filter(Boolean).join(", ") || "your area";
  const temp = now ? Math.round(now.value) : null;
  const feel = feels != null ? Math.round(feels) : now?.meta?.apparentTemp != null ? Math.round(now.meta.apparentTemp) : null;
  const cond = now?.meta?.code != null ? wmo(String(now.meta.code))[1] || "" : "";
  const icon = now?.meta?.code != null ? wmo(String(now.meta.code))[0] : "";
  const facts = [
    feel != null ? `feeling like ${feel}°` : "",
    humidity != null ? `humidity at ${humidity}%` : "",
    wind != null ? `wind around ${wind} km/h` : "",
    precip != null && precip > 0 ? `rain chance ${Math.round(precip)}%` : "",
  ].filter(Boolean);

  const lines = [
    `The weather in ${place} right now: ${cond ? cond.toLowerCase() : "pretty quiet"}, and ${temp != null ? `${temp}°` : "mild"}${facts.length ? `, ${facts.join(", ")}` : ""}.`,
    `You can check the week ahead here: ${linkTo("#/weather")}`,
  ];

  return note(place, lines, {
    headline: cond || "Current weather",
    valueLabel: temp != null ? `${temp}°` : null,
    icon,
    band: "",
    tip: "",
    stats: [
      feel != null ? { label: "Feels like", value: `${feel}°` } : null,
      humidity != null ? { label: "Humidity", value: `${humidity}%` } : null,
      wind != null ? { label: "Wind", value: `${wind} km/h` } : null,
      precip != null && precip > 0 ? { label: "Rain chance", value: `${Math.round(precip)}%${rainAt ? ` · ${rainAt}` : ""}` } : null,
      high != null && low != null ? { label: "High / Low", value: `${Math.round(high)}° / ${Math.round(low)}°` } : null,
      haze != null ? { label: "Haze (PM2.5)", value: `${Math.round(haze)} µg/m³` } : null,
    ].filter(Boolean),
    footer: linkTo("#/weather"),
    color: "#3b6ea8",
  });
}

/** Air quality: the value, the health note, gentle guidance. */
export function airSharePayload({ station, state, value, band, color, advice = "", worst = "" }) {
  const place = [station, state].filter(Boolean).join(", ") || "your area";
  const lines = [`A heads up about the air in ${place} today.`];
  if (value != null && band) {
    const mood = advice ? " So if you or anyone with you is sensitive, it's a good day to take it easy outside and keep windows closed." : "";
    lines.push(`It's sitting at AQI ${Math.round(value)}, the ${band.toLowerCase()} range.${mood}`);
  } else {
    lines.push(`The air is sitting in the ${(band || "moderate").toLowerCase()} range right now.`);
  }
  if (worst) lines.push(worst);
  lines.push(`You can follow it here: ${linkTo("#/air")}`);

  return note(place, lines, {
    headline: value != null ? `AQI ${Math.round(value)}` : "Air quality",
    valueLabel: value != null ? `AQI ${Math.round(value)}` : null,
    band: band || "",
    tip: advice || "",
    extra: worst || "",
    footer: linkTo("#/air"),
    color: band ? numColor(band) : color || "#c14a1f",
  });
}

/** Flood: river + rain alerts for the scope, reassuring. */
export function floodSharePayload({ scope, state, river = [], rain = [] }) {
  const where = scope === "malaysia" ? "Malaysia" : state || "your area";
  const total = river.length + rain.length;
  const highest = river.reduce((m, a) => (a.level > (m?.level ?? -1) ? a : m), null);

  const lines = [`Sharing, in case anyone this reaches is in ${where}.`];
  if (!total) {
    lines.push("Right now there's no active flood or heavy-rain alert in view. All clear, just keep an eye out if the sky looks heavy.");
  } else {
    const rv = river.length ? `about ${river.length} river site${river.length > 1 ? "s" : ""} at alert` : "no river sites on alert";
    const rn = rain.length ? "some heavy rain around" : "";
    lines.push(`There ${river.length === 1 ? "is" : "are"} ${rv}${rn ? ` and ${rn}` : ""}, so it's worth being aware before you head out. Nothing to panic about.`);
    if (highest) lines.push(`The highest reading is ${highest.stationName || "one site"} at ${highest.level} m${highest.severity ? ` (${highest.severity})` : ""}.`);
  }
  lines.push(`Live map here: ${linkTo("#/flood")}`);

  return note(where, lines, {
    headline: total ? `${total} alert${total > 1 ? "s" : ""}` : "All clear",
    valueLabel: highest ? `${highest.level} m` : null,
    band: highest?.severity || "",
    tip: total ? "Check the live map before heading out." : "",
    stats: [
      { label: "River sites", value: `${river.length}` },
      { label: "Heavy rain", value: `${rain.length}` },
      highest ? { label: "Highest level", value: `${highest.level} m` } : null,
      highest?.severity ? { label: "Worst", value: highest.severity } : null,
    ].filter(Boolean),
    footer: linkTo("#/flood"),
    color: total ? "#3b6ea8" : "#43a047",
  });
}

/** Earthquake: the notable recent event + reassurance. */
export function quakeSharePayload({ quakes = [], scope }) {
  const big = quakes.slice().sort((a, b) => b.magnitude - a.magnitude)[0];
  const m = big?.magnitude != null ? Number(big.magnitude).toFixed(1) : "";
  const where = scope === "malaysia" ? "the region" : "the area near you";

  const lines = [`A quiet update for anyone keeping an eye on ${where}.`];
  if (big && m) {
    lines.push(`There's been seismic activity around SE Asia this week, with the strongest a M${m}${big.stationName ? ` near ${big.stationName}` : ""}. Not something felt locally, just worth knowing about.`);
  } else {
    lines.push("Nothing notable in the past week. Quiet, which is good.");
  }
  lines.push(`You can see the map here: ${linkTo("#/earthquakes")}`);

  return note(where, lines, {
    headline: big && m ? `M${m}${big.stationName ? ` · ${big.stationName}` : ""}` : "Quiet week",
    valueLabel: big && m ? `M${m}` : null,
    band: "",
    tip: "",
    extra: quakes.length ? `${quakes.length} events this week` : "",
    stats: [
      big && m ? { label: "Strongest", value: `M${m}` } : null,
      { label: "Events", value: `${quakes.length}` },
      big ? { label: "Region", value: regionOf(big.stationName) } : null,
      big?.meta?.depth != null ? { label: "Depth", value: `${Math.round(big.meta.depth)} km` } : null,
    ].filter(Boolean),
    footer: linkTo("#/earthquakes"),
    color: "#8e24aa",
  });
}

/** A forwardable warning: plain text, not a card. */
export function warningSharePayload({ title, text, when }) {
  const body = String(text || "").replace(/\s+/g, " ").trim();
  return { town: title, text: [title, when, body, SITE.url].filter(Boolean).join("\n") };
}

export function telegramAlertsUrl(town, state) {
  const st = slug(state);
  if (!town || !st) return "";
  return `https://t.me/alamalerts_bot?start=loc_${town}_${st}`;
}
