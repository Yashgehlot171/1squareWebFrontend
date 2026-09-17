const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const apiConfig = {
  baseUrl: trimTrailingSlash(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1"),
  timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 30000),
};
