import { apiEndpoints } from "./api/endpoints";
import { apiRequest } from "./api/request";
import { tokenStorage } from "./api/tokenStorage";
import type { AdminStatus, LoginFormValues, PasswordFormValues, Permission, RoleCode, SessionPayload } from "../types";

interface BackendRole {
  code?: string;
  key?: string;
  name?: string;
  label?: string;
  permissions?: unknown[];
}

interface BackendUser {
  id?: string | number;
  name?: string;
  fullName?: string;
  email?: string | null;
  mobile?: string | null;
  phone?: string | null;
  role?: string | BackendRole;
  roleKey?: string;
  roleCode?: string;
  roleLabel?: string;
  permissions?: unknown[];
  status?: string;
  city?: string | null;
  avatar?: string;
  // Real fields returned by presentUser() (src/utils/userPresenter.ts) for
  // both GET /me and PATCH /me — numeric FKs, not the display strings the
  // `city`/`avatar` fields above assume. Resolving these to a city name /
  // avatar URL for display is out of scope here (would need an extra master
  // lookup / file fetch); normalizeUser below passes them through unresolved.
  cityId?: number | null;
  avatarFileId?: string | null;
  createdAt?: string;
  lastLogin?: string;
  lastLoginAt?: string;
  tokenExpiresAt?: string;
}

interface AuthResponse {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  tokenExpiresAt?: string;
  user?: BackendUser;
  admin?: BackendUser;
  role?: string | BackendRole;
  permissions?: unknown[];
}

export interface SendOtpPayload {
  mobile: string;
  selectedRole: RoleCode;
}

export interface VerifyOtpPayload extends SendOtpPayload {
  otp: string;
}

/**
 * Mirrors backend's `updateMeSchema` (1SqrPropertyBackend/src/validators/user.validator.ts)
 * exactly, verified against docs/PROJECT_MASTER.md Section 6 item 1 (Module 3c):
 * `PATCH /me` only accepts `{ name?, email?, cityId?, avatarFileId? }`.
 *
 * Scope cuts vs. the previous (never backend-compatible) payload:
 * - `mobile` is REMOVED: there is no mobile-update path via `/me` at all (or
 *   anywhere else on the backend). No UI currently exposes a mobile edit
 *   field bound to this payload (grep confirms `updateProfile`/`completeProfile`
 *   have no call sites outside this service layer), so nothing is being
 *   silently hidden here — but a future profile-edit form must not offer a
 *   mobile field bound to this call.
 * - `city` (free-text string) becomes `cityId` (numeric FK). Resolve the
 *   admin's city selection to an id using the same `/masters/cities` lookup
 *   pattern already established in lead.service.ts (`apiEndpoints.masters.byType`)
 *   before calling this — do not send a city name string.
 * - `avatar` (opaque string) becomes `avatarFileId` (numeric FK to an uploaded
 *   `File` row). Obtain it via the existing generic upload flow
 *   (`services/api/upload.ts` -> `POST /uploads`, the same pattern
 *   `MasterUploadField.tsx` already uses) rather than inventing a new upload
 *   mechanism; `profile.service.ts`'s separate `updateAvatar`/`uploadAvatarFile`
 *   helpers target an unverified `/users/me/avatar` route and are not wired
 *   to this payload.
 */
export interface UpdateProfilePayload {
  name?: string;
  email?: string | null;
  cityId?: number;
  avatarFileId?: number | null;
}

const roleLabels: Record<RoleCode, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  SUPPORT_TEAM: "Support Team",
  LEGAL_TEAM: "Legal Team",
  LOAN_TEAM: "Loan Team",
};

const roleDashboardPaths: Record<RoleCode, string> = {
  SUPER_ADMIN: "/dashboard/super-admin",
  ADMIN: "/dashboard/admin",
  SUPPORT_TEAM: "/dashboard/support",
  LEGAL_TEAM: "/dashboard/admin",
  LOAN_TEAM: "/dashboard/admin",
};

