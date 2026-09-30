// One-tap shareable card, drawn on a <canvas> (no server, no image deps).
// Shares as a PNG via the Web Share API where available (mobile → WhatsApp,
// Telegram, etc.) and falls back to a download on desktop.
const W = 1080;
const H = 1080;

import { SITE } from "../core/config.js";

function wrap(ctx, text, x, y, maxW, lineH) {
  const words = String(text || "").split(/\s+/);
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y);
      y += lineH;
      line = w;
    } else line = test;
  }
  if (line) ctx.fillText(line, x, y);
  return y;
}

/**
 * Draw the share card and return the canvas. `d` is any lib/share.js paylod:
 * { place, headline, valueLabel, band, tip, extra, footer, color }. Same payload drives
 * both the friendly text and the image, so what you preview is what sends.
 */
function drawCard(d) {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const x = c.getContext("2d");
  const color = d.color || "#c14a1f";

  x.fillStyle = "#fbf8f3";
  x.fillRect(0, 0, W, H);
  x.fillStyle = color;
  x.fillRect(0, 0, W, 14);

  x.textBaseline = "alphabetic";
  x.fillStyle = "#242628";
  x.font = "800 46px system-ui, -apple-system, Segoe UI, sans-serif";
  x.fillText("OhAlam", 72, 130);
  x.fillStyle = "#c14a1f";
  x.fillText(".", 72 + x.measureText("OhAlam").width, 130);

  // Place (top left, under the wordmark).
  x.fillStyle = "#6b6258";
  x.font = "400 42px system-ui, sans-serif";
  let y = wrap(x, d.place || "", 72, 196, W - 144, 56);

  // The headline number/statement.
  const big = d.valueLabel || d.headline || "";
  x.fillStyle = color;
  x.font = "800 92px system-ui, sans-serif";
  y = wrap(x, String(big).slice(0, 18), 72, y + 90, W - 144, 96) + 8;

  // Band under the number, e.g. "Unhealthy" / "Warning".
  if (d.band) {
    x.fillStyle = color;
    x.font = "700 54px system-ui, sans-serif";
    y = wrap(x, String(d.band), 72, y, W - 144, 62) + 14;
  }

  // Context headline when a separate value is shown (e.g. "Overcast, 28°" on the air card).
  if (d.valueLabel && d.headline) {
    x.fillStyle = "#242628";
    x.font = "600 46px system-ui, sans-serif";
    y = wrap(x, String(d.headline), 72, y + 10, W - 144, 58);
  }

  // The gentle tip / guidance.
  if (d.tip) {
    x.fillStyle = "#6b6258";
    x.font = "400 40px system-ui, sans-serif";
    y = wrap(x, String(d.tip), 72, y + 46, W - 144, 54);
  }

  // Extra context (worst spot, event count, etc.).
  if (d.extra) {
    x.fillStyle = "#8a8277";
    x.font = "400 34px system-ui, sans-serif";
    wrap(x, String(d.extra), 72, 824, W - 144, 44);
  }

  // Footer link.
  x.fillStyle = "#b9b0a4";
  x.font = "400 30px system-ui, sans-serif";
  wrap(x, d.footer || "OhAlam · Malaysia air, weather & hazards", 72, H - 60, W - 144, 40);
  return c;
}

/** Render then share (or download). Returns "shared" | "downloaded" | "cancelled". */
/**
 * The share caption, composed from the same data the card is drawn from.
 *
 * Without this the share produced a bare image with no message, which is what made
 * an existing feature look like a missing one. The link is the live origin, so it
 * stays correct when the app moves to its own domain.
 */
export function shareCaption(d) {
  const where = [d.town, d.state].filter(Boolean).join(", ");
  const bits = [];
  if (d.value != null) {
    const shown = d.unit === "M" ? Number(d.value).toFixed(1) : Math.round(d.value);
    bits.push(`${d.unit ?? "AQI"} ${shown}${d.band ? ` ${d.band}` : ""}`);
  }
  if (d.temp != null) bits.push(`${d.temp}°${d.cond ? ` ${d.cond}` : ""}`);
  else if (d.cond) bits.push(d.cond);
  if (d.advice) bits.push(d.advice);
  const link = SITE.url;
  const date = new Date().toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  const body = [where, bits.join(", ")].filter(Boolean).join(": ");
  return link ? `${body}\n${date}\n${link}` : body;
}

/** A pre-filled social share intent (open in a new tab). */
export function shareIntent(service, text) {
  const t = encodeURIComponent(text || "").slice(0, 2000);
  switch (service) {
    case "wa": return `https://wa.me/?text=${t}`;
    case "x": return `https://twitter.com/intent/tweet?text=${t}`;
    case "fb": return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE.url)}&quote=${t}`;
    case "t": return `https://t.me/share/url?url=${encodeURIComponent(SITE.url)}&text=${t}`;
  }
  return "";
}

/** Share just the message: right for a warning that is going into a family chat. */
export async function shareText(d) {
  const text = d.text || shareCaption(d);
  const title = `OhAlam — ${d.town ?? "Malaysia"}`;
  if (typeof navigator !== "undefined" && navigator.share) {
    try { await navigator.share({ title, text }); return; } catch { /* dismissed */ }
  }
  try { await navigator.clipboard.writeText(text); } catch { /* nothing else to do */ }
}

export async function shareCard(d) {
  const canvas = drawCard(d);
  const blob = await new Promise((r) => canvas.toBlob(r, "image/png"));
  if (!blob) return "cancelled";
  const file = new File([blob], "alam.png", { type: "image/png" });
  if (navigator.canShare?.({ files: [file] }) && navigator.share) {
    try {
      // A share with no message is just an image; always carry the numbers.
      await navigator.share({ files: [file], title: `OhAlam — ${d.town ?? "Malaysia"}`, text: d.text || shareCaption(d) });
      return "shared";
    } catch (e) {
      if (e?.name === "AbortError") return "cancelled";
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "alam.png";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return "downloaded";
}
