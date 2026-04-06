import axios from "axios";
import { Util } from "../Util";
import { AppResponse } from "../models/Response";
import { isApiFailure, networkError, toFailureResponse, toSuccessResponse } from "../util/apiResponse";

export interface CancelPickupPayload {
  citizenId?: string;
  status?: string;
}

async function postCancel(url: string, payload: Record<string, unknown> = {}): Promise<AppResponse<null>> {
  try {
    const raw = await axios.post<unknown>(url, payload);
    if (isApiFailure(raw)) return toFailureResponse(raw, "Cancel pickup failed", null);
    return toSuccessResponse(raw, null);
  } catch {
    return networkError("Network error", null);
  }
}

export async function cancelCollectorPickupRequest(
  requestId: string,
  payload: CancelPickupPayload = {}
): Promise<AppResponse<null>> {
  return postCancel(Util.apiUrl(`collector/pickups/${requestId}/cancel`), payload as Record<string, unknown>);
}

export async function cancelCitizenPickupRequest(
  requestId: string,
  payload: CancelPickupPayload = {}
): Promise<AppResponse<null>> {
  return postCancel(Util.apiUrl(`citizen/pickups/${requestId}/cancel`), payload as Record<string, unknown>);
}

export async function cancelAdminPickupRequest(
  requestId: string,
  payload: CancelPickupPayload = {}
): Promise<AppResponse<null>> {
  return postCancel(Util.apiUrl(`admin/pickups/${requestId}/cancel`), payload as Record<string, unknown>);
}
