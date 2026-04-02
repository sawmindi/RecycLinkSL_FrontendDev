export const APP_TIME_ZONE = 'Asia/Colombo';

export function getDateLocaleFromLanguage(lang: string | undefined): string {
  if (!lang) return 'en-LK';
  return lang.toLowerCase().startsWith('si') ? 'si-LK' : 'en-LK';
}

export function parseFlexibleDate(value: string | number | Date | null | undefined): Date | null {
  if (value == null || value === '') return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const s = String(value).trim();
  if (!s) return null;
  const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s]|$)/);
  if (ymd) {
    const y = +ymd[1];
    const m = +ymd[2];
    const d = +ymd[3];
    return new Date(y, m - 1, d);
  }
  const t = Date.parse(s);
  if (Number.isNaN(t)) return null;
  return new Date(t);
}

export function formatDisplayDate(value: string | number | Date | null | undefined, locale = 'en-LK'): string {
  const d = parseFlexibleDate(value);
  if (!d) return '—';
  return new Intl.DateTimeFormat(locale, {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatDisplayDateTime(value: string | number | Date | null | undefined, locale = 'en-LK'): string {
  const d = parseFlexibleDate(value);
  if (!d) return '—';
  return new Intl.DateTimeFormat(locale, {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}

export function formatWeekdayLong(value: string | number | Date | null | undefined, locale = 'en-LK'): string {
  const d = parseFlexibleDate(value);
  if (!d) return '—';
  return new Intl.DateTimeFormat(locale, {
    timeZone: APP_TIME_ZONE,
    weekday: 'long',
  }).format(d);
}

export function formatScheduleSlotDateLong(value: string | number | Date | null | undefined, locale = 'en-LK'): string {
  const d = parseFlexibleDate(value);
  if (!d) return '—';
  return new Intl.DateTimeFormat(locale, {
    timeZone: APP_TIME_ZONE,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

/** e.g. "Wed, 1 Apr" for route cards */
export function formatShortWeekdayDate(value: string | number | Date | null | undefined, locale = 'en-LK'): string {
  const d = parseFlexibleDate(value);
  if (!d) return '—';
  return new Intl.DateTimeFormat(locale, {
    timeZone: APP_TIME_ZONE,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

/** Month label + day number for small calendar badges */
export function formatDayMonthBadge(
  value: string | number | Date | null | undefined,
  locale = 'en-LK'
): { month: string; day: string } {
  const d = parseFlexibleDate(value);
  if (!d) return { month: '—', day: '—' };
  return {
    month: new Intl.DateTimeFormat(locale, { timeZone: APP_TIME_ZONE, month: 'short' }).format(d),
    day: new Intl.DateTimeFormat(locale, { timeZone: APP_TIME_ZONE, day: 'numeric' }).format(d),
  };
}

/** Normalize API values like `2026-04-01T17:49:06.515Z` to `YYYY-MM-DD` for forms and lists */
export function normalizeApiDateOnly(raw: unknown): string {
  if (raw == null || raw === '') return '';
  if (typeof raw === 'number') {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
  }
  const s = String(raw).trim();
  if (!s) return '';
  if (s.includes('T')) return s.slice(0, 10);
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

/** Normalize time to HH:mm from `17:49:06` or ISO datetime */
export function normalizeScheduleTime(raw: unknown): string {
  if (raw == null) return '';
  const s = String(raw).trim();
  if (!s) return '';
  if (s.includes('T')) {
    const part = s.split('T')[1] ?? '';
    const hms = part.replace(/Z$/i, '').split(/[.+]/)[0] ?? '';
    const [hh, mm] = hms.split(':');
    if (hh != null && mm != null && hh !== '') return `${hh.padStart(2, '0')}:${mm.padStart(2, '0')}`;
  }
  const m = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (m) return `${m[1].padStart(2, '0')}:${m[2]}`;
  return s;
}

export function formatDisplayTimeHm(value: string | null | undefined, locale = 'en-LK'): string {
  const n = normalizeScheduleTime(value ?? '');
  if (!n) return '—';
  const [a, b] = n.split(':');
  const hh = parseInt(a ?? '', 10);
  const mm = parseInt(b ?? '', 10);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return String(value);
  const d = new Date(2000, 0, 1, hh, mm, 0, 0);
  return new Intl.DateTimeFormat(locale, {
    timeZone: APP_TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}

/** If value looks like an ISO/API datetime, format it; otherwise return as-is (e.g. demo i18n strings). */
export function formatSmartDateTime(value: string | undefined | null, locale = 'en-LK'): string {
  if (value == null || !String(value).trim()) return '—';
  const s = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}/.test(s) && !s.includes('T')) return s;
  const formatted = formatDisplayDateTime(s, locale);
  return formatted === '—' ? s : formatted;
}
