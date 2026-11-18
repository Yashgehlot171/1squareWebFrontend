import { apiEndpoints } from "./api/endpoints";
import { apiRequest } from "./api/request";
import type { MasterListItem } from "./lead.service";

const ADMIN_DASHBOARD = "/admin/dashboard";

/**
 * Shapes below mirror `reportService.dashboard()` /
 * `reportRepository.dashboard()` / `reportRepository.recent()` in
 * 1SqrPropertyBackend/src/services/report.service.ts and
 * src/repositories/report.repository.ts, and the route wiring in
 * src/routes/report.routes.ts (`adminDashboardRouter`, mounted at
 * `/api/v1/admin/dashboard`, gated by DASHBOARD_VIEW — verified against
 * src/routes/index.ts's `apiRouter.use("/admin/dashboard", adminDashboardRouter)`).
 *
 * All BigInt id columns (Lead.id, Property.id, AuditLog.id, etc.) arrive as
 * strings — the backend's `sendSuccess()` runs every response through a
 * `JSON.stringify` replacer that stringifies BigInt values recursively
 * (src/utils/apiResponse.ts's `serializeData`), so this is safe to rely on
 * globally, not just for the specifically-`presentX()`-wrapped endpoints.
 */

export interface DashboardQueryParams {
  dateFrom?: string;
  dateTo?: string;
  cityId?: number;
  areaId?: number;
  status?: string;
  assignedUserId?: string;
  propertyTypeId?: number;
  brokerId?: string;
}

export interface DashboardAuditLogEntry {
  id: string;
  userId: string | null;
  entityName: string;
  entityId: string | null;
  action: string;
  ipAddress: string | null;
  createdAt: string;
}

// Raw Lead row (no `leadInclude`, just `{ include: { leadStatus: true } }`) —
// only the columns this dashboard's "Recent Leads" list actually renders are
// typed here, not the full Lead model.
export interface DashboardLeadSummary {
  id: string;
  leadNo: string;
  name: string;
  mobile: string;
  email: string | null;
  priority: string | null;
  createdAt: string;
  leadStatus: { id: number; name: string; slug: string } | null;
}

export interface DashboardPropertySummary {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

// Raw LeadFollowUp row, no include.
export interface DashboardFollowUpEntry {
  id: string;
  leadId: string;
  assignedToId: string | null;
  followUpAt: string;
  status: string;
  priority: string | null;
  nextAction: string | null;
  notes: string | null;
}

export interface DashboardSummary {
  customers: { total: number; active: number; blocked: number };
  brokers: { total: number; verified: number; pending: number };
  /** Keyed by Property.status enum value (e.g. "APPROVED", "SOLD"). */
  properties: Record<string, number>;
  /**
   * Keyed by the numeric `leadStatusId` AS A STRING (Object.fromEntries over
   * a Prisma groupBy — see reportService.dashboard()'s `leads` field), NOT
   * by status slug/name. Resolve display names via
   * `leadService.getLeadStatuses()` (GET /masters/lead-statuses), which this
   * page also calls, keyed by numeric master id.
   */
  leads: Record<string, number>;
  /** Keyed by ConstructionRequest.status enum value. */
  construction: Record<string, number>;
  /** Keyed by SupportTicket.status enum value. */
  supportTickets: Record<string, number>;
  /** Keyed by numeric `legalStatusId` as a string — see `leads` above for why. */
  legalRequests: Record<string, number>;
  /** Keyed by numeric `loanStatusId` as a string — see `leads` above for why. */
  loanRequests: Record<string, number>;
  materialSuppliers: number;
  serviceProviders: number;
  notifications: number;
  recentActivities: DashboardAuditLogEntry[];
  recentLeads: DashboardLeadSummary[];
  recentProperties: DashboardPropertySummary[];
  /** Properties with status PENDING_REVIEW or UNDER_REVIEW, newest first. */
  pendingApprovals: DashboardPropertySummary[];
  /** LeadFollowUps due today (00:00–23:59 server local time), earliest first. */
  todaysFollowUps: DashboardFollowUpEntry[];
}

/**
 * Chart "kind" values recognized by `reportRepository.chart()`. Anything
 * else (including typos) silently falls through to the same
 * `[{ label: "revenue", value: 0 }]` shape as "revenue" with no error — a
 * backend looseness worth knowing about, not something to route around
 * here.
 */
export const DASHBOARD_CHART_KINDS = ["property-chart", "lead-chart", "customer-growth", "construction", "support", "revenue"] as const;
export type DashboardChartKind = (typeof DASHBOARD_CHART_KINDS)[number];

export interface RevenueChartPoint {
  label: string;
  value: number;
}

export const dashboardService = {
  /** GET /api/v1/admin/dashboard (dashboardQuerySchema, DASHBOARD_VIEW). */
  async getSummary(params: DashboardQueryParams = {}) {
    return apiRequest<DashboardSummary>({
      url: ADMIN_DASHBOARD,
      method: "GET",
      params,
    });
  },

  /**
   * GET /api/v1/admin/dashboard/:kind (dashboardQuerySchema, DASHBOARD_VIEW).
   * Response shape depends on `kind`: "revenue" returns
   * `RevenueChartPoint[]`; every other kind returns raw Prisma `groupBy`
   * rows (`{ <groupField>: value, _count: { _all: number } }`), which
   * differ per kind (`status` for property-chart/construction/support,
   * `leadStatusId` for lead-chart, `selectedRole` for customer-growth) —
   * left as `unknown[]` here since callers know which kind they asked for
   * and can narrow accordingly, rather than this service guessing a single
   * shared shape.
   */
  async getChart(kind: DashboardChartKind, params: DashboardQueryParams = {}) {
    return apiRequest<RevenueChartPoint[] | Array<Record<string, unknown>>>({
      url: `${ADMIN_DASHBOARD}/${kind}`,
      method: "GET",
      params,
    });
  },

  /**
   * GET /api/v1/masters/:type (publicMasterRouter, optionalAuthenticate — no
   * permission gate), verified against master.config.ts's "legal-statuses"
   * (model: legalStatus) and "loan-statuses" (model: loanStatus) entries,
   * same family as "lead-statuses" (see lead.service.ts's
   * getLeadStatuses()). Used purely to translate the dashboard's
   * `legalRequests`/`loanRequests` numeric-id-keyed count maps into display
   * names — id -> name/code lookup, nothing else.
   */
  async getStatusMasters(type: "legal-statuses" | "loan-statuses") {
    return apiRequest<{ items: MasterListItem[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>({
      url: apiEndpoints.masters.byType(type),
      method: "GET",
      params: { limit: 100 },
    });
  },
};
