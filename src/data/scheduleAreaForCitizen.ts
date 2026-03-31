import { MAIN_CITY_OPTIONS } from "./mainCities";
import { PRADESHIYA_SABHA_OPTIONS, PRADESHIYA_SABHA_VALUE_SET } from "./pradeshiyaSabhas";

export type ScheduleAreaResolution = {
  queryArea: string;
  profileArea: string;
  scheduleCouncilLabel: string;
  mappedFromMainCity: boolean;
};

function scheduleQueryAreaFromCouncil(councilName: string, district: string): string {
  const inDistrict = PRADESHIYA_SABHA_OPTIONS.filter((p) => p.district === district);
  const exact = inDistrict.find((p) => p.value === councilName);
  if (exact) return exact.value;
  const disambiguated = inDistrict.find((p) => p.value.startsWith(`${councilName} (`));
  if (disambiguated) return disambiguated.value;
  return councilName;
}

function pickBestMainCityOption(city: string): (typeof MAIN_CITY_OPTIONS)[0] | null {
  const matches = MAIN_CITY_OPTIONS.filter((o) => o.city === city);
  if (matches.length === 0) return null;
  if (matches.length === 1) return matches[0];
  const ps = matches.filter((o) => /pradeshiya sabha/i.test(o.councilName));
  if (ps.length === 1) return ps[0];
  return matches[0];
}

export function resolveCitizenAreaForSchedules(profileAreaRaw: string): ScheduleAreaResolution {
  const profileArea = profileAreaRaw.trim();
  const empty: ScheduleAreaResolution = {
    queryArea: "",
    profileArea: "",
    scheduleCouncilLabel: "",
    mappedFromMainCity: false,
  };
  if (!profileArea) return empty;

  if (PRADESHIYA_SABHA_VALUE_SET.has(profileArea)) {
    return {
      queryArea: profileArea,
      profileArea,
      scheduleCouncilLabel: profileArea,
      mappedFromMainCity: false,
    };
  }

  const exact = MAIN_CITY_OPTIONS.find((o) => o.value === profileArea);
  if (exact) {
    const queryArea = scheduleQueryAreaFromCouncil(exact.councilName, exact.district);
    return {
      queryArea,
      profileArea,
      scheduleCouncilLabel: exact.councilName,
      mappedFromMainCity: true,
    };
  }

  const byCity = pickBestMainCityOption(profileArea);
  if (byCity) {
    const queryArea = scheduleQueryAreaFromCouncil(byCity.councilName, byCity.district);
    return {
      queryArea,
      profileArea,
      scheduleCouncilLabel: byCity.councilName,
      mappedFromMainCity: true,
    };
  }

  const paren = profileArea.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (paren) {
    const inner = paren[2].trim();
    if (PRADESHIYA_SABHA_VALUE_SET.has(inner)) {
      return {
        queryArea: inner,
        profileArea,
        scheduleCouncilLabel: inner,
        mappedFromMainCity: false,
      };
    }
    const innerOpt = MAIN_CITY_OPTIONS.find((o) => o.councilName === inner || o.value === inner);
    if (innerOpt) {
      const queryArea = scheduleQueryAreaFromCouncil(innerOpt.councilName, innerOpt.district);
      return {
        queryArea,
        profileArea,
        scheduleCouncilLabel: innerOpt.councilName,
        mappedFromMainCity: true,
      };
    }
  }

  return {
    queryArea: profileArea,
    profileArea,
    scheduleCouncilLabel: profileArea,
    mappedFromMainCity: false,
  };
}
