/**
 * Domain types, in one place.
 *
 * These describe the shapes the API returns and the app passes around. They are JSDoc
 * so they cost nothing at runtime, and so `npm run typecheck` (checkJs) can use them to
 * catch a misspelled field or a wrong prop — the class of bug that is invisible today.
 *
 * Reference one from a module by importing the name, e.g. write it as
 * "import(\"./types.js\").HazardWarning" in a JSDoc type position.
 */

/**
 * A normalised reading from any source.
 * @typedef {object} Observation
 * @property {string} source            Adapter id, e.g. "doe-eqms" or "open-meteo".
 * @property {string} station           Station or locality slug.
 * @property {string} stationName       Human label.
 * @property {string} measuredAt        Local time, YYYY-MM-DDTHH:MM:SS.
 * @property {string} kind              aqi | weather | quake | climate | forecast | warning | hourly | news | metfc | haze
 * @property {number} value             Primary number for the kind.
 * @property {Record<string, any>} [meta] Source-specific extras.
 */

/**
 * An AQI station as the dashboard consumes it (Observation + what the view derives).
 * @typedef {Observation & {
 *   band?: { label: string, advice?: string },
 *   coords?: { lat: number, lon: number } | null,
 *   trend?: number[],
 * }} Station
 */

/**
 * A weather or air-quality row for a place.
 * @typedef {Observation & { coords?: { lat: number, lon: number } | null }} Place
 */

/**
 * A MET warning as served by /api/hazards.
 * @typedef {object} HazardWarning
 * @property {string} source
 * @property {string} station
 * @property {string} title
 * @property {number} severity
 * @property {string} measuredAt
 * @property {{ type?: string, headingEn?: string, titleBm?: string, textEn?: string, textBm?: string, validTo?: string }} [meta]
 */

/**
 * An earthquake row.
 * @typedef {object} Quake
 * @property {string} stationName   Place description from USGS.
 * @property {number} magnitude
 * @property {string} measuredAt
 * @property {{ depth?: number, magType?: string, tsunami?: number, alert?: string,
 *              mmi?: number, cdi?: number, felt?: number, sig?: number, nst?: number,
 *              status?: string, eqType?: string, lat?: number, lon?: number }} [meta]
 */

/** A town as the summary bundle lists it. @typedef {{ station: string, name: string, state: string }} Town */

/** One day of the haze outlook. @typedef {{ date: string, pm25Max: number, pm25Avg: number|null, aboveGuideline: boolean }} HazeDay */

/**
 * What a share button hands to lib/sharecard.js.
 * @typedef {object} SharePayload
 * @property {string} [town]
 * @property {string} [state]
 * @property {string} [unit]    "AQI" by default, "M" for a magnitude.
 * @property {number|null} [value]
 * @property {string} [band]
 * @property {string} [color]
 * @property {number|null} [temp]
 * @property {string} [cond]
 * @property {string} [advice]
 * @property {string} [text]    Overrides the generated caption (used for warnings).
 */

export {};
