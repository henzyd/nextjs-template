import { isAxiosError, type AxiosError } from "axios";
import type { ApiErrorResponse, ErrorWithResponse } from "@/types/api";
import { notifyError } from "@/lib/utils/toast";

export function getApiErrorData(error: unknown): ApiErrorResponse | null {
  if (!error || typeof error !== "object") return null;

  if (isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data ?? null;
  }

  return (error as ErrorWithResponse).response?.data ?? null;
}

export function getApiErrorStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;
  return (error as ErrorWithResponse).response?.status;
}

export function isApiUnreachableError(error: AxiosError): boolean {
  if (error.response || error.code === "ERR_CANCELED") return false;
  return ["ERR_NETWORK", "ECONNABORTED"].includes(error.code ?? "");
}

export function handleApiError(
  error: unknown,
  customHandlers: Partial<Record<number, () => void>> = {}
): void {
  if (isAxiosError(error) && isApiUnreachableError(error)) {
    notifyError({
      message: "The service is unavailable. Please try again later.",
    });
    return;
  }

  const status = getApiErrorStatus(error);
  if (status && customHandlers[status]) {
    customHandlers[status]?.();
    return;
  }

  const data = getApiErrorData(error);
  const defaults: Record<number, string> = {
    400: "Please check your input and try again.",
    401: "Your session is not authorized.",
    403: "You do not have permission to perform this action.",
    404: "The requested resource was not found.",
    409: "The request conflicts with the current state.",
    500: "The service encountered an error. Please try again later.",
  };

  notifyError({
    message:
      data?.detail ??
      data?.message ??
      (status ? defaults[status] : undefined) ??
      "The request could not be completed.",
  });
}
