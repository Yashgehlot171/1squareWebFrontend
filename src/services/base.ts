import type { ApiResponse } from "../types";

export function buildResponse<T>(data: T, requestId: string): Promise<ApiResponse<T>> {
  return Promise.resolve({
    status: "success",
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
    },
    data,
  });
}
