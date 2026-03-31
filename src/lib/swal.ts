import Swal from "sweetalert2";

function ensureSwalInteractive(popup: HTMLElement) {
  const container = popup.closest(".swal2-container") as HTMLElement | null;
  if (container) {
    container.removeAttribute("aria-hidden");
    container.style.pointerEvents = "auto";
    container.style.zIndex = "2147483646";
  }
  const backdrop = document.querySelector(".swal2-backdrop") as HTMLElement | null;
  if (backdrop) {
    backdrop.removeAttribute("aria-hidden");
    backdrop.style.pointerEvents = "auto";
    backdrop.style.zIndex = "2147483645";
  }
  queueMicrotask(() => {
    Swal.getConfirmButton()?.focus({ preventScroll: true });
  });
}

const baseOptions = {
  returnFocus: false,
  allowOutsideClick: true,
  heightAuto: false,
  didOpen: (popup: HTMLElement) => ensureSwalInteractive(popup),
} as const;

export async function swalConfirm(options: {
  title: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}): Promise<boolean> {
  const r = await Swal.fire({
    ...baseOptions,
    title: options.title,
    text: options.text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#0f766e",
    cancelButtonColor: "#6b7280",
    confirmButtonText: options.confirmButtonText ?? "Yes",
    cancelButtonText: options.cancelButtonText ?? "Cancel",
  });
  return r.isConfirmed;
}

export function swalSuccess(title: string, text?: string) {
  return Swal.fire({
    ...baseOptions,
    icon: "success",
    title,
    text: text || undefined,
    confirmButtonColor: "#0f766e",
  });
}

export function swalError(title: string, text?: string) {
  return Swal.fire({
    ...baseOptions,
    icon: "error",
    title,
    text: text || undefined,
    confirmButtonColor: "#0f766e",
  });
}
