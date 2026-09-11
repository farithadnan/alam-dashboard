/**
 * MET official forecast — match a town to its district.
 *
 * MET covers 170 districts; our locations are towns, and a city is often not a
 * district of the same name (Alor Setar sits in Kota Setar). Matching used to
 * fall back to the first district in the list, which silently showed another
 * place's forecast. Now it returns null instead: no district, no forecast.
 */

/** Towns whose name does not match their MET district. */
export const TOWN_DISTRICT = {
  "alor setar": "Kota Setar",
  "shah alam": "Petaling",
  "petaling jaya": "Petaling",
  "subang jaya": "Petaling",
  "kangar": "Perlis",
  "kota bharu": "Kota Bharu",
  "george town": "Northeast Penang Island",
  "sungai petani": "Kuala Muda",
  "alor gajah": "Alor Gajah",
  "bandar seri begawan": null,
};

/** The district row for a town, or null when it cannot be resolved. */
export function districtFor(rows = [], townName = "") {
  const t = String(townName || "").trim().toLowerCase();
  if (!rows.length || !t) return null;
  const exact = rows.find((r) => r.district?.toLowerCase() === t);
  if (exact) return exact;
  const alias = TOWN_DISTRICT[t];
  if (alias) return rows.find((r) => r.district?.toLowerCase() === alias.toLowerCase()) ?? null;
  return rows.find((r) => {
    const d = r.district?.toLowerCase();
    return d && (t.includes(d) || d.includes(t));
  }) ?? null;
}
