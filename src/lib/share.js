import { wmo, numColor } from "./flags.js";
import { tr, bandLabel, bandAdvice, wmoLabel } from "./i18n.svelte.js";

/**
 * Build the share payload from the rows every view already holds.
 *
 * Both the Home and Weather share buttons were assembling this object separately and
 * had drifted (one labelled, one not). One builder means the payload — and therefore
 * the shared card and caption — is identical wherever the button lives.
 */
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
