/**
 * Icon geometry.
 *
 * Kept out of the component so adding an icon is a data edit, and so the nav, buttons
 * and empty states all draw from one set. Each icon is a list of shapes; the component
 * only knows how to render them.
 */

/** @typedef {{ path?: string, circle?: [number, number, number] }} Shape */

/** @type {Record<string, Shape[]>} */
export const ICONS = {
  weather: [
    { circle: [12, 12, 4] },
    { path: "M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6L19 19M19 5l-1.4 1.4M6.4 17.6L5 19" },
  ],
  air: [
    { path: "M3 8h11a3 3 0 1 0-3-3" },
    { path: "M3 12h15a3 3 0 1 1-3 3" },
    { path: "M3 16h8" },
  ],
  quake: [{ path: "M2 12h4l2-7 4 14 2-7h8" }],
  home: [{ path: "M3 10.5 12 3l9 7.5" }, { path: "M5 9.5V20h14V9.5" }],
  flood: [{ path: "M2 9c1.6-2 3.2-2 4.8 0s3.2 2 4.8 0 3.2-2 4.8 0 3.2 2 4.8 0" }, { path: "M2 15c1.6-2 3.2-2 4.8 0s3.2 2 4.8 0 3.2-2 4.8 0 3.2 2 4.8 0" }],
  news: [{ path: "M4 5h13v16H4z" }, { path: "M17 9h3v12" }, { path: "M7 9h5M7 13h5M7 17h4" }],
  pin: [{ circle: [12, 10, 3] }, { path: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" }],
  sun: [
    { circle: [12, 12, 4] },
    { path: "M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6L19 19M19 5l-1.4 1.4M6.4 17.6L5 19" },
  ],
  moon: [{ path: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" }],
  gear: [
    { circle: [12, 12, 3] },
    { path: "M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" },
  ],
  close: [{ path: "M6 6l12 12M18 6L6 18" }],
  share: [
    { circle: [18, 5, 3] }, { circle: [6, 12, 3] }, { circle: [18, 19, 3] },
    { path: "M8.6 13.5l6.8 4.4M15.4 6.1L8.6 10.5" },
  ],
  chevron: [{ path: "M9 6l6 6-6 6" }],
  refresh: [{ path: "M21 12a9 9 0 1 1-2.6-6.4" }, { path: "M21 3v6h-6" }],
};

/** Names available to <Icon name="…" />. */
export const ICON_NAMES = Object.keys(ICONS);
