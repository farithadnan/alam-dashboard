/**
 * WMO weather codes.
 *
 * Open-Meteo reports a numeric code; this maps it to the emoji and label the UI shows.
 * Split out of flags.js, which had grown into a drawer of five unrelated things.
 */

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
