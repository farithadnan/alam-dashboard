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
};

/** Names available to <Icon name="…" />. */
export const ICON_NAMES = Object.keys(ICONS);
