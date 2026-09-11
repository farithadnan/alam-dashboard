// One-tap shareable card, drawn on a <canvas> (no server, no image deps).
// Shares as a PNG via the Web Share API where available (mobile → WhatsApp,
// Telegram, etc.) and falls back to a download on desktop.
const W = 1080;
const H = 1080;

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

/** Draw the summary card and return the canvas. `d` = { town, state, value, unit, band, color, temp, cond, advice, footnote }. */
export function drawCard(d) {
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
  x.fillText("Alam", 72, 130);
  x.fillStyle = "#c14a1f";
  x.fillText(".", 72 + x.measureText("Alam").width, 130);

  x.fillStyle = "#6b6258";
  x.font = "400 42px system-ui, sans-serif";
  x.fillText(`${d.town}${d.state ? ", " + d.state : ""}`.slice(0, 40), 72, 214);

  if (d.value != null) {
    x.fillStyle = "#8a8277";
    x.font = "600 30px system-ui, sans-serif";
    x.fillText("AIR QUALITY", 74, 300);
    x.fillStyle = color;
    x.font = "800 230px system-ui, sans-serif";
    x.fillText(String(d.value), 68, 470);
    x.font = "700 62px system-ui, sans-serif";
    x.fillText(d.band || "", 76, 556);
  }

  if (d.temp != null) {
    x.fillStyle = "#242628";
    x.font = "600 76px system-ui, sans-serif";
    x.fillText(`${d.temp}°${d.cond ? "  " + d.cond : ""}`, 72, 676);
  }

  x.fillStyle = "#6b6258";
  x.font = "400 42px system-ui, sans-serif";
  wrap(x, d.advice, 72, 792, W - 144, 58);

  x.fillStyle = "#b9b0a4";
  x.font = "400 32px system-ui, sans-serif";
  x.fillText(d.footnote || "Alam · Malaysia air, weather & hazards", 72, H - 56);
  return c;
}

/** Render then share (or download). Returns "shared" | "downloaded" | "cancelled". */
export async function shareCard(d) {
  const canvas = drawCard(d);
  const blob = await new Promise((r) => canvas.toBlob(r, "image/png"));
  if (!blob) return "cancelled";
  const file = new File([blob], "alam.png", { type: "image/png" });
  if (navigator.canShare?.({ files: [file] }) && navigator.share) {
    try {
      await navigator.share({ files: [file], title: "Alam", text: d.text || "" });
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
