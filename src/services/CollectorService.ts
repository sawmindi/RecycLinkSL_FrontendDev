import axios from "axios";
import { normalizeApiDateOnly, normalizeScheduleTime } from "../lib/formatDate";
import { Util } from "../Util";
import { AppResponse } from "../models/Response";
import { isApiFailure, networkError, toFailureResponse, toSuccessResponse } from "../util/apiResponse";

async function asApiBody<T>(promise: Promise<T>): Promise<unknown> {
  const v = await promise;
  return v as unknown;
}

function asObjectRecord(raw: unknown): Record<string, unknown> | null {
  if (raw !== null && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return null;
}

function unwrapList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res;
  if (res && typeof res === "object" && "data" in res && Array.isArray((res as { data: T[] }).data)) {
    return (res as { data: T[] }).data;
  }
  return [];
}

function unwrapData<T>(res: unknown): T | null {
  if (res == null) return null;
  if (res && typeof res === "object" && "data" in res) return (res as { data: T }).data as T;
  return res as T;
}

function toId(item: unknown): string {
  if (item == null || typeof item !== "object") return "";
  const o = item as Record<string, unknown>;
  if (typeof o._id === "string") return o._id;
  if (o._id != null) return String(o._id);
  if (typeof o.id === "string") return o.id;
  if (o.id != null) return String(o.id);
  return "";
}

function num(v: unknown): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function str(v: unknown): string | undefined {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s.length ? s : undefined;
}

function peelStatsObject(raw: unknown): Record<string, unknown> | null {
  let cur: unknown = raw;
  for (let i = 0; i < 4 && cur && typeof cur === "object" && !Array.isArray(cur); i++) {
    const o = cur as Record<string, unknown>;
    if ("data" in o && o.data != null && typeof o.data === "object" && !Array.isArray(o.data)) {
      cur = o.data;
      continue;
    }
    if ("stats" in o && o.stats != null && typeof o.stats === "object" && !Array.isArray(o.stats)) {
      cur = o.stats;
      continue;
    }
    return o;
  }
  return cur && typeof cur === "object" && !Array.isArray(cur) ? (cur as Record<string, unknown>) : null;
}

function normalizeCollectorDashboardStats(raw: unknown): CollectorDashboardStats {
  const o = peelStatsObject(raw);
  if (!o) return {};

  return {
    todaysPickups:
      num(o.todaysPickups) ??
      num(o.todays_pickups) ??
      num(o.today_pickups) ??
      num(o.todayPickups),
    pendingPayments:
      num(o.pendingPayments) ?? num(o.pending_payments) ?? num(o.pending_payment_count),
    citizensServed:
      num(o.citizensServed) ?? num(o.citizens_served) ?? num(o.citizens_served_count),
    collectorName: str(o.collectorName) ?? str(o.collector_name) ?? str(o.full_name),
    areaName: str(o.areaName) ?? str(o.area_name) ?? str(o.service_area) ?? str(o.area),
  };
}

export interface CollectorDashboardStats {
  todaysPickups?: number;
  pendingPayments?: number;
  citizensServed?: number;
  collectorName?: string;
  areaName?: string;
}

export async function getCollectorDashboardStats(): Promise<AppResponse<CollectorDashboardStats>> {
  try {
    const raw = await asApiBody(axios.get(Util.apiUrl("collector/dashboard/stats")));
    if (isApiFailure(raw)) return toFailureResponse(raw, "Failed to load stats", {});
    const r = asObjectRecord(raw);
    if (r && "success" in r && r.success === false) return toFailureResponse(raw, "Failed to load stats", {});
    const inner = unwrapData(raw) ?? raw;
    return toSuccessResponse(raw, normalizeCollectorDashboardStats(inner));
  } catch {
    return networkError("Network error", {});
  }
}

export interface CollectorRouteSummary {
  _id: string;
  area: string;
  schedule_date: string;
  schedule_time: string;
  citizens: number;
}

