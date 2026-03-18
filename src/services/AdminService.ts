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

//  Overview 
export interface AdminDashboardStats {
  todaysPickups?: number;
  pendingSchedules?: number;
  registeredCitizens?: number;
  activeCollectors?: number;
  activeCategories?: number;
}

export interface AreaPickupItem {
  area: string;
  pickups: number;
}

export interface ItemTypeDistributionItem {
  name: string;
  value: number;
  color?: string;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const res = await axios.get<unknown>(Util.apiUrl("admin/dashboard/stats"));
  return (unwrapData<AdminDashboardStats>(res) ?? {}) as AdminDashboardStats;
}

export async function getAreaPickups(): Promise<AreaPickupItem[]> {
  const res = await axios.get<unknown>(Util.apiUrl("admin/dashboard/area-pickups"));
  const data = unwrapData<AreaPickupItem[]>(res);
  return Array.isArray(data) ? data : [];
}

export async function getItemTypeDistribution(): Promise<ItemTypeDistributionItem[]> {
  const res = await axios.get<unknown>(Util.apiUrl("admin/dashboard/item-type-distribution"));
  const data = unwrapData<ItemTypeDistributionItem[]>(res);
  return Array.isArray(data) ? data : [];
}

// Pickup schedules 
export interface PickupSchedulePayload {
  area: string;
  schedule_date: string;
  schedule_time: string;
  items: string;
}

export interface PickupSchedule {
  _id: string;
  area: string;
  schedule_date: string;
  schedule_time: string;
  items: string;
  collector_name?: string;
  status: string;
}

export async function getPickupSchedules(): Promise<PickupSchedule[]> {
  const res = await axios.get<unknown>(Util.apiUrl("pickup-schedules"));
  return unwrapList<PickupSchedule & { id?: unknown }>(res).map((s) => ({
    ...s,
    _id: toId(s),
  })) as PickupSchedule[];
}

export async function createPickupSchedule(payload: PickupSchedulePayload): Promise<PickupSchedule | null> {
  const res = await axios.post<unknown>(Util.apiUrl("pickup-schedules"), payload);
  throwIfFailed(res, "Create failed");
  return unwrapData<PickupSchedule>(res);
}

export async function updatePickupSchedule(_id: string, payload: PickupSchedulePayload): Promise<PickupSchedule | null> {
  const res = await axios.put<unknown>(Util.apiUrl(`pickup-schedules/${_id}`), payload);
  throwIfFailed(res, "Update failed");
  return unwrapData<PickupSchedule>(res);
}

export async function deletePickupSchedule(_id: string): Promise<void> {
  const res = await axios.delete<unknown>(Util.apiUrl(`pickup-schedules/${_id}`));
  throwIfFailed(res, "Delete failed");
}

//  Categories 
export interface CategoryPayload {
  name: string;
  unit: string;
  description?: string | null;
  is_active: boolean;
}

export interface Category {
  _id: string;
  name: string;
  unit: string;
  description?: string;
  is_active?: boolean;
  isActive?: boolean;
}

export async function getCategories(): Promise<Category[]> {
  const res = await axios.get<unknown>(Util.apiUrl("categories/admin"));
  const list = unwrapList<Category & { is_active?: boolean; id?: unknown }>(res);
  return list.map((c) => ({
    ...c,
    _id: toId(c),
    isActive: c.isActive ?? c.is_active ?? true,
  })) as Category[];
}

export async function createCategory(payload: CategoryPayload): Promise<Category | null> {
  const res = await axios.post<unknown>(Util.apiUrl("categories"), payload);
  throwIfFailed(res, "Create failed");
  return unwrapData<Category>(res);
}

export async function updateCategory(_id: string, payload: Partial<CategoryPayload>): Promise<Category | null> {
  const res = await axios.put<unknown>(Util.apiUrl(`categories/${_id}`), payload);
  throwIfFailed(res, "Update failed");
  return unwrapData<Category>(res);
}

export async function deleteCategory(_id: string): Promise<void> {
  const res = await axios.delete<unknown>(Util.apiUrl(`categories/${_id}`));
  throwIfFailed(res, "Delete failed");
}

// Collectors
export interface Collector {
  _id: string;
  full_name: string;
  area: string;
}

export async function getCollectors(): Promise<Collector[]> {
  const res = await axios.get<unknown>(Util.apiUrl("collectors"));
  const list = unwrapList<Collector & { id?: unknown }>(res);
  return list.map((c) => ({ ...c, _id: toId(c) })) as Collector[];
}

//  Collector–category assignments 
export interface CollectorCategoryAssignmentPayload {
  collector_id: string;
  category_id: string;
  area: string;
}

export interface CollectorCategoryAssignment {
  _id: string;
  collector_name: string;
  category_name: string;
  area: string;
  assigned_date: string;
  status: string;
}

export async function getCollectorCategoryAssignments(): Promise<CollectorCategoryAssignment[]> {
  const res = await axios.get<unknown>(Util.apiUrl("collector-category-assignments"));
  const list = unwrapList<CollectorCategoryAssignment & { id?: unknown }>(res);
  return list.map((a) => ({ ...a, _id: toId(a) })) as CollectorCategoryAssignment[];
}

