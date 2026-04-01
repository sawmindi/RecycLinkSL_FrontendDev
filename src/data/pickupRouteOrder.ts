import citiesData from "./cities.json";

type CouncilBlock = { name: string; mainCities: string[] };

type DistrictRow = {
  district: string;
  municipalCouncils: CouncilBlock[];
  urbanCouncils: CouncilBlock[];
  pradeshiyaSabhas: CouncilBlock[];
};

export function getMainCityRouteOrderForCouncil(councilArea: string): string[] | null {
  const key = councilArea.trim();
  if (!key) return null;
  const districts = citiesData as DistrictRow[];

  for (const d of districts) {
    for (const ps of d.pradeshiyaSabhas ?? []) {
      const qualified = `${ps.name} (${d.district})`;
      if (key === ps.name || key === qualified) {
        return [...(ps.mainCities ?? [])];
      }
    }
  }

  return null;
}

function normalizeCitizenAreaForMatch(area: string): string {
  const t = area.trim();
  const paren = t.indexOf("(");
  if (paren > 0) return t.slice(0, paren).trim().toLowerCase();
  return t.toLowerCase();
}

function mainCitySortIndex(citizenArea: string, routeOrder: string[]): number {
  const n = normalizeCitizenAreaForMatch(citizenArea);
  for (let i = 0; i < routeOrder.length; i++) {
    if (routeOrder[i].trim().toLowerCase() === n) return i;
  }
  return routeOrder.length;
}

export function sortPickupCitizensByMainCityRoute<T extends { area: string }>(
  citizens: T[],
  councilArea: string
): T[] {
  const order = getMainCityRouteOrderForCouncil(councilArea);
  if (!order?.length) return [...citizens];

  return [...citizens].sort((a, b) => {
    const ia = mainCitySortIndex(a.area, order);
    const ib = mainCitySortIndex(b.area, order);
    if (ia !== ib) return ia - ib;
    return a.area.localeCompare(b.area, undefined, { sensitivity: "base" });
  });
}
