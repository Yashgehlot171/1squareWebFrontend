import { apiEndpoints } from "./api/endpoints";
import { apiRequest } from "./api/request";
// These three methods were previously typed against the mock-era
// `RoleDefinition`/`PermissionRecord` shapes even though they call the same
// real `/admin/roles` and `/admin/permissions` endpoints as
// `role.service.ts` (verified during this session's Roles & Permissions
// wiring task). They are unused elsewhere in the app (dead code) but are
// re-typed here against the real response shapes, defined once in
// `role.service.ts`, instead of leaving a second, wrong-shaped contract for
// this same pair of endpoints lying around.
import type { PermissionApiItem, RoleApiItem } from "./role.service";

export const masterService = {
  getRoles() {
    return apiRequest<RoleApiItem[]>({
      url: apiEndpoints.masters.roles,
      method: "GET",
    });
  },

  getRoleById(id: string) {
    return apiRequest<RoleApiItem>({
      url: apiEndpoints.masters.roleById(id),
      method: "GET",
    });
  },

  getPermissions() {
    return apiRequest<PermissionApiItem[]>({
      url: apiEndpoints.masters.permissions,
      method: "GET",
    });
  },
};
