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
    return uploadFile<{ url: string; avatar?: string }>(file, {
      fieldName: "avatar",
    });
  },
};
