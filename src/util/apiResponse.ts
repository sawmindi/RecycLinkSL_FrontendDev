import type { AppResponse } from "../models/Response";

export function isApiFailure(raw: unknown): boolean {
  return (
    raw !== null &&
    typeof raw === "object" &&
    "success" in raw &&
    (raw as { success: unknown }).success === false
  );
}

export function toFailureResponse<T>(raw: unknown, fallbackMessage: string, data: T): AppResponse<T> {
  const r = raw as Partial<AppResponse<unknown>> & { error?: unknown };
  const fromError =
    r.error && typeof r.error === "object" && r.error !== null && "message" in r.error
      ? String((r.error as { message?: string }).message)
      : "";
  const msg =
    (typeof r.message === "string" && r.message.trim()) ||
    fromError ||
    fallbackMessage;
  return {
    success: false,
    message: msg,
    data,
    token: typeof r.token === "string" ? r.token : "",
  };
}

export function toSuccessResponse<T>(raw: unknown, data: T): AppResponse<T> {
  const r = raw as Partial<AppResponse<unknown>>;
  return {
    success: true,
    message: typeof r.message === "string" ? r.message : "",
    data,
    token: typeof r.token === "string" ? r.token : "",
  };
}

export function networkError<T>(message: string, data: T): AppResponse<T> {
  return { success: false, message, data, token: "" };
}
