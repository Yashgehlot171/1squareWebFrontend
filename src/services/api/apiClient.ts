import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { clearSession, setGlobalLoading, setGlobalMessage, store } from "../../app/store";
import { apiConfig } from "./config";
import { apiEndpoints } from "./endpoints";
import { parseApiResponse, toApiError } from "./responseParser";
import { tokenStorage } from "./tokenStorage";
import type { ApiResponse } from "./types";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  skipAuth?: boolean;
  skipLoader?: boolean;
  skipToast?: boolean;
}

let activeRequests = 0;
let refreshPromise: Promise<string | null> | null = null;

const setLoading = (enabled: boolean) => {
  activeRequests += enabled ? 1 : -1;
  activeRequests = Math.max(activeRequests, 0);
  store.dispatch(setGlobalLoading(activeRequests > 0));
};

const refreshAccessToken = async () => {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  const response = await axios.post<ApiResponse<{ token?: string; accessToken?: string; refreshToken?: string }>>(
    `${apiConfig.baseUrl}${apiEndpoints.adminAuth.refreshToken}`,
    { refreshToken },
    { timeout: apiConfig.timeout },
  );
  const parsed = parseApiResponse(response);
  tokenStorage.updateSessionTokens(parsed.data);
  return parsed.data.token ?? parsed.data.accessToken ?? null;
};

export const apiClient = axios.create({
  baseURL: apiConfig.baseUrl,
  timeout: apiConfig.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config: RetryableRequestConfig) => {
    if (!config.skipLoader) {
      setLoading(true);
    }

    const token = tokenStorage.getAccessToken();
    if (token && !config.skipAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    setLoading(false);
    return Promise.reject(toApiError(error));
  },
);

apiClient.interceptors.response.use(
  (response) => {
    const config = response.config as RetryableRequestConfig;
    if (!config.skipLoader) {
      setLoading(false);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    if (originalRequest && !originalRequest.skipLoader) {
      setLoading(false);
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !originalRequest.skipAuth) {
      originalRequest._retry = true;
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });

      try {
        const newToken = await refreshPromise;
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        tokenStorage.clearSession();
        store.dispatch(clearSession());
      }

      tokenStorage.clearSession();
      store.dispatch(clearSession());
      window.history.replaceState(null, "", "/login");
    }

    const apiError = toApiError(error);
    if (!originalRequest?.skipToast) {
      store.dispatch(setGlobalMessage({ message: apiError.message, severity: "error" }));
    }
    return Promise.reject(apiError);
  },
);
