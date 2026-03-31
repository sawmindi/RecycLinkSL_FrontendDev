import citiesData from "./cities.json";

type CouncilBlock = { name: string; mainCities: string[] };

type DistrictRow = {
  district: string;
  municipalCouncils: CouncilBlock[];
  urbanCouncils: CouncilBlock[];
  pradeshiyaSabhas: CouncilBlock[];
};

export type PradeshiyaSabhaOption = {
  /** Sent to API as collector `area` */
  value: string;
  label: string;
  district: string;
};

function buildPradeshiyaSabhaOptions(): PradeshiyaSabhaOption[] {
  const rows = citiesData as DistrictRow[];
  const nameCounts = new Map<string, number>();
  for (const row of rows) {
    for (const ps of row.pradeshiyaSabhas ?? []) {
      nameCounts.set(ps.name, (nameCounts.get(ps.name) ?? 0) + 1);
    }
  }
  const out: PradeshiyaSabhaOption[] = [];
  for (const row of rows) {
    for (const ps of row.pradeshiyaSabhas ?? []) {
      const isDup = (nameCounts.get(ps.name) ?? 0) > 1;
      const value = isDup ? `${ps.name} (${row.district})` : ps.name;
      const label = value;
      out.push({ value, label, district: row.district });
    }
  }
  out.sort((a, b) => a.label.localeCompare(b.label));
  return out;
}

/** All Pradeshiya Sabhas from `cities.json` */
export const PRADESHIYA_SABHA_OPTIONS = buildPradeshiyaSabhaOptions();

export const PRADESHIYA_SABHA_VALUE_SET = new Set(PRADESHIYA_SABHA_OPTIONS.map((o) => o.value));