function normalizeCollectorRouteRow(r: Record<string, unknown>): CollectorRouteSummary {
  const id = toId(r) || str(r.id) || "";
  const dateRaw = r.schedule_date ?? r.date ?? r.scheduleDate;
  const schedule_date =
    dateRaw != null
      ? typeof dateRaw === "string"
        ? dateRaw
        : new Date(dateRaw as string | number).toISOString()
      : "";
  const timeRaw = r.schedule_time ?? r.time ?? r.scheduleTime;
  const schedule_time = timeRaw != null ? String(timeRaw) : "";
  return {
    _id: id,
    area: str(r.area) ?? "",
    schedule_date,
    schedule_time,
    citizens:
      num(r.citizens) ??
      num(r.citizen_count) ??
      num(r.citizens_count) ??
      num(r.bookings) ??
      num(r.booking_count) ??
      0,
  };
}

export async function getCollectorTodayRoutes(): Promise<AppResponse<CollectorRouteSummary[]>> {
  const raw = await asApiBody(axios.get(Util.apiUrl("pickup-schedules/collector/today")));
  if (isApiFailure(raw)) return toFailureResponse(raw, "Failed to load today routes", []);
  const r = asObjectRecord(raw);
  if (r && "success" in r && r.success === false) return toFailureResponse(raw, "Failed to load today routes", []);
  const payload = unwrapData(raw) ?? raw;
  const rows = unwrapList<Record<string, unknown> & { id?: unknown }>(payload);
  return toSuccessResponse(raw, rows.map((row) => normalizeCollectorRouteRow(row as Record<string, unknown>)));
}

export interface CollectorScheduleWithBookings {
  _id: string;
  area: string;
  schedule_date: string;
  schedule_time: string;
  bookings: number;
  maxBookings: number;
}

export async function getCollectorSchedules(): Promise<AppResponse<CollectorScheduleWithBookings[]>> {
  const raw = await asApiBody(axios.get(Util.apiUrl("pickup-schedules/collector")));
  if (isApiFailure(raw)) return toFailureResponse(raw, "Failed to load schedules", []);
  const r = asObjectRecord(raw);
  if (r && "success" in r && r.success === false) return toFailureResponse(raw, "Failed to load schedules", []);
  const payload = unwrapData(raw) ?? raw;
  const list = unwrapList<CollectorScheduleWithBookings & { id?: unknown }>(payload);
  const data = list.map((s) => {
    const o = s as unknown as Record<string, unknown>;
    return {
      _id: toId(s) || str(o.id) || "",
      area: str(o.area) ?? "",
      schedule_date: String(o.schedule_date ?? o.date ?? ""),
      schedule_time: String(o.schedule_time ?? o.time ?? ""),
      bookings: num(o.bookings) ?? num(o.booking_count) ?? 0,
      maxBookings: num(o.maxBookings) ?? num(o.max_bookings) ?? num(o.max_spots) ?? 0,
    };
  }) as CollectorScheduleWithBookings[];
  return toSuccessResponse(raw, data);
}

export interface CollectorPickupItem {
  type: string;
  estWeight: string;
  estValue: string;
}

export interface CollectorPickupCitizen {
  requestId: string;
  id: string;
  name: string;
  address: string;
  area: string;
  lat?: number;
  lng?: number;
  pickupId?: string;
  mobile: string;
  items: CollectorPickupItem[];
  totalValue: string;
}

export interface CollectorPickupRoute {
  id: string;
  area: string;
  date: string;
  time: string;
  citizens: number;
  status: string;
  citizensDetails: CollectorPickupCitizen[];
}

function normalizePickupItem(it: Record<string, unknown>): CollectorPickupItem {
  return {
    type: str(it.type) ?? str(it.item_name) ?? str(it.name) ?? "—",
    estWeight: str(it.estWeight) ?? str(it.est_weight) ?? str(it.rough_weight) ?? "—",
    estValue: str(it.estValue) ?? str(it.est_value) ?? str(it.estimated_earnings) ?? "—",
  };
}

