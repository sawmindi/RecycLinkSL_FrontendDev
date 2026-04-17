const NOMINATIM_EMAIL = 'recyclinksl-app@example.com';

const NOMINATIM_HEADERS: HeadersInit = {
  Accept: 'application/json',
};

export type NominatimSearchHit = { lat: number; lon: number; displayName: string };

export async function nominatimSearchSriLanka(
  query: string,
  limit = 8
): Promise<NominatimSearchHit[]> {
  const q = query.trim();
  if (!q) return [];
  const n = Math.min(Math.max(limit, 1), 10);
  const params = new URLSearchParams({
    q,
    format: 'jsonv2',
    limit: String(n),
    addressdetails: '1',
    email: NOMINATIM_EMAIL,
    countrycodes: 'lk',
  });
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: NOMINATIM_HEADERS,
    });
    if (!res.ok) return [];
    const body = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name?: string;
    }>;
    if (!Array.isArray(body)) return [];
    const out: NominatimSearchHit[] = [];
    for (const row of body) {
      const lat = Number(row.lat);
      const lon = Number(row.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
      out.push({ lat, lon, displayName: row.display_name ?? `${lat}, ${lon}` });
    }
    return out;
  } catch {
    return [];
  }
}

export async function nominatimSearchOne(query: string): Promise<NominatimSearchHit | null> {
  const hits = await nominatimSearchSriLanka(query, 1);
  return hits[0] ?? null;
}

export async function nominatimReverseToAddress(lat: number, lon: number): Promise<string> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    format: 'jsonv2',
    email: NOMINATIM_EMAIL,
    zoom: '18',
    addressdetails: '1',
  });
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
      headers: NOMINATIM_HEADERS,
    });
    if (!res.ok) return '';
    const data = (await res.json()) as { display_name?: string };
    return (data.display_name ?? '').trim();
  } catch {
    return '';
  }
}
