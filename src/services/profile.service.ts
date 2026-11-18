import { authService, type UpdateProfilePayload } from "./auth.service";
import { apiEndpoints } from "./api/endpoints";
import { apiRequest } from "./api/request";
import { uploadFile } from "./api/upload";

export const profileService = {
  getMe() {
    return authService.getMe();
  },

  updateProfile(payload: UpdateProfilePayload) {
    return authService.updateProfile(payload);
  },

  completeProfile(payload: UpdateProfilePayload) {
    return authService.completeProfile(payload);
  },

  updateAvatar(avatar: string) {
    return apiRequest<{ avatar: string }>({
      url: apiEndpoints.profile.avatar,
      method: "POST",
      data: { avatar },
    });
  },

  uploadFile,

  async uploadAvatarFile(file: File | Blob) {
    // Backend's multer config is `upload.single("file")` (see
    // 1SqrPropertyBackend/src/routes/upload.routes.ts) — the multipart field
    // must be literally named "file", not "avatar", or multer never finds
    // the file (previously silently broken, separate from the missing
    // `module` below). `module: "profile"` is required by
    // `createUploadSchema` or the backend returns 422.
    return uploadFile<{ url: string; avatar?: string }>(file, {
      extraFields: { module: "profile" },
    });
  },
};
