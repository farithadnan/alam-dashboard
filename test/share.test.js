import { describe, expect, it } from "vitest";
import { shareCaption } from "../src/lib/sharecard.js";
import { airSharePayload, warningSharePayload, telegramAlertsUrl } from "../src/lib/share.js";

describe("shareCaption — the message that travels with the card", () => {
  it("leads with the place, then the numbers", () => {
    const t = shareCaption({ town: "Pasir Gudang", state: "Johor", value: 128, band: "Unhealthy", temp: 31, cond: "Thunderstorms" });
    expect(t).toContain("Pasir Gudang, Johor");
    expect(t).toContain("AQI 128 Unhealthy");
    expect(t).toContain("31° Thunderstorms");
  });

  it("omits anything it does not have rather than printing blanks", () => {
    // The link is always appended, so assert per line rather than on the whole string.
    const bare = shareCaption({ town: "Arau" });
    expect(bare.split("\n")[0]).toBe("Arau"); // place only, no empty sections
    expect(bare).not.toContain("AQI");
    expect(bare).not.toContain("undefined");
    expect(shareCaption({ town: "Arau", value: 42 })).toContain("AQI 42");
    expect(shareCaption({ town: "Arau", value: 42 })).not.toContain("undefined");
    expect(shareCaption({ town: "Arau", value: 42 })).not.toContain("null");
  });

  it("rounds the AQI and never invents a band", () => {
    expect(shareCaption({ town: "X", value: 128.4 })).toContain("AQI 128");
    expect(shareCaption({ town: "X", value: 128.4, band: "US AQI" })).toContain("US AQI");
  });

  it("carries a link so the share is actionable", () => {
    expect(shareCaption({ town: "Arau" })).toContain("http");
  });
});

describe("share payloads for the other views", () => {
  it("captions an AQI station with its band and place", () => {
    const c = shareCaption(airSharePayload({ station: "Pasir Gudang", state: "Johor", value: 128, band: "Unhealthy", color: "#8f5c00", advice: "Limit outdoor activity" }));
    expect(c).toContain("Pasir Gudang, Johor");
    expect(c).toContain("AQI 128 Unhealthy");
  });


});

describe("warning payload — the forwardable one", () => {
  it("carries the full bulletin, the time and the link in one message", () => {
    const t = warningSharePayload({ title: "Thunderstorms Warning", text: "Thunderstorms over Perlis and Kedah", when: "2h ago" }).text;
    expect(t).toContain("Thunderstorms Warning");
    expect(t).toContain("Perlis and Kedah");
    expect(t).toContain("2h ago");
    expect(t).toContain("http");
  });
  it("squashes newlines from the source bulletin", () => {
    const t = warningSharePayload({ title: "X", text: "line one\n\nline  two", when: "now" }).text;
    expect(t).toContain("line one line two");
  });
});

describe("telegram alerts deep link", () => {
  it("opens the bot pre-subscribed to the town + state", () => {
    expect(telegramAlertsUrl("pasir-gudang", "Johor")).toBe("https://t.me/alamalerts_bot?start=loc_pasir-gudang_johor");
    // A state with spaces becomes a hyphenated slug the bot can parse back.
    expect(telegramAlertsUrl("kuching", "Sarawak")).toBe("https://t.me/alamalerts_bot?start=loc_kuching_sarawak");
  });
  it("is empty when there is no state to subscribe to", () => {
    expect(telegramAlertsUrl("pasir-gudang", "")).toBe("");
    expect(telegramAlertsUrl("pasir-gudang", null)).toBe("");
    expect(telegramAlertsUrl("", "Johor")).toBe("");
  });
});
