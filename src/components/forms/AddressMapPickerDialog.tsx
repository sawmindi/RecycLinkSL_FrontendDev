import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, MapPin, Navigation, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { ensureLeafletLoaded, createThemeMapPinIcon } from '../../lib/leafletCdn';
import {
  nominatimReverseToAddress,
  nominatimSearchOne,
  nominatimSearchSriLanka,
  type NominatimSearchHit,
} from '../../lib/nominatimGeocode';
import { toast } from 'react-toastify';

export type AddressPickResult = {
  address: string;
  latitude: number;
  longitude: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAddress?: string;
  areaHint?: string;
  onConfirm: (result: AddressPickResult) => void;
};

const DEFAULT_SL: [number, number] = [7.8731, 80.7718];
const DEFAULT_ZOOM = 7;

async function openMeteoCenterLK(name: string): Promise<{ lat: number; lon: number } | null> {
  const q = name.trim();
  if (q.length < 2) return null;
  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&country_code=LK&format=json`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { results?: Array<{ latitude: number; longitude: number }> };
    const r = data.results?.[0];
    if (!r || typeof r.latitude !== 'number' || typeof r.longitude !== 'number') return null;
    return { lat: r.latitude, lon: r.longitude };
  } catch {
    return null;
  }
}

async function waitForMapContainerSize(el: HTMLElement, maxFrames = 60): Promise<void> {
  for (let i = 0; i < maxFrames; i++) {
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (w >= 80 && h >= 80) return;
    await new Promise<void>((r) => requestAnimationFrame(r));
  }
}

export function AddressMapPickerDialog({
  open,
  onOpenChange,
  initialAddress = '',
  areaHint = '',
  onConfirm,
}: Props) {
  const { t } = useTranslation();
  const [mapHostEl, setMapHostEl] = useState<HTMLDivElement | null>(null);
  const mapRef = useRef<{ remove: () => void; setView: (c: [number, number], z: number) => void; invalidateSize: (o?: boolean) => void } | null>(null);
  const markerRef = useRef<{ getLatLng: () => { lat: number; lng: number }; setLatLng: (ll: [number, number]) => void } | null>(null);
  const revTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [addressText, setAddressText] = useState('');
  const [reverseLoading, setReverseLoading] = useState(false);
  const [mapBusy, setMapBusy] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchHits, setSearchHits] = useState<NominatimSearchHit[]>([]);
  const lastSearchAtRef = useRef(0);

  useEffect(() => {
    if (!open) {
      setAddressText('');
      setReverseLoading(false);
      setMapBusy(false);
      setSearchText('');
      setSearchHits([]);
      setSearchLoading(false);
      return;
    }

    setAddressText(initialAddress.trim());
    setSearchText(initialAddress.trim() || areaHint.trim());

    if (!mapHostEl) return;

    const el = mapHostEl;
    let cancelled = false;
    let mapInstance: any = null;
    let markerInstance: any = null;

    const runReverse = async () => {
      if (!markerInstance || cancelled) return;
      const ll = markerInstance.getLatLng();
      setReverseLoading(true);
      const txt = await nominatimReverseToAddress(ll.lat, ll.lng);
      if (!cancelled) {
        if (txt) setAddressText(txt);
        setReverseLoading(false);
      }
    };

    const scheduleReverse = () => {
      if (revTimerRef.current) clearTimeout(revTimerRef.current);
      revTimerRef.current = setTimeout(() => {
        void runReverse();
      }, 650);
    };

    const boot = async () => {
      setMapBusy(true);
      setSearchHits([]);
      try {
        await ensureLeafletLoaded();
      } catch {
        if (!cancelled) {
          toast.error(t('auth.addressPickerMapLoadError'));
          setMapBusy(false);
        }
        return;
      }
      if (cancelled || !el.isConnected) return;

      await waitForMapContainerSize(el);
      if (cancelled || !el.isConnected) return;

      const L = (window as Window & { L?: any }).L;
      if (!L) {
        toast.error(t('auth.addressPickerMapLoadError'));
        setMapBusy(false);
        return;
      }

      el.replaceChildren();
      mapInstance = L.map(el, {
        zoomControl: true,
        attributionControl: true,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap',
      }).addTo(mapInstance);

      const pinIcon = createThemeMapPinIcon(L);

      let center: [number, number] = DEFAULT_SL;
      let zoom = DEFAULT_ZOOM;
      let hadSearchHit = false;

      if (initialAddress.trim()) {
        const hit = await nominatimSearchOne(initialAddress);
        if (!cancelled && hit) {
          center = [hit.lat, hit.lon];
          zoom = 16;
          setAddressText(hit.displayName);
          hadSearchHit = true;
        }
      }

      if (zoom === DEFAULT_ZOOM && areaHint.trim()) {
        const c = await openMeteoCenterLK(areaHint);
        if (!cancelled && c) {
          center = [c.lat, c.lon];
          zoom = 11;
        }
      }

      mapInstance.setView(center, zoom);
      markerInstance = L.marker(center, { draggable: true, icon: pinIcon }).addTo(mapInstance);
      mapRef.current = mapInstance;
      markerRef.current = markerInstance;

      markerInstance.on('dragend', scheduleReverse);
      mapInstance.on('click', (e: { latlng: { lat: number; lng: number } }) => {
        markerInstance.setLatLng([e.latlng.lat, e.latlng.lng]);
        scheduleReverse();
      });

      if (!hadSearchHit) {
        await runReverse();
      }

      const fixSize = () => {
        try {
          mapInstance.invalidateSize({ animate: false });
        } catch {
          /* ignore */
        }
      };
      mapInstance.whenReady(() => {
        fixSize();
        requestAnimationFrame(fixSize);
        window.setTimeout(fixSize, 100);
        window.setTimeout(fixSize, 300);
        window.setTimeout(fixSize, 600);
      });

      if (!cancelled) setMapBusy(false);
    };

    void boot();

    return () => {
      cancelled = true;
      if (revTimerRef.current) clearTimeout(revTimerRef.current);
      mapRef.current = null;
      markerRef.current = null;
      if (mapInstance) mapInstance.remove();
    };
  }, [open, mapHostEl, initialAddress, areaHint, t]);

  const runPlaceSearch = async () => {
    const q = searchText.trim();
    if (!q) {
      toast.info(t('auth.addressPickerSearchNeedQuery'));
      return;
    }
    const now = Date.now();
    const elapsed = now - lastSearchAtRef.current;
    if (elapsed < 1100) {
      toast.info(t('auth.addressPickerSearchSlowDown'));
      return;
    }
    lastSearchAtRef.current = now;

    setSearchLoading(true);
    setSearchHits([]);
    try {
      const hits = await nominatimSearchSriLanka(q, 8);
      setSearchHits(hits);
      if (hits.length === 0) toast.info(t('auth.addressPickerSearchNoResults'));
    } finally {
      setSearchLoading(false);
    }
  };

  const applySearchHit = (hit: NominatimSearchHit) => {
    const map = mapRef.current as any;
    const marker = markerRef.current as any;
    if (!map || !marker) return;
    const { lat, lon } = hit;
    marker.setLatLng([lat, lon]);
    map.setView([lat, lon], 16);
    setAddressText(hit.displayName);
    setSearchHits([]);
    if (revTimerRef.current) clearTimeout(revTimerRef.current);
    revTimerRef.current = setTimeout(async () => {
      setReverseLoading(true);
      const txt = await nominatimReverseToAddress(lat, lon);
      if (txt) setAddressText(txt);
      setReverseLoading(false);
    }, 400);
    try {
      map.invalidateSize({ animate: false });
    } catch {
      /* ignore */
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      toast.error(t('auth.addressPickerNoGeolocation'));
      return;
    }
    const map = mapRef.current as any;
    const marker = markerRef.current as any;
    if (!map || !marker) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        marker.setLatLng([lat, lng]);
        map.setView([lat, lng], 16);
        if (revTimerRef.current) clearTimeout(revTimerRef.current);
        revTimerRef.current = setTimeout(async () => {
          setReverseLoading(true);
          const txt = await nominatimReverseToAddress(lat, lng);
          if (txt) setAddressText(txt);
          setReverseLoading(false);
        }, 400);
      },
      () => {
        toast.error(t('auth.addressPickerLocationDenied'));
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleConfirm = () => {
    const marker = markerRef.current;
    if (!marker) return;
    const ll = marker.getLatLng();
    const trimmed = addressText.trim();
    if (!trimmed) {
      toast.error(t('auth.addressPickerNeedAddress'));
      return;
    }
    onConfirm({
      address: trimmed,
      latitude: ll.lat,
      longitude: ll.lng,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-slot="address-map-picker"
        className="address-map-picker-dialog z-[200] flex max-h-[min(92vh,800px)] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl"
      >
        <DialogHeader className="shrink-0 px-5 pt-5 pb-2 sm:px-6">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <MapPin className="h-5 w-5 text-teal-700" aria-hidden />
            {t('auth.addressPickerTitle')}
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-2 sm:px-6">
          <p className="text-sm text-gray-600">{t('auth.addressPickerHelp')}</p>

          <div className="mt-4 space-y-2">
            <Label htmlFor="address-map-search" className="text-sm font-medium">
              {t('auth.addressPickerSearchLabel')}
            </Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="address-map-search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder={t('auth.addressPickerSearchPlaceholder')}
                className="h-10 flex-1"
                disabled={!open || mapBusy}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void runPlaceSearch();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                className="h-10 shrink-0 gap-1.5 sm:w-auto"
                disabled={!open || mapBusy || searchLoading}
                onClick={() => void runPlaceSearch()}
              >
                {searchLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Search className="h-4 w-4" aria-hidden />
                )}
                {t('auth.addressPickerSearch')}
              </Button>
            </div>
            <p className="text-xs text-gray-500">{t('auth.addressPickerSearchHint')}</p>

            {searchHits.length > 0 && (
              <ul
                className="max-h-36 overflow-y-auto rounded-md border border-gray-200 bg-white text-sm shadow-sm"
                role="listbox"
                aria-label={t('auth.addressPickerSearchResultsLabel')}
              >
                {searchHits.map((hit, i) => (
                  <li key={`${hit.lat}-${hit.lon}-${i}`} role="option">
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left hover:bg-teal-50 disabled:opacity-50"
                      disabled={mapBusy}
                      onClick={() => applySearchHit(hit)}
                    >
                      {hit.displayName}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleUseLocation}
              disabled={!open || mapBusy}
            >
              <Navigation className="h-4 w-4" aria-hidden />
              {t('auth.addressPickerUseLocation')}
            </Button>
            {reverseLoading && (
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                {t('auth.addressPickerFormatting')}
              </span>
            )}
          </div>

          <div
            ref={setMapHostEl}
            className="relative z-0 mt-3 h-[min(48vh,360px)] min-h-[240px] w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
          />
          {mapBusy && (
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {t('auth.addressPickerLoadingMap')}
            </div>
          )}
        </div>

        <div className="shrink-0 space-y-2 border-t border-gray-100 px-5 py-4 sm:px-6">
          <Label htmlFor="address-picker-text">{t('auth.addressPickerFormattedLabel')}</Label>
          <Textarea
            id="address-picker-text"
            value={addressText}
            onChange={(e) => setAddressText(e.target.value)}
            rows={4}
            className="resize-y text-sm"
            placeholder={t('auth.addressPickerFormattedPlaceholder')}
          />
          <p className="text-xs text-gray-500">{t('auth.addressPickerEditHint')}</p>
        </div>

        <DialogFooter className="shrink-0 flex flex-row gap-2 border-t border-gray-100 px-5 py-4 sm:px-6">
          <Button type="button" variant="outline" className="flex-1 sm:flex-none" onClick={() => onOpenChange(false)}>
            {t('profile.cancel')}
          </Button>
          <Button
            type="button"
            className="flex-1 bg-teal-700 hover:bg-teal-800 sm:flex-none"
            onClick={handleConfirm}
            disabled={mapBusy}
          >
            {t('auth.addressPickerConfirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
