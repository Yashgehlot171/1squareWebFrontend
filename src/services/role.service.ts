import { apiEndpoints } from "./api/endpoints";
import { apiRequest } from "./api/request";

/**
 * Roles & Permissions admin module, wired against
 * 1SqrPropertyBackend/src/routes/role.routes.ts (`roleRouter`, mounted at
 * `apiRouter.use("/admin", roleRouter)` — full paths are `/admin/roles` and
 * `/admin/permissions`, NOT `/admin/masters/roles`). Contract confirmed via
 * backend source (`role.service.ts`'s `presentRole()`) for this session's
 * Roles & Permissions task:
 *
 * - GET /admin/roles (ROLE_VIEW) and GET /admin/roles/:roleId (ROLE_VIEW)
 *   both return a PLAIN ARRAY / single object (no {items,pagination}
 *   envelope) shaped exactly like `RoleApiItem` below, with `permissions` as
 *   the full joined `Permission` object array (not just ids).
 * - POST /admin/roles (ROLE_CREATE): body {name, description?, isActive?}.
 *   The backend auto-generates `slug` via `slugify(name)` — never send slug.
 * - PATCH /admin/roles/:roleId (ROLE_EDIT): body {name?, description?,
 *   isActive?}. Does NOT touch permissions.
 * - DELETE /admin/roles/:roleId (ROLE_DELETE): backend rejects with 400
 *   "SUPER_ADMIN role cannot be deleted" when slug === "super-admin".
 * - GET /admin/permissions (PERMISSION_VIEW): plain array of every
 *   permission in the system, ordered by module then action.
 * - PATCH /admin/roles/:roleId/permissions (PERMISSION_EDIT): body
 *   {permissionIds: number[]}. REPLACES the role's entire permission set.
 *   Backend also self-lockout-guards this: if the target role is
 *   "super-admin" and the requester currently holds super-admin, dropping
 *   any of ROLE_CREATE/ROLE_EDIT/ROLE_DELETE/PERMISSION_VIEW/PERMISSION_EDIT
 *   that the role currently holds is rejected with 400 "Cannot remove your
 *   own critical role/permission management permissions". Callers must
 *   surface that message, not swallow it.
 *
 * None of this has been exercised live yet (no combined live-test round for
 * this module has happened) — contract-match confidence is from direct
 * backend source verification, not a live call.
 */

export const SUPER_ADMIN_ROLE_SLUG = "super-admin";

export interface PermissionApiItem {
  id: number;
  module: string;
  action: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoleApiItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  permissions: PermissionApiItem[];
}

export interface RoleMutationInput {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export const roleService = {
  async list(): Promise<RoleApiItem[]> {
    const response = await apiRequest<RoleApiItem[]>({
      url: apiEndpoints.masters.roles,
      method: "GET",
    });
    return response.data;
  },

  async getById(id: number | string): Promise<RoleApiItem> {
    const response = await apiRequest<RoleApiItem>({
      url: apiEndpoints.masters.roleById(id),
      method: "GET",
    });
    return response.data;
  },

  async create(input: RoleMutationInput): Promise<RoleApiItem> {
    const response = await apiRequest<RoleApiItem>({
      url: apiEndpoints.masters.roles,
      method: "POST",
      data: input,
    });
    return response.data;
  },

  async update(id: number | string, input: RoleMutationInput): Promise<RoleApiItem> {
    const response = await apiRequest<RoleApiItem>({
      url: apiEndpoints.masters.roleById(id),
      method: "PATCH",
      data: input,
    });
    return response.data;
  },

  async remove(id: number | string): Promise<void> {
    await apiRequest<{ deleted: boolean }>({
      url: apiEndpoints.masters.roleById(id),
      method: "DELETE",
    });
  },

  async listPermissions(): Promise<PermissionApiItem[]> {
    const response = await apiRequest<PermissionApiItem[]>({
      url: apiEndpoints.masters.permissions,
      method: "GET",
    });
    return response.data;
  },

  /**
   * Replaces the role's entire permission set. See the guard note above —
   * a rejection here (e.g. the self-lockout guard) throws an `ApiError`
   * whose `.message` is the backend's explanation; callers must display it.
   */
  async updatePermissions(id: number | string, permissionIds: number[]): Promise<RoleApiItem> {
    const response = await apiRequest<RoleApiItem>({
      url: apiEndpoints.masters.rolePermissions(id),
      method: "PATCH",
      data: { permissionIds },
    });
    return response.data;
  },
};
