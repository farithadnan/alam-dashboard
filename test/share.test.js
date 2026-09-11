import { describe, expect, it } from "vitest";
import { shareCaption } from "../src/lib/sharecard.js";

describe("shareCaption — the message that travels with the card", () => {
  it("leads with the place, then the numbers", () => {
    const t = shareCaption({ town: "Pasir Gudang", state: "Johor", value: 128, band: "Unhealthy", temp: 31, cond: "Thunderstorms" });
    expect(t).toContain("Pasir Gudang, Johor");
    expect(t).toContain("AQI 128 Unhealthy");
    expect(t).toContain("31° Thunderstorms");
  });

  it("omits anything it does not have rather than printing blanks", () => {
    expect(shareCaption({ town: "Arau" })).toBe("Arau");
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
