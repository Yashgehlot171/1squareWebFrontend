import { apiEndpoints } from "./endpoints";
import { apiRequest } from "./request";

/**
 * Mirrors `uploadModules` in
 * 1SqrPropertyBackend/src/validators/upload.validator.ts (`createUploadSchema`
 * -> `module: z.enum(uploadModules)`), read directly from backend source on
 * 2026-09-17. `module` is REQUIRED on every `POST /uploads` request — a
 * missing value fails Zod validation and the global error handler returns a
 * 422, which is exactly the symptom this type's callers were fixed for. Keep
 * this list in sync with the backend enum; do not add values here that the
 * backend doesn't also accept.
 */
export const uploadModules = [
  "profile",
  "property",
  "broker",
  "construction",
  "legal",
  "loan",
  "support",
  "supplier",
  "provider",
  "notification",
  "banner",
  "cms",
] as const;

export type UploadModule = (typeof uploadModules)[number];

export interface UploadFileOptions {
  endpoint?: string;
  fieldName?: string;
  extraFields?: Record<string, string | Blob>;
}

export function buildFormData(file: File | Blob, options: UploadFileOptions = {}) {
  const formData = new FormData();
  formData.append(options.fieldName ?? "file", file);

  Object.entries(options.extraFields ?? {}).forEach(([key, value]) => {
    formData.append(key, value);
  });

  return formData;
}

export async function uploadFile<T>(file: File | Blob, options: UploadFileOptions = {}) {
  return apiRequest<T>({
    url: options.endpoint ?? apiEndpoints.upload.file,
    method: "POST",
    data: buildFormData(file, options),
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