const roleCodes = new Set<RoleCode>(["SUPER_ADMIN", "ADMIN", "SUPPORT_TEAM", "LEGAL_TEAM", "LOAN_TEAM"]);
const activeStatuses = new Set<AdminStatus>(["active"]);

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const normalizeRole = (value: unknown): RoleCode => {
  const rawValue = isRecord(value) ? value.code ?? value.key ?? value.name : value;
  if (typeof rawValue !== "string") {
    return "ADMIN";
  }

  const normalized = rawValue
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toUpperCase();

  return roleCodes.has(normalized as RoleCode) ? (normalized as RoleCode) : "ADMIN";
};

const normalizeStatus = (value: unknown): AdminStatus => {
  if (typeof value !== "string") {
    return "active";
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === "blocked") {
    return "blocked";
  }
  if (normalized === "inactive") {
    return "inactive";
  }
  if (normalized === "suspended") {
    return "suspended";
  }
  return "active";
};

const normalizePermissions = (values: unknown[] | undefined): Permission[] =>
  (values ?? [])
    .map((value) => {
      if (typeof value === "string") {
        return value as Permission;
      }
      if (isRecord(value) && typeof value.code === "string") {
        return value.code as Permission;
      }
      if (isRecord(value) && typeof value.key === "string") {
        return value.key as Permission;
      }
      if (isRecord(value) && typeof value.name === "string") {
        return value.name as Permission;
      }
      return null;
    })
    .filter((value): value is Permission => Boolean(value));

const getBackendUser = (payload: AuthResponse | BackendUser): BackendUser => {
  if ("user" in payload || "admin" in payload) {
    return payload.user ?? payload.admin ?? {};
  }
  return payload;
};

const normalizeUser = (payload: AuthResponse | BackendUser) => {
  const backendUser = getBackendUser(payload);
  const roleSource = backendUser.role ?? backendUser.roleCode ?? backendUser.roleKey ?? ("role" in payload ? payload.role : undefined);
  const role = normalizeRole(roleSource);
  const roleObject = isRecord(backendUser.role) ? (backendUser.role as BackendRole) : isRecord(("role" in payload ? payload.role : undefined)) ? (payload.role as BackendRole) : undefined;
  const roleLabel = backendUser.roleLabel ?? roleObject?.label ?? roleObject?.name ?? roleLabels[role];
  const permissions = normalizePermissions(backendUser.permissions ?? ("permissions" in payload ? payload.permissions : undefined) ?? roleObject?.permissions);

  return {
    id: String(backendUser.id ?? ""),
    name: backendUser.name ?? backendUser.fullName ?? backendUser.email ?? backendUser.mobile ?? "Admin",
    email: backendUser.email ?? null,
    mobile: backendUser.mobile ?? backendUser.phone ?? "",
    role,
    roleLabel,
    permissions,
    status: normalizeStatus(backendUser.status),
    city: backendUser.city ?? (backendUser.cityId != null ? String(backendUser.cityId) : undefined),
    avatar: backendUser.avatar ?? backendUser.avatarFileId ?? undefined,
    createdAt: backendUser.createdAt,
    tokenExpiresAt: backendUser.tokenExpiresAt,
    lastLogin: backendUser.lastLogin ?? backendUser.lastLoginAt ?? "",
    lastLoginAt: backendUser.lastLoginAt,
  };
};

const normalizeSession = (payload: AuthResponse): SessionPayload => {
  const token = payload.accessToken ?? payload.token ?? "";
  const user = normalizeUser(payload);

  return {
    token,
    refreshToken: payload.refreshToken,
    tokenExpiresAt: payload.expiresAt ?? payload.tokenExpiresAt ?? user.tokenExpiresAt,
    user,
  };
};

const assertUsableAdmin = (session: SessionPayload) => {
  if (!session.token) {
    throw new Error("Login response did not include an access token.");
  }
  if (!activeStatuses.has(session.user.status)) {
    throw new Error("This admin account is inactive or blocked.");
  }
};

