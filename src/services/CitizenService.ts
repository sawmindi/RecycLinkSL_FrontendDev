import axios from "axios";
import { Util } from "../Util";
import { AppResponse } from "../models/Response";
import { isApiFailure, networkError, toFailureResponse, toSuccessResponse } from "../util/apiResponse";

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

//  Citizen dashboard stats 
export interface CitizenDashboardStats {
  totalEarnings?: number;
  pendingPickups?: number;
  totalWeightKg?: number;
}

export async function getCitizenDashboardStats(): Promise<AppResponse<CitizenDashboardStats>> {
  try {
    const raw = await axios.get<unknown>(Util.apiUrl("citizen/dashboard/stats"));
    if (isApiFailure(raw)) return toFailureResponse(raw, "Failed to load stats", {});
    const inner = unwrapData<CitizenDashboardStats>(raw) ?? (raw as CitizenDashboardStats);
    return toSuccessResponse(raw, (inner ?? {}) as CitizenDashboardStats);
  } catch {
    return networkError("Network error", {});
  }
}

// Citizen pickup requests
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

export async function getCitizenPickupRequests(): Promise<AppResponse<CitizenPickupRequest[]>> {
  const raw = await axios.get<unknown>(Util.apiUrl("pickup-requests/citizen"));
  if (isApiFailure(raw)) return toFailureResponse(raw, "Failed to load requests", []);
  const list = unwrapList<CitizenPickupRequest & { id?: unknown }>(raw);
  return toSuccessResponse(raw, list.map((r) => ({ ...r, _id: toId(r) })) as CitizenPickupRequest[]);
}
export interface CreatePickupRequestPayload {
  item_id: string;
  rough_weight: number;
  priority?: string;
  estimated_earnings: number;
}

export async function createPickupRequest(
  payload: CreatePickupRequestPayload
): Promise<AppResponse<CitizenPickupRequest | null>> {
  const raw = await axios.post<unknown>(Util.apiUrl("pickup-requests"), payload);
  if (isApiFailure(raw)) return toFailureResponse(raw, "Create pickup request failed", null);
  const rowRaw = unwrapData<CitizenPickupRequest & { id?: unknown }>(raw);
  const row = rowRaw ? ({ ...rowRaw, _id: toId(rowRaw) } as CitizenPickupRequest) : null;
  return toSuccessResponse(raw, row);
}

// Available schedules (slots) for citizen 
export interface CitizenScheduleSlot {
  _id: string;
  area: string;
  schedule_date: string;
  schedule_time: string;
  items?: string | string[];
  item_name?: string;
  full_name?: string;
  collector_name?: string;
  collector_id?: string;
  spots_left?: number;
  spotsLeft?: number;
  status?: string;
}
export interface CitizenAreaCollector {
  _id: string;
  full_name: string;
  area?: string;
  mobile_number?: string;
}

export async function getCollectorsForCitizenArea(area: string): Promise<AppResponse<CitizenAreaCollector[]>> {
  const a = area?.trim();
  if (!a) return { success: true, message: "", data: [], token: "" };
  try {
    const raw = await axios.get<unknown>(
      Util.apiUrl(`citizen/collectors?area=${encodeURIComponent(a)}`)
    );
    if (isApiFailure(raw)) return toFailureResponse(raw, "Failed to load collectors", []);
    const list = unwrapList<CitizenAreaCollector & { id?: unknown }>(raw);
    return toSuccessResponse(raw, list.map((c) => ({ ...c, _id: toId(c) })) as CitizenAreaCollector[]);
  } catch {
    return networkError("Network error", []);
  }
}

export async function getCitizenAvailableSchedules(area?: string): Promise<AppResponse<CitizenScheduleSlot[]>> {
  const url = area
    ? Util.apiUrl(`pickup-schedules/citizen?area=${encodeURIComponent(area)}`)
    : Util.apiUrl("pickup-schedules/citizen");
  const raw = await axios.get<unknown>(url);
  if (isApiFailure(raw)) return toFailureResponse(raw, "Failed to load schedules", []);
  const list = unwrapList<CitizenScheduleSlot & { id?: unknown }>(raw);
  return toSuccessResponse(raw, list.map((s) => ({ ...s, _id: toId(s) })) as CitizenScheduleSlot[]);
}

export async function assignScheduleToPickupRequest(
  requestId: string,
  scheduleId: string
): Promise<AppResponse<null>> {
  const raw = await axios.put<unknown>(Util.apiUrl(`pickup-requests/${requestId}/schedule`), {
    schedule_id: scheduleId,
  });
  if (isApiFailure(raw)) return toFailureResponse(raw, "Schedule assignment failed", null);
  return toSuccessResponse(raw, null);
}

// Active items
export interface CitizenItem {
  _id: string;
  item_name: string;
  current_price: number;
  category_name?: string;
  category_id?: string;
}

export async function getActiveItems(): Promise<AppResponse<CitizenItem[]>> {
  const raw = await axios.get<unknown>(Util.apiUrl("items/active"));
  if (isApiFailure(raw)) return toFailureResponse(raw, "Failed to load items", []);
  const list = unwrapList<CitizenItem & { id?: unknown }>(raw);
  return toSuccessResponse(
    raw,
    list.map((i) => ({
      ...i,
      _id: toId(i),
      current_price: Number((i as CitizenItem).current_price),
    })) as CitizenItem[]
  );
}

// Collection history
export interface CitizenHistoryEntry {
  _id: string;
  collection_date: string;
  collector_name: string;
  total: number;
  items: { type: string; weight: string; value: string }[];
}

export async function getCitizenHistory(): Promise<AppResponse<CitizenHistoryEntry[]>> {
  try {
    const raw = await axios.get<unknown>(Util.apiUrl("citizen/history"));
    if (isApiFailure(raw)) return toFailureResponse(raw, "Failed to load history", []);
    const list = unwrapList<CitizenHistoryEntry & { id?: unknown }>(raw);
    return toSuccessResponse(raw, list.map((h) => ({ ...h, _id: toId(h) })) as CitizenHistoryEntry[]);
  } catch {
    return networkError("Network error", []);
  }
}

// Notifications 
export interface CitizenNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export async function getCitizenNotifications(): Promise<AppResponse<CitizenNotification[]>> {
  try {
    const raw = await axios.get<unknown>(Util.apiUrl("citizen/notifications"));
    if (isApiFailure(raw)) return toFailureResponse(raw, "Failed to load notifications", []);
    const list = unwrapList<CitizenNotification & { id?: unknown }>(raw);
    return toSuccessResponse(raw, list.map((n) => ({ ...n, _id: toId(n) })) as CitizenNotification[]);
  } catch {
    return networkError("Network error", []);
  }
}
