/**
 * One place for the app's identity and deployment settings.
 *
 * Before this, the share link derived its own origin, the contact address was written
 * twice in the About page, and the map read its env var directly. Anything that is
 * "the app" rather than "a view" belongs here, so there is one value to change.
 */

const rawUrl =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL) ||
  (typeof location !== "undefined" ? location.origin : "");

export const SITE = {
  /** Shown in share titles and the document title. */
  name: "Alam",
  /**
   * Where a shared link points. Set VITE_SITE_URL at build time once the app has its
   * own domain; until then it falls back to wherever it is served, so a share always
   * resolves instead of pointing at a domain that does not exist yet.
   */
  url: String(rawUrl).replace(/\/+$/, ""),
  /** Contact address used by the About page. */
  email: "hello@ohmyalam.com",
  /** CARTO basemap key (inlined at build time by Vite). */
  cartoKey: (typeof import.meta !== "undefined" && import.meta.env?.VITE_CARTO_KEY) || "",
};
