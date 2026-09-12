import { describe, expect, it } from "vitest";
import { shareCaption } from "../src/lib/sharecard.js";
import { airSharePayload, quakeSharePayload } from "../src/lib/share.js";

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

  it("captions a quake as a magnitude, never as an AQI", () => {
    const c = shareCaption(quakeSharePayload({ place: "Lospalos", magnitude: 5.3, magType: "mb", depth: 10, word: "Strong", color: "#b3491a", when: "3h ago" }));
    expect(c).toContain("M 5.3 Strong");
    expect(c).not.toContain("AQI");
    expect(c).toContain("10 km deep");
  });

  it("omits depth and magType rather than printing holes", () => {
    const c = shareCaption(quakeSharePayload({ place: "Off Sumatra", magnitude: 5 }));
    expect(c).toContain("Off Sumatra");
    expect(c).not.toContain("undefined");
    expect(c).not.toContain("km deep");
  });
});
