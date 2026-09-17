import { apiEndpoints } from "./api/endpoints";
import { apiRequest } from "./api/request";
import type { Permission, RoleDefinition } from "../types";

export interface PermissionRecord {
  key: Permission;
  label?: string;
  group?: string;
  description?: string;
}

export const masterService = {
  getRoles() {
    return apiRequest<RoleDefinition[]>({
      url: apiEndpoints.masters.roles,
      method: "GET",
    });
  },

  getRoleById(id: string) {
    return apiRequest<RoleDefinition>({
      url: `${apiEndpoints.masters.roles}/${id}`,
      method: "GET",
    });
  },

  getPermissions() {
    return apiRequest<PermissionRecord[]>({
      url: apiEndpoints.masters.permissions,
      method: "GET",
    });
  },
};
