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
    // roleById/rolePermissions added for the Roles & Permissions admin
    // module (src/modules/roles/) — GET/PATCH/DELETE .../:roleId and the
    // dedicated PATCH .../:roleId/permissions (PERMISSION_EDIT) that
    // replaces a role's entire permission set, all on the same roleRouter.
    roles: "/admin/roles",
    roleById: (id: string | number) => `/admin/roles/${id}`,
    rolePermissions: (id: string | number) => `/admin/roles/${id}/permissions`,
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
  // Admin master CRUD, verified live against 1SqrPropertyBackend's
  // adminMasterRouter (src/routes/master.routes.ts, mounted at
  // apiRouter.use("/admin/masters", adminMasterRouter)): GET list, GET by id,
  // POST create, PATCH update, DELETE, PATCH .../status. Confirmed by direct
  // GET/POST/PATCH(status)/DELETE calls against the running backend on
  // 2026-09-17 for the "states"/"cities"/"areas" master types specifically
  // (masterCrud.service.ts). Note: PATCH .../:id (plain update, no /status
  // suffix) is currently broken server-side for every master type — see
  // masterCrud.service.ts's updateMaster doc comment.
  adminMasters: {
    base: (type: string) => `/admin/masters/${type}`,
    byId: (type: string, id: string | number) => `/admin/masters/${type}/${id}`,
    status: (type: string, id: string | number) => `/admin/masters/${type}/${id}/status`,
  },
  adminProperties: {
    base: "/admin/properties",
  },
  adminConstruction: {
    builders: "/admin/construction/builders",
    builder: (userId: string | number) => `/admin/construction/builders/${userId}`,
    builderCapability: (userId: string | number) => `/admin/construction/builders/${userId}/capability`,
    dashboardSummary: "/admin/construction/plan-approvals/summary",
    planApprovals: "/admin/construction/plan-approvals",
    planVersion: (versionId: string | number) => `/admin/construction/plan-approvals/${versionId}`,
    planReview: (versionId: string | number) => `/admin/construction/plan-approvals/${versionId}/review`,
    rfqSummary: "/admin/construction/rfqs/summary",
    rfqs: "/admin/construction/rfqs",
    rfq: (id: string | number) => `/admin/construction/rfqs/${id}`,
    projects: "/admin/construction/projects",
    project: (id: string | number) => `/admin/construction/projects/${id}`,
    projectMilestones: (id: string | number) => `/admin/construction/projects/${id}/milestones`,
    projectPayments: (id: string | number) => `/admin/construction/projects/${id}/payments`,
    projectChangeOrders: (id: string | number) => `/admin/construction/projects/${id}/change-orders`,
    projectHandover: (id: string | number) => `/admin/construction/projects/${id}/handover`,
    projectReview: (id: string | number) => `/admin/construction/projects/${id}/review`,
    projectPaymentProof: (id: string | number, paymentId: string | number) => `/admin/construction/projects/${id}/payments/${paymentId}/proof`,
  },
  adminLeads: {
    base: "/admin/leads",
  },
  adminPropertyLeads: {
    config: "/admin/property-leads/config",
    purchases: "/admin/property-leads/purchases",
  },
  constructionPlanMaster: {
    plans: "/admin/master/construction-plans",
    categories: "/admin/master/construction-specification-categories",
    fields: "/admin/master/construction-specification-fields",
    values: "/admin/master/construction-plan-specification-values",
    compare: "/construction-plans/compare",
  },
  // Banks are NOT a generic `/admin/masters/:type` resource — verified against
  // 1SqrPropertyBackend/src/routes/loan.routes.ts (`adminLoanRouter`, mounted
  // at apiRouter.use("/admin/loans", adminLoanRouter)). Distinct contract from
  // the generic masters router: `isActive` is a real boolean (not the
  // "active"/"inactive" string enum used elsewhere), permissions are
  // `BANK_VIEW`/`BANK_CREATE`/`BANK_EDIT`/`BANK_DELETE` (not `MASTER_*`), the
  // admin list endpoint returns a plain array (NOT the canonical
  // `{items, pagination}` envelope — confirmed live 2026-09-18), and there is
  // no GET-by-id route (only list/create/update/delete/status). Live-verified
  // end-to-end (create -> list re-fetch -> status toggle -> delete -> list
  // re-fetch confirms removal) on 2026-09-18 against production.
  adminLoans: {
    banks: "/admin/loans/banks",
    bankById: (id: string | number) => `/admin/loans/banks/${id}`,
    bankStatus: (id: string | number) => `/admin/loans/banks/${id}/status`,
  },
  // Banners are also NOT a generic master type — verified against
  // 1SqrPropertyBackend/src/routes/banner.routes.ts (`adminBannerRouter`,
  // mounted at apiRouter.use("/admin/banners", adminBannerRouter)). Unlike
  // Banks, the list endpoint DOES follow the canonical `{items, pagination}`
  // envelope, there IS a GET-by-id route, and status is the "active"/
  // "inactive" string enum via a dedicated `/:bannerId/status` endpoint (not
  // part of the plain PATCH body contract). Permissions are `BANNER_VIEW`/
  // `BANNER_CREATE`/`BANNER_EDIT`/`BANNER_DELETE`. Live-verified end-to-end,
  // including the update endpoint specifically (first live edit test since
  // its params-inheritance bug fix was deployed) on 2026-09-18 against
  // production: create -> PATCH edit -> fresh GET re-fetch confirms the edit
  // persisted -> status toggle via the dedicated endpoint -> fresh GET
  // re-fetch confirms -> delete -> GET re-fetch returns 404.
  adminBanners: {
    base: "/admin/banners",
    byId: (id: string | number) => `/admin/banners/${id}`,
    status: (id: string | number) => `/admin/banners/${id}/status`,
  },
  upload: {
    file: "/uploads",
  },
} as const;
