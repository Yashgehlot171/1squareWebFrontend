import { apiEndpoints } from "./api/endpoints";
import { apiRequest } from "./api/request";
import type { ApiResponse } from "./api/types";

const ADMIN_USERS = "/admin/users";

/**
 * Shapes below mirror `presentUser()` in
 * 1SqrPropertyBackend/src/utils/userPresenter.ts, the request/response
 * schemas in 1SqrPropertyBackend/src/validators/user.validator.ts
 * (adminUserListSchema, createAdminUserSchema, updateAdminUserSchema,
 * updateUserStatusSchema, updateUserRoleSchema), and the route wiring in
 * 1SqrPropertyBackend/src/routes/adminUser.routes.ts (mounted at
 * /api/v1/admin/users, gated by USER_VIEW / USER_CREATE / USER_EDIT).
 *
 * NOTE: `presentUser()` does NOT return `createdAt`/`lastLogin` fields at
 * all. The old mock-era `UserRecord` type (src/types/index.ts) had
 * `createdDate`/`lastLogin` columns — those cannot be populated from this
 * endpoint and have been dropped from the live UI. If the product wants
 * "registered date" / "last login" columns back, that needs a backend
 * change (expose `createdAt` and/or last-login timestamp on presentUser),
 * not a frontend guess.
 */

export interface AdminUserRole {
  id: number;
  name: string;
  slug: string;
}

/**
 * Shape inferred from prisma/schema.prisma's BrokerProfile model
 * (companyName, gstNumber, officeCityId, reraRegistrationNo, officeAddress,
 * experienceYears, bio, verificationStatus, verifiedAt). `presentUser()`
 * passes `brokerProfile` straight through from Prisma untouched (typed as
 * `unknown` there), so this interface is a best-effort mirror of the Prisma
 * model's camelCase field names, NOT independently verified against a live
 * response. Treat fields as possibly absent/renamed until confirmed live.
 */
export interface AdminBrokerProfile {
  id: string;
  companyName: string | null;
  gstNumber: string | null;
  officeCityId: number | null;
  reraRegistrationNo: string | null;
  officeAddress: string | null;
  experienceYears: number | null;
  bio: string | null;
  verificationStatus: "PENDING" | "APPROVED" | "REJECTED" | string;
  verifiedAt: string | null;
}

export type AdminUserStatus = "active" | "inactive" | "blocked";

export interface AdminUserRecord {
  id: string;
  name: string | null;
  email: string | null;
  mobile: string | null;
  status: AdminUserStatus;
  cityId: number | null;
  avatarFileId: string | null;
  selectedRole: string | null;
  roles: AdminUserRole[];
  permissions: string[];
  isProfileCompleted: boolean;
  brokerProfile: AdminBrokerProfile | null;
}

export interface AdminUserListParams {
  search?: string;
  role?: string;
  status?: AdminUserStatus;
  cityId?: number;
  page?: number;
  limit?: number;
}

