export const apiEndpoints = {
  auth: {
    sendOtp: "/auth/otp/send",
    verifyOtp: "/auth/otp/verify",
    session: "/auth/session",
    logout: "/auth/logout",
    refreshToken: "/auth/refresh-token",
    adminLogin: "/admin/auth/login",
  },
  adminAuth: {
    login: "/admin/auth/login",
    // Verified in docs/PROJECT_MASTER.md Section 6 item 1 (Module 3c): backend
    // mounts `meRouter` at `apiRouter.use("/me", meRouter)`, giving
    // GET/PATCH /api/v1/me (authenticate-gated only, no admin-specific route).
    // "/admin/me" never existed on the backend.
    me: "/me",
    refreshToken: "/auth/refresh-token",
    logout: "/auth/logout",
    changePassword: "/admin/auth/change-password",
  },
  profile: {
    // Same real backend route as adminAuth.me above (there is only one /me
    // router, shared by regular and admin logins) — kept as a separate key
    // since profile.service.ts addresses it by this name, not consolidated
    // into adminAuth.me to avoid an unrelated rename ripple. "/users/me"
    // never existed on the backend.
    me: "/me",
    // NOT verified against a backend route (full-repo grep found no
    // avatar-specific route under /users or /me). Left unchanged/unused by
    // this fix; profile.service.ts's updateAvatar/uploadAvatarFile calls
    // remain unwired until a real avatar endpoint is confirmed.
    avatar: "/users/me/avatar",
  },
  masters: {
    // Verified in docs/PROJECT_MASTER.md Section 6 item 1 (Module 3c):
    // roleRouter is mounted at apiRouter.use("/admin", roleRouter), so the
    // real paths are /api/v1/admin/roles and /api/v1/admin/permissions.
    roles: "/admin/roles",
    permissions: "/admin/permissions",
    // Generic config-driven master-data lookup, verified against
    // 1SqrPropertyBackend/src/routes/master.routes.ts
    // (`apiRouter.use("/masters", publicMasterRouter)` in src/routes/index.ts),
    // and 1SqrPropertyBackend/src/config/master.config.ts, which registers
    // "lead-statuses" (model: leadStatus) and "lead-sources" (model:
    // leadSource) as master types. Used by lead.service.ts for live
    // status/source option lists instead of hardcoding them.
    byType: (type: string) => `/masters/${type}`,
  },
  adminProperties: {
    base: "/admin/properties",
  },
  adminLeads: {
    base: "/admin/leads",
  },
  constructionPlanMaster: {
    plans: "/admin/master/construction-plans",
    categories: "/admin/master/construction-specification-categories",
    fields: "/admin/master/construction-specification-fields",
    values: "/admin/master/construction-plan-specification-values",
    compare: "/construction-plans/compare",
  },
  upload: {
    file: "/uploads",
  },
} as const;
