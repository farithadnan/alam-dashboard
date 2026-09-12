/** Shell configuration — one place for the nav + scope definitions. */
export const NAV = [
  { view: "home", icon: "home", key: "navHome" },
  { view: "weather", icon: "weather", key: "navWeather" },
  { view: "air", icon: "air", key: "navAQI" },
  { view: "flood", icon: "flood", key: "navFlood" },
  { view: "hazards", icon: "quake", key: "navHazards" },
  { view: "news", icon: "news", key: "navNews" },
];

export const SCOPES = [
  { value: "near", key: "scopeNear" },
  { value: "state", key: "scopeState" },
  { value: "malaysia", key: "scopeMalaysia" },
];
