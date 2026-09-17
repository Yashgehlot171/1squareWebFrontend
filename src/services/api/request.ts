import type { AxiosRequestConfig } from "axios";
import { apiClient } from "./apiClient";
import { parseApiResponse } from "./responseParser";
import type { ApiResponse } from "./types";

export interface ApiRequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  skipLoader?: boolean;
  skipToast?: boolean;
}

export async function apiRequest<T>(config: ApiRequestConfig) {
  const response = await apiClient.request<ApiResponse<T>>(config);
  return parseApiResponse<T>(response);
}
