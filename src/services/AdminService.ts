import axios from "axios";
import { Util } from "../Util";
import { AppResponse } from "../models/Response";
import { isApiFailure, toFailureResponse, toSuccessResponse } from "../util/apiResponse";

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

// Overview
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

export async function getAdminDashboardStats(): Promise<AppResponse<AdminDashboardStats>> {
  const raw = await axios.get<unknown>(Util.apiUrl("admin/dashboard/stats"));
  if (isApiFailure(raw)) return toFailureResponse(raw, "Failed to load dashboard stats", {});
  const inner = unwrapData<AdminDashboardStats>(raw) ?? (raw as AdminDashboardStats);
  return toSuccessResponse(raw, (inner ?? {}) as AdminDashboardStats);
}

export async function getAreaPickups(): Promise<AppResponse<AreaPickupItem[]>> {
  const raw = await axios.get<unknown>(Util.apiUrl("admin/dashboard/area-pickups"));
  if (isApiFailure(raw)) return toFailureResponse(raw, "Failed to load area pickups", []);
  const data = unwrapData<AreaPickupItem[]>(raw);
  return toSuccessResponse(raw, Array.isArray(data) ? data : []);
}

export async function getItemTypeDistribution(): Promise<AppResponse<ItemTypeDistributionItem[]>> {
  const raw = await axios.get<unknown>(Util.apiUrl("admin/dashboard/item-type-distribution"));
  if (isApiFailure(raw)) return toFailureResponse(raw, "Failed to load distribution", []);
  const data = unwrapData<ItemTypeDistributionItem[]>(raw);
  return toSuccessResponse(raw, Array.isArray(data) ? data : []);
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

export async function getPickupSchedules(): Promise<AppResponse<PickupSchedule[]>> {
  const raw = await axios.get<unknown>(Util.apiUrl("pickup-schedules"));
  if (isApiFailure(raw)) return toFailureResponse(raw, "Failed to load schedules", []);
  const rows = unwrapList<PickupSchedule & { id?: unknown }>(raw).map((s) => ({
    ...s,
    _id: toId(s),
  })) as PickupSchedule[];
  return toSuccessResponse(raw, rows);
}

export async function createPickupSchedule(payload: PickupSchedulePayload): Promise<AppResponse<PickupSchedule | null>> {
  const raw = await axios.post<unknown>(Util.apiUrl("pickup-schedules"), payload);
  if (isApiFailure(raw)) return toFailureResponse(raw, "Create failed", null);
  const data = unwrapData<PickupSchedule>(raw);
  const row = data ? ({ ...data, _id: toId(data) } as PickupSchedule) : null;
  return toSuccessResponse(raw, row);
}

export async function updatePickupSchedule(
  _id: string,
  payload: PickupSchedulePayload
): Promise<AppResponse<PickupSchedule | null>> {
  const raw = await axios.put<unknown>(Util.apiUrl(`pickup-schedules/${_id}`), payload);
  if (isApiFailure(raw)) return toFailureResponse(raw, "Update failed", null);
  const data = unwrapData<PickupSchedule>(raw);
  const row = data ? ({ ...data, _id: toId(data) } as PickupSchedule) : null;
  return toSuccessResponse(raw, row);
}

export async function deletePickupSchedule(_id: string): Promise<AppResponse<null>> {
  const raw = await axios.delete<unknown>(Util.apiUrl(`pickup-schedules/${_id}`));
  if (isApiFailure(raw)) return toFailureResponse(raw, "Delete failed", null);
  return toSuccessResponse(raw, null);
}

// Categories 
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

export async function getCategories(): Promise<AppResponse<Category[]>> {
  const raw = await axios.get<unknown>(Util.apiUrl("categories/admin"));
  if (isApiFailure(raw)) return toFailureResponse(raw, "Failed to load categories", []);
  const list = unwrapList<Category & { is_active?: boolean; id?: unknown }>(raw);
  const data = list.map((c) => ({
    ...c,
    _id: toId(c),
    isActive: c.isActive ?? c.is_active ?? true,
  })) as Category[];
  return toSuccessResponse(raw, data);
}

export async function createCategory(payload: CategoryPayload): Promise<AppResponse<Category | null>> {
  const raw = await axios.post<unknown>(Util.apiUrl("categories"), payload);
  if (isApiFailure(raw)) return toFailureResponse(raw, "Create failed", null);
  const data = unwrapData<Category>(raw);
  const row = data
    ? ({
      ...data,
      _id: toId(data),
      isActive: data.isActive ?? data.is_active ?? true,
    } as Category)
    : null;
  return toSuccessResponse(raw, row);
}

// Alias for createCategory
export const addCategory = createCategory;

export async function updateCategory(
  _id: string,
  payload: Partial<CategoryPayload>
): Promise<AppResponse<Category | null>> {
  const raw = await axios.put<unknown>(Util.apiUrl(`categories/${_id}`), payload);
  if (isApiFailure(raw)) return toFailureResponse(raw, "Update failed", null);
  const data = unwrapData<Category>(raw);
  const row = data
    ? ({
      ...data,
      _id: toId(data),
      isActive: data.isActive ?? data.is_active ?? true,
    } as Category)
    : null;
  return toSuccessResponse(raw, row);
}

export async function deleteCategory(_id: string): Promise<AppResponse<null>> {
  const raw = await axios.delete<unknown>(Util.apiUrl(`categories/${_id}`));
  if (isApiFailure(raw)) return toFailureResponse(raw, "Delete failed", null);
  return toSuccessResponse(raw, null);
}

// Collectors
export interface Collector {
  _id: string;
  full_name: string;
  area: string;
}

export async function getCollectors(): Promise<AppResponse<Collector[]>> {
  const raw = await axios.get<unknown>(Util.apiUrl("collectors"));
  if (isApiFailure(raw)) return toFailureResponse(raw, "Failed to load collectors", []);
  const list = unwrapList<Collector & { id?: unknown }>(raw);
  return toSuccessResponse(raw, list.map((c) => ({ ...c, _id: toId(c) })) as Collector[]);
}

// Collector–category assignments
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

export async function getCollectorCategoryAssignments(): Promise<AppResponse<CollectorCategoryAssignment[]>> {
  const raw = await axios.get<unknown>(Util.apiUrl("collector-category-assignments"));
  if (isApiFailure(raw)) return toFailureResponse(raw, "Failed to load assignments", []);
  const list = unwrapList<CollectorCategoryAssignment & { id?: unknown }>(raw);
  return toSuccessResponse(raw, list.map((a) => ({ ...a, _id: toId(a) })) as CollectorCategoryAssignment[]);
}

export async function createCollectorCategoryAssignment(
  payload: CollectorCategoryAssignmentPayload
): Promise<AppResponse<CollectorCategoryAssignment | null>> {
  const raw = await axios.post<unknown>(Util.apiUrl("collector-category-assignments"), payload);
  if (isApiFailure(raw)) return toFailureResponse(raw, "Assign failed", null);
  const data = unwrapData<CollectorCategoryAssignment>(raw);
  const row = data ? ({ ...data, _id: toId(data) } as CollectorCategoryAssignment) : null;
  return toSuccessResponse(raw, row);
}

export async function deleteCollectorCategoryAssignment(_id: string): Promise<AppResponse<null>> {
  const raw = await axios.delete<unknown>(Util.apiUrl(`collector-category-assignments/${_id}`));
  if (isApiFailure(raw)) return toFailureResponse(raw, "Delete failed", null);
  return toSuccessResponse(raw, null);
}

// Pickup requests (admin)
export interface PickupRequest {
  _id: string;
  citizen_name: string;
  citizen_area: string;
  item_name: string;
  category_name?: string;
  rough_weight: number;
  priority: string;
  estimated_earnings: number;
  actual_weight: number;
  final_price: number;
  status: string;
  assigned_collector?: string;
  created_at: string;
}

export async function getPickupRequests(): Promise<AppResponse<PickupRequest[]>> {
  const raw = await axios.get<unknown>(Util.apiUrl("pickup-requests/admin"));
  if (isApiFailure(raw)) return toFailureResponse(raw, "Failed to load pickup requests", []);
  const list = unwrapList<PickupRequest & { id?: unknown }>(raw);
  return toSuccessResponse(raw, list.map((r) => ({ ...r, _id: toId(r) })) as PickupRequest[]);
}

export async function updatePickupRequestStatus(_id: string, status: string): Promise<AppResponse<null>> {
  const raw = await axios.put<unknown>(Util.apiUrl(`pickup-requests/${_id}/status`), { status });
  if (isApiFailure(raw)) return toFailureResponse(raw, "Update failed", null);
  return toSuccessResponse(raw, null);
}

export async function assignCollectorToPickupRequest(
  requestId: string,
  collector_id: string
): Promise<AppResponse<null>> {
  const raw = await axios.put<unknown>(Util.apiUrl(`pickup-requests/${requestId}/assign-collector`), {
    collector_id,
  });
  if (isApiFailure(raw)) return toFailureResponse(raw, "Assign failed", null);
  return toSuccessResponse(raw, null);
}

// Price management
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

export async function getCategoriesForSelect(): Promise<AppResponse<{ _id: string; name: string }[]>> {
  const raw = await axios.get<unknown>(Util.apiUrl("categories/admin"));
  if (isApiFailure(raw)) return toFailureResponse(raw, "Failed to load categories", []);
  const list = unwrapList<{ _id?: string; id?: unknown; name: string }>(raw);
  return toSuccessResponse(raw, list.map((c) => ({ _id: toId(c), name: c.name })));
}

export async function getItems(): Promise<AppResponse<PriceItem[]>> {
  const raw = await axios.get<unknown>(Util.apiUrl("items"));
  if (isApiFailure(raw)) return toFailureResponse(raw, "Failed to load items", []);
  const list = unwrapList<PriceItem & { previous_price?: number | null; id?: unknown }>(raw);
  const data = list.map((item) => ({
    ...item,
    _id: toId(item),
    current_price: Number(item.current_price),
    previous_price: item.previous_price != null ? Number(item.previous_price) : null,
    change:
      item.previous_price != null && Number(item.previous_price) !== 0
        ? ((Number(item.current_price) - Number(item.previous_price)) / Number(item.previous_price)) * 100
        : 0,
  })) as PriceItem[];
  return toSuccessResponse(raw, data);
}

export async function createItem(payload: ItemPayload): Promise<AppResponse<PriceItem | null>> {
  const raw = await axios.post<unknown>(Util.apiUrl("items"), payload);
  if (isApiFailure(raw)) return toFailureResponse(raw, "Create failed", null);
  const data = unwrapData<PriceItem>(raw);
  const row = data
    ? ({
      ...data,
      _id: toId(data),
      current_price: Number(data.current_price),
      previous_price: data.previous_price != null ? Number(data.previous_price) : null,
    } as PriceItem)
    : null;
  return toSuccessResponse(raw, row);
}

export async function updateItem(
  _id: string,
  payload: Partial<ItemPayload> & { status?: string }
): Promise<AppResponse<PriceItem | null>> {
  const raw = await axios.put<unknown>(Util.apiUrl(`items/${_id}`), payload);
  if (isApiFailure(raw)) return toFailureResponse(raw, "Update failed", null);
  const data = unwrapData<PriceItem>(raw);
  const row = data
    ? ({
      ...data,
      _id: toId(data),
      current_price: Number(data.current_price),
      previous_price: data.previous_price != null ? Number(data.previous_price) : null,
    } as PriceItem)
    : null;
  return toSuccessResponse(raw, row);
}

export async function deleteItem(_id: string): Promise<AppResponse<null>> {
  const raw = await axios.delete<unknown>(Util.apiUrl(`items/${_id}`));
  if (isApiFailure(raw)) return toFailureResponse(raw, "Delete failed", null);
  return toSuccessResponse(raw, null);
}

// Users (admin)
export interface AdminUser {
  _id: string;
  full_name: string;
  email: string | null;
  mobile_number: string;
  area: string;
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

export async function getUsers(): Promise<AppResponse<AdminUser[]>> {
  const raw = await axios.get<unknown>(Util.apiUrl("users/admin"));
  if (isApiFailure(raw)) return toFailureResponse(raw, "Failed to load users", []);
  const list = unwrapList<AdminUser & { id?: unknown }>(raw);
  return toSuccessResponse(raw, list.map((u) => ({ ...u, _id: toId(u) })) as AdminUser[]);
}

export async function createUser(
  payload: CreateUserPayload
): Promise<AppResponse<{ user?: { username?: string } } | null>> {
  const raw = await axios.post<unknown>(Util.apiUrl("auth/signup"), payload);
  if (isApiFailure(raw)) return toFailureResponse(raw, "Create user failed", null);
  const inner =
    unwrapData<{ user?: { username?: string } }>(raw) ?? (raw as { user?: { username?: string } });
  return toSuccessResponse(raw, inner ?? null);
}

export async function updateUser(_id: string, payload: UpdateUserPayload): Promise<AppResponse<AdminUser | null>> {
  const raw = await axios.put<unknown>(Util.apiUrl(`users/${_id}`), payload);
  if (isApiFailure(raw)) return toFailureResponse(raw, "Update failed", null);
  const data = unwrapData<AdminUser>(raw);
  const row = data ? ({ ...data, _id: toId(data) } as AdminUser) : null;
  return toSuccessResponse(raw, row);
}

export async function deleteUser(_id: string): Promise<AppResponse<null>> {
  const raw = await axios.delete<unknown>(Util.apiUrl(`users/${_id}`));
  if (isApiFailure(raw)) return toFailureResponse(raw, "Delete failed", null);
  return toSuccessResponse(raw, null);
}
