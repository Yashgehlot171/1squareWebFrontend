import type { AxiosError, AxiosResponse } from "axios";
import type { ApiErrorPayload, ApiResponse } from "./types";

export interface FieldValidationError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  statusCode?: number;
  errors?: unknown;
  meta?: ApiErrorPayload["meta"];

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.statusCode = payload.statusCode;
    this.errors = payload.errors;
    this.meta = payload.meta;
  }
}

export const getFieldErrors = (error: unknown) => {
  if (!(error instanceof ApiError) || !Array.isArray(error.errors)) {
    return {};
  }

  return error.errors.reduce<Record<string, string>>((acc, item: unknown) => {
    if (typeof item !== "object" || item === null) {
      return acc;
    }
    const candidate = item as Partial<FieldValidationError>;
    if (typeof candidate.field === "string" && typeof candidate.message === "string") {
      acc[candidate.field] = candidate.message;
    }
    return acc;
  }, {});
};

export const parseApiResponse = <T>(response: AxiosResponse<ApiResponse<T>>) => {
  const payload = response.data;

  if (!payload || payload.success !== true) {
    throw new ApiError({
      success: false,
      message: payload?.message ?? "Request failed",
      errors: payload?.errors,
      meta: payload?.meta,
      statusCode: response.status,
    });
  }

  return payload;
};

export const toApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    return error;
  }

  const axiosError = error as AxiosError<ApiErrorPayload>;
  if (axiosError.response) {
    const payload = axiosError.response.data;
    if (import.meta.env.DEV && payload?.meta?.requestId) {
      console.debug("API request failed", { requestId: payload.meta.requestId, statusCode: axiosError.response.status });
    }
    return new ApiError({
      success: false,
      message: payload?.message ?? axiosError.message ?? "Request failed",
      errors: payload?.errors,
      meta: payload?.meta,
      statusCode: axiosError.response.status,
    });
  }

  return new ApiError({
    success: false,
    message: axiosError.message || "Unable to connect to server.",
  });
};
