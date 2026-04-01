export const LEAFLET_CSS_ID = 'leaflet-cdn-css';
export const LEAFLET_JS_ID = 'leaflet-cdn-js';

let leafletReadyPromise: Promise<void> | null = null;

async function waitForLeafletGlobal(maxMs = 15000): Promise<void> {
  const start = Date.now();
  while (!(window as Window & { L?: unknown }).L) {
    if (Date.now() - start > maxMs) throw new Error('Leaflet load timeout');
    await new Promise((r) => setTimeout(r, 50));
  }
}

export function ensureLeafletLoaded(): Promise<void> {
  if ((window as Window & { L?: unknown }).L) return Promise.resolve();
  if (!leafletReadyPromise) {
    leafletReadyPromise = (async () => {
      if (!document.getElementById(LEAFLET_CSS_ID)) {
        const link = document.createElement('link');
        link.id = LEAFLET_CSS_ID;
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }
      if (!document.getElementById(LEAFLET_JS_ID)) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.id = LEAFLET_JS_ID;
          script.src = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => {
            script.remove();
            reject(new Error('Leaflet failed to load'));
          };
          document.body.appendChild(script);
        });
      }
      await waitForLeafletGlobal();
    })().catch((e) => {
      leafletReadyPromise = null;
      throw e;
    });
  }
  return leafletReadyPromise;
}

export function fixLeafletDefaultIcons(L: { Icon: { Default: { mergeOptions: (o: object) => void } } }): void {
  try {
    const base = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/images';
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: `${base}/marker-icon-2x.png`,
      iconUrl: `${base}/marker-icon.png`,
      shadowUrl: `${base}/marker-shadow.png`,
    });
  } catch {
    /* ignore */
  }
}
const THEME_PIN = {
  fill: '#0f7669',
  stroke: '#115e59',
  inner: '#ecfdf5',
} as const;

type LeafletDivIconFactory = {
  divIcon: (options: {
    html: string;
    className?: string;
    iconSize: [number, number];
    iconAnchor: [number, number];
    popupAnchor?: [number, number];
  }) => unknown;
};

export function createThemeMapPinIcon(L: LeafletDivIconFactory): unknown {
  const { fill, stroke, inner } = THEME_PIN;
  const html =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="30" height="40" aria-hidden="true" focusable="false" style="display:block">` +
    `<path fill="${fill}" stroke="${stroke}" stroke-width="1.1" stroke-linejoin="round" d="M12 1.5c-4.42 0-8 3.58-8 8 0 5.5 8 19.2 8 19.2s8-13.7 8-19.2c0-4.42-3.58-8-8-8z"/>` +
    `<circle fill="${inner}" cx="12" cy="9.5" r="3.3"/>` +
    `</svg>`;

  return L.divIcon({
    className: 'recyclink-leaflet-pin',
    html,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -38],
  });
}
