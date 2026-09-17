import { apiEndpoints } from "./endpoints";
import { apiRequest } from "./request";

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
