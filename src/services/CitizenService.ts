import axios from "axios";
import { Util } from "../Util";
import { AppResponse } from "../models/Response";

/** Unwrap list from response: support raw array or { data: T[] }. */
function unwrapList<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res;
  if (res && typeof res === "object" && "data" in res && Array.isArray((res as { data: T[] }).data)) {
    return (res as { data: T[] }).data;
  }
  return [];
}

/** Unwrap single entity: support raw object or { data: T }. */
function unwrapData<T>(res: unknown): T | null {
  if (res == null) return null;
  if (res && typeof res === "object" && "data" in res) return (res as { data: T }).data as T;
  return res as T;
}

/** Throw if response indicates API failure. */
function throwIfFailed(res: unknown, defaultMessage: string): void {
  const r = res as unknown as AppResponse<unknown>;
  if (res && typeof res === "object" && "success" in res && r?.success === false) {
    throw new Error(r?.message || defaultMessage);
  }
}

/** Normalize MongoDB-style _id from API (supports both _id and id). */
function toId(item: unknown): string {
  if (item == null || typeof item !== "object") return "";
  const o = item as Record<string, unknown>;
  if (typeof o._id === "string") return o._id;
  if (o._id != null) return String(o._id);
  if (typeof o.id === "string") return o.id;
  if (o.id != null) return String(o.id);
  return "";
}

// ---- Citizen dashboard stats ----
export interface CitizenDashboardStats {
  totalEarnings?: number;
  pendingPickups?: number;
  totalWeightKg?: number;
}

export async function getCitizenDashboardStats(): Promise<CitizenDashboardStats> {
  try {
    const res = await axios.get<unknown>(Util.apiUrl("citizen/dashboard/stats"));
    return (unwrapData<CitizenDashboardStats>(res) ?? {}) as CitizenDashboardStats;
  } catch {
    return {};
  }
}

// ---- Citizen pickup requests (my requests) ----
export interface CitizenPickupRequest {
  _id: string;
  item_name: string;
  category_name?: string;
  rough_weight: number;
  estimated_earnings: number;
  status: string;
  assigned_collector?: string;
  schedule_date?: string;
  schedule_time?: string;
  area?: string;
  created_at: string;
}

export async function getCitizenPickupRequests(): Promise<CitizenPickupRequest[]> {
  const res = await axios.get<unknown>(Util.apiUrl("pickup-requests/citizen"));
  const list = unwrapList<CitizenPickupRequest & { id?: unknown }>(res);
  return list.map((r) => ({ ...r, _id: toId(r) })) as CitizenPickupRequest[];
}

export interface CreatePickupRequestPayload {
  item_id: string;
  rough_weight: number;
  priority?: string;
  estimated_earnings: number;
}

export async function createPickupRequest(payload: CreatePickupRequestPayload): Promise<CitizenPickupRequest | null> {
  const res = await axios.post<unknown>(Util.apiUrl("pickup-requests"), payload);
  throwIfFailed(res, "Create pickup request failed");
  const raw = unwrapData<CitizenPickupRequest & { id?: unknown }>(res);
  return raw ? ({ ...raw, _id: toId(raw) } as CitizenPickupRequest) : null;
}

// ---- Available schedules (slots) for citizen ----
export interface CitizenScheduleSlot {
  _id: string;
  area: string;
  schedule_date: string;
  schedule_time: string;
  collector_name?: string;
  spots_left?: number;
  spotsLeft?: number;
  status?: string;
}

export async function getCitizenAvailableSchedules(area?: string): Promise<CitizenScheduleSlot[]> {
  const url = area
    ? Util.apiUrl(`pickup-schedules/citizen?area=${encodeURIComponent(area)}`)
    : Util.apiUrl("pickup-schedules/citizen");
  const res = await axios.get<unknown>(url);
  const list = unwrapList<CitizenScheduleSlot & { id?: unknown }>(res);
  return list.map((s) => ({ ...s, _id: toId(s) })) as CitizenScheduleSlot[];
}

/** Assign a schedule slot to a pickup request (e.g. when citizen selects a slot). */
export async function assignScheduleToPickupRequest(
  requestId: string,
  scheduleId: string
): Promise<void> {
  const res = await axios.put<unknown>(Util.apiUrl(`pickup-requests/${requestId}/schedule`), {
    schedule_id: scheduleId,
  });
  throwIfFailed(res, "Schedule assignment failed");
}

// ---- Active items (for Add Item dropdown) ----
export interface CitizenItem {
  _id: string;
  item_name: string;
  current_price: number;
  category_name?: string;
  category_id?: string;
}

export async function getActiveItems(): Promise<CitizenItem[]> {
  const res = await axios.get<unknown>(Util.apiUrl("items/active"));
  const list = unwrapList<CitizenItem & { id?: unknown }>(res);
  return list.map((i) => ({
    ...i,
    _id: toId(i),
    current_price: Number((i as CitizenItem).current_price),
  })) as CitizenItem[];
}

// ---- Collection history (completed pickups with earnings) ----
export interface CitizenHistoryEntry {
  _id: string;
  collection_date: string;
  collector_name: string;
  total: number;
  items: { type: string; weight: string; value: string }[];
}

export async function getCitizenHistory(): Promise<CitizenHistoryEntry[]> {
  try {
    const res = await axios.get<unknown>(Util.apiUrl("citizen/history"));
    const list = unwrapList<CitizenHistoryEntry & { id?: unknown }>(res);
    return list.map((h) => ({ ...h, _id: toId(h) })) as CitizenHistoryEntry[];
  } catch {
    return [];
  }
}

// ---- Notifications (optional) ----
export interface CitizenNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export async function getCitizenNotifications(): Promise<CitizenNotification[]> {
  try {
    const res = await axios.get<unknown>(Util.apiUrl("citizen/notifications"));
    const list = unwrapList<CitizenNotification & { id?: unknown }>(res);
    return list.map((n) => ({ ...n, _id: toId(n) })) as CitizenNotification[];
  } catch {
    return [];
  }
}
