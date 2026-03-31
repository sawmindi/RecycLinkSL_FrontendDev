import citiesData from "./cities.json";

type CouncilBlock = { name: string; mainCities: string[] };

type DistrictRow = {
  district: string;
  municipalCouncils: CouncilBlock[];
  urbanCouncils: CouncilBlock[];
  pradeshiyaSabhas: CouncilBlock[];
};

export type MainCityOption = {
  /** Sent to API as citizen `area` */
  value: string;
  label: string;
  district: string;
  councilName: string;
  city: string;
};

type FlatRow = { city: string; district: string; councilName: string };

function flattenMainCities(): FlatRow[] {
  const rows: FlatRow[] = [];
  const districts = citiesData as DistrictRow[];

  const addFrom = (district: string, councils: CouncilBlock[] | undefined) => {
    for (const c of councils ?? []) {
      for (const raw of c.mainCities ?? []) {
        const city = String(raw).trim();
        if (city) rows.push({ city, district, councilName: c.name });
      }
    }
  };

  for (const d of districts) {
    addFrom(d.district, d.municipalCouncils);
    addFrom(d.district, d.urbanCouncils);
    addFrom(d.district, d.pradeshiyaSabhas);
  }

  return rows;
}

function dedupeRows(rows: FlatRow[]): FlatRow[] {
  const seen = new Set<string>();
  const out: FlatRow[] = [];
  for (const r of rows) {
    const k = `${r.district}\0${r.councilName}\0${r.city}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
  }
  return out;
}

function buildMainCityOptions(): MainCityOption[] {
  const rows = dedupeRows(flattenMainCities());
  const cityNameCount = new Map<string, number>();
  for (const r of rows) {
    cityNameCount.set(r.city, (cityNameCount.get(r.city) ?? 0) + 1);
  }

  const withProposed = rows.map((r) => {
    const ambiguousCity = (cityNameCount.get(r.city) ?? 0) > 1;
    const value = ambiguousCity ? `${r.city} (${r.councilName})` : r.city;
    return { r, value };
  });

  const valueCount = new Map<string, number>();
  for (const { value } of withProposed) {
    valueCount.set(value, (valueCount.get(value) ?? 0) + 1);
  }

  const options: MainCityOption[] = withProposed.map(({ r, value }) => {
    const clash = (valueCount.get(value) ?? 0) > 1;
    const finalValue = clash ? `${r.city} (${r.councilName}, ${r.district})` : value;
    const label = `${r.city} — ${r.councilName} — ${r.district}`;
    return {
      value: finalValue,
      label,
      district: r.district,
      councilName: r.councilName,
      city: r.city,
    };
  });

  const seenVal = new Set<string>();
  const unique = options.filter((o) => {
    if (seenVal.has(o.value)) return false;
    seenVal.add(o.value);
    return true;
  });

  unique.sort((a, b) => a.label.localeCompare(b.label));
  return unique;
}

/** All main cities from Municipal / Urban / Pradeshiya Sabha lists in `cities.json`. */
export const MAIN_CITY_OPTIONS = buildMainCityOptions();

export const MAIN_CITY_VALUE_SET = new Set(MAIN_CITY_OPTIONS.map((o) => o.value));