function normalizePickupCitizen(c: Record<string, unknown>): CollectorPickupCitizen {
  const itemsRaw = c.items ?? c.pickup_items ?? c.item_list;
  const itemsArr = Array.isArray(itemsRaw) ? itemsRaw : [];
  const items = itemsArr.map((it) =>
    normalizePickupItem(typeof it === "object" && it != null ? (it as Record<string, unknown>) : {})
  );
  const total =
    str(c.totalValue) ??
    str(c.total_value) ??
    str(c.estimated_total) ??
    str(c.estimated_earnings);
  const coords =
    c.coordinates != null && typeof c.coordinates === "object" && !Array.isArray(c.coordinates)
      ? (c.coordinates as Record<string, unknown>)
      : null;
  const lat =
    num(c.latitude) ??
    num(c.lat) ??
    num((c as Record<string, unknown>).location_lat) ??
    num((c as Record<string, unknown>).locationLat) ??
    (coords ? num(coords.latitude) ?? num(coords.lat) : undefined);
  const lng =
    num(c.longitude) ??
    num(c.lng) ??
    num(c.lon) ??
    num((c as Record<string, unknown>).location_lng) ??
    num((c as Record<string, unknown>).locationLng) ??
    (coords ? num(coords.longitude) ?? num(coords.lng) ?? num(coords.lon) : undefined);
  return {
    requestId:
      str(c.pickupId) ??
      str(c.requestId) ??
      str(c.request_id) ??
      str(c.pickup_request_id) ??
      str(c.pickupRequestId) ??
      str(c._id) ??
      "",
    id:
      str(c.citizen_id) ??
      str(c.citizenId) ??
      str(c.user_id) ??
      str(c.userId) ??
      str(c.id) ??
      "",
    name: str(c.name) ?? str(c.citizen_name) ?? str(c.full_name) ?? "—",
    address:
      str(c.address) ??
      str(c.street_address) ??
      str(c.full_address) ??
      str(c.streetAddress) ??
      str(c.pickup_address) ??
      str(c.pickupAddress) ??
      str(c.delivery_address) ??
      str(c.home_address) ??
      str(c.citizen_address) ??
      str(c.user_address) ??
      str(c.location) ??
      str(c.location_name) ??
      "—",
    area: str(c.area) ?? str(c.citizen_area) ?? "—",
    mobile: str(c.mobile) ?? str(c.mobile_number) ?? str(c.phoneNumber) ?? str(c.phone) ?? "—",
    ...(lat != null && lng != null ? { lat, lng } : {}),
    items,
    totalValue: total ?? "—",
  };
}

function normalizePickupRoute(raw: Record<string, unknown>): CollectorPickupRoute {
  const id = toId(raw) || str(raw.id) || "";
  const citizensRaw =
    raw.citizensDetails ?? raw.citizens_details ?? raw.citizens ?? raw.pickups ?? raw.requests;
  const citizensArr = Array.isArray(citizensRaw) ? citizensRaw : [];
  const citizensDetails = citizensArr.map((c) =>
    normalizePickupCitizen(typeof c === "object" && c != null ? (c as Record<string, unknown>) : {})
  );

  const dateStr = normalizeApiDateOnly(raw.date ?? raw.schedule_date);
  const timeStr = normalizeScheduleTime(raw.time ?? raw.schedule_time);

  return {
    id,
    area: str(raw.area) ?? "—",
    date: dateStr,
    time: timeStr,
    citizens:
      num(raw.citizens) ??
      num(raw.citizen_count) ??
      num(raw.citizens_count) ??
      citizensDetails.length,
    status: str(raw.status) ?? "",
    citizensDetails,
  };
}

export async function getCollectorPickupRoutes(): Promise<AppResponse<CollectorPickupRoute[]>> {
  try {
    const raw = await asApiBody(axios.get(Util.apiUrl("collector/pickups")));
    if (isApiFailure(raw)) return toFailureResponse(raw, "Failed to load pickups", []);
    const r = asObjectRecord(raw);
    if (r && "success" in r && r.success === false) return toFailureResponse(raw, "Failed to load pickups", []);
    const payload = unwrapData(raw) ?? raw;
    const list = unwrapList<Record<string, unknown>>(payload);
    return toSuccessResponse(raw, list.map((row) => normalizePickupRoute(row)));
  } catch {
    return networkError("Network error", []);
  }
}

export interface CompletePickupPayload {
  citizenId: string;
  notes?: string;
  items?: { type: string; actualWeight?: string }[];
}

export async function completeCollectorPickup(
  requestId: string,
  payload: CompletePickupPayload
): Promise<AppResponse<null>> {
  const raw = await asApiBody(axios.post(Util.apiUrl(`collector/pickups/${requestId}/complete`), payload));
  if (isApiFailure(raw)) return toFailureResponse(raw, "Complete pickup failed", null);
  return toSuccessResponse(raw, null);
}

