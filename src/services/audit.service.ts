import { apiRequest } from "./api/request";

const ADMIN_AUDIT_LOGS = "/admin/audit-logs";

/**
 * Shapes below mirror the raw `AuditLog` Prisma row (no presenter —
 * `systemService.auditLogs/auditLog` in
 * 1SqrPropertyBackend/src/services/system.service.ts return repository
 * results directly) plus its `user` include, and the request schema in
 * src/validators/system.validator.ts (`auditLogQuerySchema`). Route wiring
 * verified against src/routes/system.routes.ts's `adminAuditLogRouter`,
 * mounted at `/api/v1/admin/audit-logs` (src/routes/index.ts), gated by
 * AUDIT_LOG_VIEW (the only real permission for this domain — confirmed
 * against prisma/seed.ts).
 */

export interface AuditLogUserSummary {
  id: string;
  fullName: string | null;
  email: string | null;
  mobile: string | null;
}

export interface AuditLogRecord {
  id: string;
  userId: string | null;
  entityName: string;
  entityId: string | null;
  action: string;
  oldValues: unknown;
  newValues: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  requestId: string | null;
  createdAt: string;
  user: AuditLogUserSummary | null;
}

export interface AuditLogListParams {
  action?: string;
  entityName?: string;
  userId?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

interface AuditLogListEnvelope {
  items: AuditLogRecord[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export const auditService = {
  /**
   * GET /api/v1/admin/audit-logs (auditLogQuerySchema, AUDIT_LOG_VIEW).
   * `action` is matched loosely server-side against a fixed set of
   * synonym groups (login/logout/create/update/delete/approve/reject/
   * block/assign/upload/download/export — see `auditActionFilter()` in
   * system.repository.ts), not an exact enum; anything outside that set
   * falls back to a literal substring match on the raw `action` string.
   */
  async getAuditLogs(params: AuditLogListParams = {}) {
    const response = await apiRequest<AuditLogListEnvelope>({
      url: ADMIN_AUDIT_LOGS,
      method: "GET",
      params,
    });
    return {
      ...response,
      data: {
        items: response.data.items,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
      },
    };
  },

  /** GET /api/v1/admin/audit-logs/:id (AUDIT_LOG_VIEW). */
  async getAuditLogById(id: string) {
    return apiRequest<AuditLogRecord>({
      url: `${ADMIN_AUDIT_LOGS}/${id}`,
      method: "GET",
    });
  },
};