export async function createCollectorCategoryAssignment(
  payload: CollectorCategoryAssignmentPayload
): Promise<CollectorCategoryAssignment | null> {
  const res = await axios.post<unknown>(Util.apiUrl("collector-category-assignments"), payload);
  throwIfFailed(res, "Assign failed");
  return unwrapData<CollectorCategoryAssignment>(res);
}

export async function deleteCollectorCategoryAssignment(_id: string): Promise<void> {
  const res = await axios.delete<unknown>(Util.apiUrl(`collector-category-assignments/${_id}`));
  throwIfFailed(res, "Delete failed");
}

//  Pickup requests (admin) 
export interface PickupRequest {
  _id: string;
  citizen_name: string;
  citizen_area: string;
  item_name: string;
  category_name?: string;
  rough_weight: number;
  priority: string;
  estimated_earnings: number;
  status: string;
  assigned_collector?: string;
  created_at: string;
}

export async function getPickupRequests(): Promise<PickupRequest[]> {
  const res = await axios.get<unknown>(Util.apiUrl("pickup-requests/admin"));
  const list = unwrapList<PickupRequest & { id?: unknown }>(res);
  return list.map((r) => ({ ...r, _id: toId(r) })) as PickupRequest[];
}

export async function updatePickupRequestStatus(_id: string, status: string): Promise<void> {
  const res = await axios.put<unknown>(Util.apiUrl(`pickup-requests/${_id}/status`), { status });
  throwIfFailed(res, "Update failed");
}

export async function assignCollectorToPickupRequest(requestId: string, collector_id: string): Promise<void> {
  const res = await axios.put<unknown>(Util.apiUrl(`pickup-requests/${requestId}/assign-collector`), {
    collector_id,
  });
  throwIfFailed(res, "Assign failed");
}

//  Items (price management)
export interface ItemPayload {
  category_id: string;
  name: string;
  current_price: number;
}

export interface PriceItem {
  _id: string;
  item_name: string;
  category_name?: string;
  category_id?: string;
  current_price: number;
  previous_price?: number | null;
  last_updated: string;
  status: string;
  change?: number;
}

export async function getCategoriesForSelect(): Promise<{ _id: string; name: string }[]> {
  const res = await axios.get<unknown>(Util.apiUrl("categories/admin"));
  const list = unwrapList<{ _id?: string; id?: unknown; name: string }>(res);
  return list.map((c) => ({ _id: toId(c), name: c.name }));
}

export async function getItems(): Promise<PriceItem[]> {
  const res = await axios.get<unknown>(Util.apiUrl("items"));
  const list = unwrapList<PriceItem & { previous_price?: number | null; id?: unknown }>(res);
  return list.map((item) => ({
    ...item,
    _id: toId(item),
    current_price: Number(item.current_price),
    previous_price: item.previous_price != null ? Number(item.previous_price) : null,
    change:
      item.previous_price != null && Number(item.previous_price) !== 0
        ? ((Number(item.current_price) - Number(item.previous_price)) / Number(item.previous_price)) * 100
        : 0,
  })) as PriceItem[];
}

export async function createItem(payload: ItemPayload): Promise<PriceItem | null> {
  const res = await axios.post<unknown>(Util.apiUrl("items"), payload);
  throwIfFailed(res, "Create failed");
  return unwrapData<PriceItem>(res);
}

export async function updateItem(
  _id: string,
  payload: Partial<ItemPayload> & { status?: string }
): Promise<PriceItem | null> {
  const res = await axios.put<unknown>(Util.apiUrl(`items/${_id}`), payload);
  throwIfFailed(res, "Update failed");
  return unwrapData<PriceItem>(res);
}

export async function deleteItem(_id: string): Promise<void> {
  const res = await axios.delete<unknown>(Util.apiUrl(`items/${_id}`));
  throwIfFailed(res, "Delete failed");
}

//  Users (admin) 
export interface AdminUser {
  _id: string;
  full_name: string;
  email: string | null;
  mobile_number: string;
  address: string;
  role: string;
  is_active: boolean;
  joined_date: string;
}

export interface CreateUserPayload {
  full_name: string;
  mobile_number: string;
  email?: string | null;
  area: string;
  password: string;
  role: string;
}

export interface UpdateUserPayload {
  full_name?: string;
  mobile_number?: string;
  email?: string | null;
  area?: string;
  role?: string;
  is_active?: boolean;
}

export async function getUsers(): Promise<AdminUser[]> {
  const res = await axios.get<unknown>(Util.apiUrl("users/admin"));
  const list = unwrapList<AdminUser & { id?: unknown }>(res);
  return list.map((u) => ({ ...u, _id: toId(u) })) as AdminUser[];
}

export async function createUser(payload: CreateUserPayload): Promise<{ user?: { username?: string } } | null> {
  const res = await axios.post<unknown>(Util.apiUrl("auth/signup"), payload);
  throwIfFailed(res, "Create user failed");
  return unwrapData<{ user?: { username?: string } }>(res) ?? (res as { user?: { username?: string } });
}

export async function updateUser(_id: string, payload: UpdateUserPayload): Promise<AdminUser | null> {
  const res = await axios.put<unknown>(Util.apiUrl(`users/${_id}`), payload);
  throwIfFailed(res, "Update failed");
  return unwrapData<AdminUser>(res);
}

export async function deleteUser(_id: string): Promise<void> {
  const res = await axios.delete<unknown>(Util.apiUrl(`users/${_id}`));
  throwIfFailed(res, "Delete failed");
}