interface AdminUserListEnvelope {
  users: AdminUserRecord[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface AdminUserListResult {
  items: AdminUserRecord[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateAdminUserInput {
  name: string;
  email?: string;
  mobile: string;
  password: string;
  roleId: number;
  cityId?: number;
  status?: AdminUserStatus;
}

export interface UpdateAdminUserInput {
  name?: string;
  email?: string | null;
  mobile?: string;
  cityId?: number | null;
}

export interface AdminRoleOption {
  id: number;
  name: string;
  slug: string;
  isActive?: boolean;
}

/**
 * "Internal staff" role slugs, copied verbatim from
 * 1SqrPropertyBackend/src/constants/auth.ts's `ADMIN_ROLE_SLUGS` — the exact
 * set the backend itself uses to decide who is allowed to use admin login
 * (`authService.adminLogin`'s `ADMIN_ROLE_SLUGS.includes(role.slug)` check).
 * There is no single backend role slug meaning "employee" (see
 * prisma/seed.ts's seeded role list), and the admin/users list endpoint's
 * `role` filter accepts exactly one slug per request (no OR support) — see
 * `user.repository.ts`'s `list()`. Reusing this backend-authoritative
 * constant, rather than inventing a separate frontend guess, is the
 * least-guessy way to define "Employees" for the Employee Management
 * screen.
 */
export const STAFF_ROLE_SLUGS = ["super-admin", "admin", "support", "finance", "legal", "construction"] as const;

/**
 * "Customer-facing" role slugs used for the Customer Management screen.
 * Judgment call (explicitly flagged, not silently assumed): the seeded
 * `customer` role slug is not what self-registered end users actually end
 * up holding. `resolveSecurityRole()` in
 * 1SqrPropertyBackend/src/services/auth.service.ts, driven by
 * `MOBILE_ROLE_SECURITY_ROLE_SLUGS` in src/constants/auth.ts, tries
 * `buyer`/`seller` RBAC role slugs FIRST and only falls back to `customer`
 * if those roles don't exist in a given environment — and this backend's
 * seed.ts does seed `buyer` and `seller` roles, so that fallback never
 * triggers here. Real customers therefore carry RBAC role slug `buyer` or
 * `seller`, not `customer`. This is also the same "customers = buyer +
 * seller" definition `report.repository.ts` already uses server-side (see
 * its `selectedRole: { in: ["buyer", "seller"] }` filters for the
 * "customers" report type), so this is not a novel frontend invention —
 * it matches existing backend precedent for what "customer" means.
 */
export const CUSTOMER_ROLE_SLUGS = ["buyer", "seller"] as const;

const normalizeList = (response: ApiResponse<AdminUserListEnvelope>): ApiResponse<AdminUserListResult> => ({
  ...response,
  data: {
    items: response.data.users,
    page: response.data.pagination.page,
    limit: response.data.pagination.limit,
    total: response.data.pagination.total,
    totalPages: response.data.pagination.totalPages,
  },
});

export const userService = {
  /** GET /api/v1/admin/users (adminUserListSchema, USER_VIEW). */
  async getUsers(params: AdminUserListParams = {}) {
    const response = await apiRequest<AdminUserListEnvelope>({
      url: ADMIN_USERS,
      method: "GET",
      params,
    });
    return normalizeList(response);
  },

  /**
   * Frontend-only workaround for the backend's single-slug `role` filter:
   * fires one GET /admin/users request per role slug in `roles` and merges
   * the results client-side (de-duplicated by id — a user should only ever
   * hold one RBAC role in this schema, see `replaceRole()` in
   * user.repository.ts, so overlap is not expected in practice).
   *
   * Each request is made with the SAME `page`/`limit` the caller passed
   * (default page 1 / limit 20), mirroring the existing "fetch up to
   * `limit` rows and operate on them client-side" pattern already used by
   * lead.service.ts + LeadManagementPage.tsx (that page fetches
   * `{ limit: 100, page: 1 }` once and does search/pagination entirely in
   * the browser over that batch). Same limitation applies here: if a single
   * role bucket has more matching rows than `limit`, rows beyond that
   * per-role cutoff are not loaded into the merged table. `total` below IS
   * an exact sum of each role's server-reported count, so it is safe to
   * display as a headline number even when the full set isn't loaded.
   *
   * A proper fix (backend accepting `role` as CSV/array and OR-filtering
   * server-side, so this could be one paginated request) is a reasonable
   * backend enhancement to recommend, but is out of scope here — this task
   * is frontend-only wiring over the existing endpoint.
   */
  async getUsersByRoles(roles: readonly string[], params: Omit<AdminUserListParams, "role"> = {}) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const responses = await Promise.all(roles.map((role) => this.getUsers({ ...params, role, page, limit })));

    const merged = new Map<string, AdminUserRecord>();
    let total = 0;
    responses.forEach((response) => {
      total += response.data.total;
      response.data.items.forEach((item) => merged.set(item.id, item));
    });

    const base = responses[0];
    const result: ApiResponse<AdminUserListResult> = {
      ...base,
      data: {
        items: Array.from(merged.values()),
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    return result;
  },

  /** GET /api/v1/admin/users/:userId (userIdParamSchema, USER_VIEW). */
  async getUserById(id: string) {
    return apiRequest<AdminUserRecord>({
      url: `${ADMIN_USERS}/${id}`,
      method: "GET",
    });
  },

  /** POST /api/v1/admin/users (createAdminUserSchema, USER_CREATE). */
  async createUser(input: CreateAdminUserInput) {
    return apiRequest<AdminUserRecord>({
      url: ADMIN_USERS,
      method: "POST",
      data: input,
    });
  },

  /**
   * PATCH /api/v1/admin/users/:userId (updateAdminUserSchema, USER_EDIT).
   * Only name/email/mobile/cityId are editable here — role and status
   * changes go through the two dedicated endpoints below.
   */
  async updateUser(id: string, input: UpdateAdminUserInput) {
    return apiRequest<AdminUserRecord>({
      url: `${ADMIN_USERS}/${id}`,
      method: "PATCH",
      data: input,
    });
  },

  /**
   * PATCH /api/v1/admin/users/:userId/status (updateUserStatusSchema,
   * USER_EDIT). This is the ban/unban/block action — `status` is one of
   * "active" | "inactive" | "blocked". Backend also revokes all active
   * sessions server-side whenever status is set to anything other than
   * "active" (see userService.updateStatus in
   * 1SqrPropertyBackend/src/services/user.service.ts).
   */
  async updateUserStatus(id: string, status: AdminUserStatus) {
    return apiRequest<AdminUserRecord>({
      url: `${ADMIN_USERS}/${id}/status`,
      method: "PATCH",
      data: { status },
    });
  },

  /**
   * PATCH /api/v1/admin/users/:userId/role (updateUserRoleSchema,
   * USER_EDIT). This REPLACES the user's RBAC role entirely (see
   * `replaceRole()` in user.repository.ts — it deletes all existing
   * UserRole rows for this user before creating the new one), it does not
   * add a second role alongside the existing one.
   */
  async updateUserRole(id: string, roleId: number) {
    return apiRequest<AdminUserRecord>({
      url: `${ADMIN_USERS}/${id}/role`,
      method: "PATCH",
      data: { roleId },
    });
  },

  /** PATCH /api/v1/admin/brokers/:userId/verification (USER_EDIT). */
  async updateBrokerVerification(id: string, status: "PENDING" | "APPROVED" | "REJECTED") {
    return apiRequest<AdminUserRecord>({
      url: `/admin/brokers/${id}/verification`,
      method: "PATCH",
      data: { status },
    });
  },

  /**
   * GET /api/v1/admin/roles (roleRouter, ROLE_VIEW — verified in
   * docs/PROJECT_MASTER.md Section 6 item 1 / apiEndpoints.masters.roles
   * comment). Used ONLY to populate the roleId picker for
   * create/change-role actions on this screen. `role.service.ts` (used by
   * the separate Roles & Permissions admin module, src/modules/roles/) now
   * also calls this same real endpoint and returns the full `RoleApiItem`
   * shape (numeric `id`, `isActive` boolean, `permissions` as objects) —
   * kept as a separate, narrower `AdminRoleOption` type here rather than
   * importing `RoleApiItem`, since this call site only needs id/name/slug
   * for a picker. Response is a plain array (no {items,pagination}
   * envelope) — verified against `roleController.list` -> `roleService.list()`
   * returning an array directly.
   */
  async getAssignableRoles() {
    return apiRequest<AdminRoleOption[]>({
      url: apiEndpoints.masters.roles,
      method: "GET",
    });
  },
};
