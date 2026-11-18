import { apiClient } from "./api/apiClient";
import { apiRequest } from "./api/request";

const ADMIN_REPORTS = "/admin/reports";

/**
 * Mirrors `reportService.report/export` and `reportRepository.report/
 * countReport` in 1SqrPropertyBackend/src/services/report.service.ts and
 * src/repositories/report.repository.ts, and the request schemas in
 * src/validators/report.validator.ts (`reportTypeSchema`,
 * `reportQuerySchema`, `exportQuerySchema`). Route wiring verified against
 * src/routes/report.routes.ts's `adminReportRouter`, mounted at
 * `/api/v1/admin/reports` (src/routes/index.ts), list gated by REPORT_VIEW,
 * export gated by REPORT_EXPORT.
 */

export const REPORT_TYPES = ["customers", "brokers", "properties", "leads", "construction", "support", "legal", "loan", "suppliers", "providers"] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export interface ReportQueryParams {
  dateFrom?: string;
  dateTo?: string;
  cityId?: number;
  areaId?: number;
  status?: string;
  assignedUserId?: string;
  propertyTypeId?: number;
  brokerId?: string;
  page?: number;
  limit?: number;
  sortOrder?: "asc" | "desc";
}

/**
 * The row shape genuinely differs per `type` — see
 * `reportRepository.report()`'s per-type `findMany` calls (e.g. "customers"
 * selects `{id, fullName, mobile, email, status, selectedRole, createdAt}`,
 * "leads" includes `{leadStatus, leadSource}` plus every Lead scalar column,
 * "properties" selects a different narrow set again). Modeling one union of
 * ten distinct shapes here would be more ceremony than value for a
 * dynamically-typed report viewer; callers key off `type` to know which
 * fields a row will actually have.
 */
export type ReportRow = Record<string, unknown>;

interface ReportListEnvelope {
  items: ReportRow[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export type ReportExportFormat = "csv" | "xlsx" | "pdf";

const EXPORT_CONTENT_TYPES: Record<ReportExportFormat, string> = {
  csv: "text/csv",
  xlsx: "application/vnd.ms-excel",
  pdf: "application/pdf",
};

export const reportService = {
  /** GET /api/v1/admin/reports/:type (reportQuerySchema, REPORT_VIEW). */
  async getReport(type: ReportType, params: ReportQueryParams = {}) {
    const response = await apiRequest<ReportListEnvelope>({
      url: `${ADMIN_REPORTS}/${type}`,
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

  /**
   * GET /api/v1/admin/reports/:type/export (exportQuerySchema,
   * REPORT_EXPORT). Deliberately bypasses `apiRequest`/`parseApiResponse`:
   * this endpoint does NOT return the standard `{success, message, data}`
   * envelope — the controller writes `Content-Type`/`Content-Disposition`
   * headers and sends the raw file body directly
   * (`reportService.export()` in
   * 1SqrPropertyBackend/src/services/report.service.ts calls `res.send(...)`,
   * never `sendSuccess()`). Calling this through the normal JSON-envelope
   * path would throw ("Request failed") since `payload.success` would be
   * undefined. Uses `apiClient` directly with `responseType: "blob"`
   * instead — the request/response interceptors (auth header, loading
   * state, 401 refresh) still run since this is the same Axios instance,
   * only the envelope-parsing wrapper is skipped.
   */
  async exportReport(type: ReportType, format: ReportExportFormat, params: Omit<ReportQueryParams, "page" | "limit" | "sortOrder"> = {}) {
    const response = await apiClient.get(`${ADMIN_REPORTS}/${type}/export`, {
      params: { ...params, format },
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: EXPORT_CONTENT_TYPES[format] });
    return { blob, filename: `${type}-report.${format}` };
  },
};

/** Triggers a browser save-as download for a Blob returned by exportReport(). */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
