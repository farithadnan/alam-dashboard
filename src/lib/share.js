import { wmo, numColor } from "./flags.js";
import { tr, bandLabel, bandAdvice, wmoLabel } from "./i18n.svelte.js";
import { SITE } from "./config.js";

/**
 * Build the share payload from the rows every view already holds.
 *
 * Both the Home and Weather share buttons were assembling this object separately and
 * had drifted (one labelled, one not). One builder means the payload — and therefore
 * the shared card and caption — is identical wherever the button lives.
 */
/**
 * A forwardable warning: plain text, not a card. This is the thing people actually
 * send to family, so it carries the full bulletin and the link in one message.
 */
export function warningSharePayload({ title, text, when }) {
  const body = String(text || "").replace(/\s+/g, " ").trim();
  return { town: title, text: [title, when, body, SITE.url].filter(Boolean).join("\n") };
}

/** A share payload for an AQI station: the hero of the Air view. */
export function airSharePayload({ station, state, value, band, color, advice = "" }) {
  return { town: station, state, unit: "AQI", value, band, color, temp: null, cond: "", advice };
}

export function sharePayload({ town, state, now, townAir, air }) {
  const [, label] = now?.meta?.code != null ? wmo(String(now.meta.code)) : [null, null];
  return {
    town,
    state,
    value: townAir?.value ?? air?.value ?? null,
    band: townAir ? bandLabel(townAir.band?.label) : air ? "US AQI" : "",
    color: townAir ? numColor(townAir.band?.label) : "#c14a1f",
    temp: now ? Math.round(now.value) : null,
    cond: label ? wmoLabel(label) : "",
    advice: townAir ? bandAdvice(townAir.band?.label) : now ? `${tr("feels")} ${Math.round(now.meta?.apparentTemp ?? now.value ?? 0)}°` : "",
  };
}
