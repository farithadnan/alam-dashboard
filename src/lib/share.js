import { numColor } from "./flags.js";
import { wmo } from "./weather-codes.js";
import { tr, bandLabel, bandAdvice, wmoLabel } from "./i18n.svelte.js";
import { SITE } from "./config.js";
import { shareCaption, shareIntent } from "./sharecard.js";

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

const slug = (s) =>
  String(s ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

/**
 * A Telegram deep link that opens the bot pre-subscribed to a town + state. The bot
 * parses /start loc_<town>_<state> and resolves the place itself, so the dashboard
 * never has to duplicate the locality registry. Empty when there is no state to open.
 */
export function telegramAlertsUrl(town, state) {
  const st = slug(state);
  if (!town || !st) return "";
  return `https://t.me/alamalerts_bot?start=loc_${town}_${st}`;
}

/**
 * Every share angle with the EXACT output that would be sent, so the sharing value can be
 * reviewed end-to-end (the "don't skip anything" table). One source of truth with the share
 * popover: same caption, same intents, same card.
 */
export function shareOutlook(payload) {
  const msg = payload?.text || shareCaption(payload);
  const cardNote = payload?.text
    ? "Plain-text bulletin (no card)"
    : `Card PNG (1080×1080). Caption it carries: ${msg}`;
  return [
    { channel: "Share image", icon: "🖼", message: cardNote, link: null },
    { channel: "WhatsApp", icon: "💬", message: msg, link: `https://wa.me/?text=${encodeURIComponent(msg)}` },
    { channel: "X (Twitter)", icon: "𝕏", message: msg, link: shareIntent("x", msg) },
    { channel: "Facebook", icon: "📘", message: msg, link: shareIntent("fb", msg) },
    { channel: "Telegram", icon: "✈️", message: msg, link: shareIntent("t", msg) },
    { channel: "Copy text", icon: "📋", message: msg, link: null },
  ];
}