export interface CancelPickupPayload {
  citizenId: string;
  status?: string;
}

export async function cancelCollectorPickup(
  requestId: string,
  payload: CancelPickupPayload
): Promise<AppResponse<null>> {
  const raw = await asApiBody(
    axios.post(Util.apiUrl(`collector/pickups/${requestId}/cancel`), payload)
  );
  if (isApiFailure(raw)) return toFailureResponse(raw, "Cancel pickup failed", null);
  return toSuccessResponse(raw, null);
}

export interface CollectorHistoryEntry {
  _id: string;
  citizenName: string;
  citizenMobile: string;
  area: string;
  date: string;
  collector: string;
  status: string;
  totalValue: string;
  items: { type: string; weight: string; value: string }[];
}

function normalizeHistoryItem(it: Record<string, unknown>): { type: string; weight: string; value: string } {
  return {
    type: str(it.type) ?? str(it.item_name) ?? "—",
    weight: str(it.weight) ?? str(it.actual_weight) ?? str(it.est_weight) ?? "—",
    value: str(it.value) ?? str(it.amount) ?? "—",
  };
}

function normalizeHistoryEntry(h: Record<string, unknown>): CollectorHistoryEntry {
  const itemsRaw = h.items ?? h.collected_items ?? h.pickup_items;
  const itemsArr = Array.isArray(itemsRaw) ? itemsRaw : [];
  const items = itemsArr.map((it) =>
    normalizeHistoryItem(typeof it === "object" && it != null ? (it as Record<string, unknown>) : {})
  );
  return {
    _id: toId(h) || str(h.id) || "",
    citizenName: str(h.citizenName) ?? str(h.citizen_name) ?? str(h.name) ?? "—",
    citizenMobile: str(h.citizenMobile) ?? str(h.citizen_mobile) ?? str(h.mobile) ?? "—",
    area: str(h.area) ?? str(h.citizen_area) ?? "—",
    date: str(h.date) ?? str(h.collection_date) ?? str(h.completed_at) ?? "—",
    collector: str(h.collector) ?? str(h.collector_name) ?? "—",
    status: str(h.status) ?? "—",
    totalValue: str(h.totalValue) ?? str(h.total_value) ?? str(h.total) ?? "—",
    items: items.length ? items : [],
  };
}

export async function getCollectorHistory(): Promise<AppResponse<CollectorHistoryEntry[]>> {
  try {
    const raw = await asApiBody(axios.get(Util.apiUrl("collector/history")));
    if (isApiFailure(raw)) return toFailureResponse(raw, "Failed to load history", []);
    const r = asObjectRecord(raw);
    if (r && "success" in r && r.success === false) return toFailureResponse(raw, "Failed to load history", []);
    const payload = unwrapData(raw) ?? raw;
    const list = unwrapList<Record<string, unknown>>(payload);
    return toSuccessResponse(raw, list.map((row) => normalizeHistoryEntry(row)));
  } catch {
    return networkError("Network error", []);
  }
}

export interface CollectorNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export async function getCollectorNotifications(): Promise<AppResponse<CollectorNotification[]>> {
  try {
    const raw = await asApiBody(axios.get(Util.apiUrl("collector/notifications")));
    if (isApiFailure(raw)) return toFailureResponse(raw, "Failed to load notifications", []);
    const r = asObjectRecord(raw);
    if (r && "success" in r && r.success === false) return toFailureResponse(raw, "Failed to load notifications", []);
    const payload = unwrapData(raw) ?? raw;
    const list = unwrapList<Record<string, unknown>>(payload);
    return toSuccessResponse(
      raw,
      list.map((n) => ({
        _id: toId(n) || str(n.id) || "",
        type: str(n.type) ?? "",
        title: str(n.title) ?? "",
        message: str(n.message) ?? "",
        timestamp: str(n.timestamp) ?? str(n.created_at) ?? "",
        isRead: Boolean(n.isRead ?? n.is_read ?? n.read),
      }))
    );
  } catch {
    return networkError("Network error", []);
  }
}
