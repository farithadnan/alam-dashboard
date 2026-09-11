import { describe, expect, it } from "vitest";
import { districtFor } from "../src/lib/official.js";

const rows = [
  { district: "Baling" }, { district: "Kota Setar" }, { district: "Kuala Muda" },
  { district: "Langkawi" }, { district: "Perlis" }, { district: "Petaling" },
];

describe("districtFor — town to MET district", () => {
  it("matches when the town shares the district name", () => {
    expect(districtFor(rows, "Langkawi").district).toBe("Langkawi");
  });
  it("uses the alias table when the city is not its district", () => {
    expect(districtFor(rows, "Alor Setar").district).toBe("Kota Setar");
    expect(districtFor(rows, "Shah Alam").district).toBe("Petaling");
    expect(districtFor(rows, "Kangar").district).toBe("Perlis");
  });
  it("is case-insensitive", () => {
    expect(districtFor(rows, "KUALA MUDA").district).toBe("Kuala Muda");
  });
  it("returns null instead of another district's forecast (the old fallback bug)", () => {
    // would previously have returned rows[0] = Baling
    expect(districtFor(rows, "Alor Star")).toBeNull();
    expect(districtFor(rows, "Nowhere")).toBeNull();
  });
  it("returns null for empty input", () => {
    expect(districtFor([], "Langkawi")).toBeNull();
    expect(districtFor(rows, "")).toBeNull();
  });
});