export const authService = {
  async login(values: LoginFormValues) {
    tokenStorage.clearAdminSession();
    const response = await apiRequest<AuthResponse>({
      url: apiEndpoints.adminAuth.login,
      method: "POST",
      data: {
        identifier: values.identifier,
        password: values.password,
        rememberMe: values.rememberMe,
      },
      skipAuth: true,
      skipToast: true,
    });
    const session = normalizeSession(response.data);
    assertUsableAdmin(session);
    tokenStorage.setSession(session, values.rememberMe);
    return { ...response, data: session };
  },

  async sendOtp(payload: SendOtpPayload) {
    return apiRequest<{ mobile: string; selectedRole: RoleCode; expiresInSeconds: number; otp?: string }>({
      url: apiEndpoints.auth.sendOtp,
      method: "POST",
      data: payload,
      skipAuth: true,
    });
  },

  async verifyOtp(payload: VerifyOtpPayload, remember = true) {
    const response = await apiRequest<AuthResponse>({
      url: apiEndpoints.auth.verifyOtp,
      method: "POST",
      data: payload,
      skipAuth: true,
    });
    const session = normalizeSession(response.data);
    assertUsableAdmin(session);
    tokenStorage.setSession(session, remember);
    return { ...response, data: session };
  },

  async selectRole(payload: SendOtpPayload) {
    return this.sendOtp(payload);
  },

  async completeProfile(payload: UpdateProfilePayload) {
    return this.updateProfile(payload);
  },

  async getMe() {
    const response = await apiRequest<BackendUser | { user: BackendUser; admin?: BackendUser }>({
      url: apiEndpoints.adminAuth.me,
      method: "GET",
      skipToast: true,
    });
    const payload = response.data;
    const user = normalizeUser(isRecord(payload) && "user" in payload ? (payload.user as BackendUser) : (payload as BackendUser));
    return { ...response, data: user };
  },

  async updateProfile(payload: UpdateProfilePayload) {
    const response = await apiRequest<BackendUser>({
      url: apiEndpoints.profile.me,
      method: "PATCH",
      data: payload,
    });
    return {
      ...response,
      data: normalizeUser(response.data),
    };
  },

  async getStoredSession() {
    const storedToken = tokenStorage.getAccessToken();
    if (!storedToken) {
      return null;
    }

    try {
      const response = await this.getMe();
      const session: SessionPayload = {
        token: tokenStorage.getAccessToken() ?? storedToken,
        refreshToken: tokenStorage.getRefreshToken() ?? undefined,
        tokenExpiresAt: response.data.tokenExpiresAt,
        user: response.data,
      };
      assertUsableAdmin(session);
      tokenStorage.setSession(session, tokenStorage.shouldPersistSession());
      return session;
    } catch {
      tokenStorage.clearAdminSession();
      return null;
    }
  },

  async forgotPassword(identifier: string) {
    return Promise.reject(new Error(`Forgot password API is not available yet for ${identifier}.`));
  },

  async resetPassword(_values: PasswordFormValues) {
    return Promise.reject(new Error("Reset password API is not available yet."));
  },

  async changePassword(values: PasswordFormValues) {
    return apiRequest<{ changed: boolean }>({
      url: apiEndpoints.adminAuth.changePassword,
      method: "POST",
      data: {
        oldPassword: values.currentPassword,
        newPassword: values.password,
      },
      skipToast: true,
    });
  },

  getRoleDashboardPath(role: RoleCode) {
    return roleDashboardPaths[role] ?? "/dashboard";
  },

  async logout() {
    const accessToken = tokenStorage.getAccessToken();
    if (accessToken) {
      await apiRequest<{ loggedOut: boolean }>({
        url: apiEndpoints.adminAuth.logout,
        method: "POST",
        skipToast: true,
      }).catch(() => undefined);
    }
    tokenStorage.clearAdminSession();
  },
};
