import { apiRequest } from "./api/request";

const ADMIN_SUPPORT_TICKETS = "/admin/support-tickets";

/**
 * Shapes below mirror `supportTicketInclude` in
 * 1SqrPropertyBackend/src/repositories/supportTicket.repository.ts, the raw
 * `SupportTicket` Prisma row (no presenter —
 * `supportTicketService.list/get/assign/status/remark` all return
 * repository results directly), and the request schemas in
 * src/validators/supportTicket.validator.ts +
 * src/validators/assignment.validator.ts + src/validators/remark.validator.ts.
 * Route wiring verified against src/routes/supportTicket.routes.ts's
 * `adminSupportTicketRouter`, mounted at `/api/v1/admin/support-tickets`
 * (src/routes/index.ts).
 */

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REOPENED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

/**
 * `supportTicketStatusSchema` in src/validators/supportTicket.validator.ts
 * accepts `["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REOPENED"]`,
 * matching the Prisma `TicketStatus` enum exactly (fixed in backend commit
 * b2e12c0). All five values are valid for the status-change action.
 */
export const TICKET_STATUS_CHANGE_VALUES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REOPENED"] as const;
export type TicketStatusChangeValue = (typeof TICKET_STATUS_CHANGE_VALUES)[number];

export interface TicketPersonSummary {
  id: string;
  fullName: string | null;
  mobile: string | null;
  email: string | null;
}

export interface TicketCategory {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface TicketRemarkEntry {
  id: string;
  ticketId: string;
  userId: string | null;
  remark: string;
  isAdminReply: boolean;
  visibility: "internal" | "public";
  createdAt: string;
}

export interface TicketStatusHistoryEntry {
  id: string;
  ticketId: string;
  oldStatus: string | null;
  newStatus: string;
  changedById: string | null;
  remarks: string | null;
  createdAt: string;
}

export interface TicketFileEntry {
  id: string;
  ticketId: string;
  fileId: string;
  file: { id: string; url?: string } | null;
}

export interface AdminSupportTicketRecord {
  id: string;
  ticketNo: string;
  requesterId: string | null;
  assignedToId: string | null;
  supportCategoryId: number;
  relatedPropertyId: string | null;
  subject: string;
  description: string | null;
  priority: TicketPriority;
  status: TicketStatus;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  requester: TicketPersonSummary | null;
  assignedTo: TicketPersonSummary | null;
  category: TicketCategory;
  files: TicketFileEntry[];
  remarks: TicketRemarkEntry[];
  statusHistory: TicketStatusHistoryEntry[];
}

export interface AdminTicketListParams {
  status?: TicketStatus;
  page?: number;
  limit?: number;
}

interface AdminTicketListEnvelope {
  items: AdminSupportTicketRecord[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface AssignTicketInput {
  assignedToUserId: number;
  remark?: string;
}

export interface ReplyOrRemarkInput {
  remark: string;
  visibility?: "internal" | "public";
}

export interface UpdateTicketStatusInput {
  status: TicketStatusChangeValue;
  remark?: string;
}

export const ticketService = {
  /** GET /api/v1/admin/support-tickets (supportTicketQuerySchema, SUPPORT_TICKET_VIEW). */
  async getTickets(params: AdminTicketListParams = {}) {
    const response = await apiRequest<AdminTicketListEnvelope>({
      url: ADMIN_SUPPORT_TICKETS,
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

  /** GET /api/v1/admin/support-tickets/:ticketId (SUPPORT_TICKET_VIEW). */
  async getTicketById(id: string) {
    return apiRequest<AdminSupportTicketRecord>({
      url: `${ADMIN_SUPPORT_TICKETS}/${id}`,
      method: "GET",
    });
  },

  /** PATCH /api/v1/admin/support-tickets/:ticketId/assign (assignmentSchema, SUPPORT_TICKET_ASSIGN). Also flips status to IN_PROGRESS server-side. */
  async assignTicket(id: string, input: AssignTicketInput) {
    return apiRequest<AdminSupportTicketRecord>({
      url: `${ADMIN_SUPPORT_TICKETS}/${id}/assign`,
      method: "PATCH",
      data: input,
    });
  },

  /**
   * POST /api/v1/admin/support-tickets/:ticketId/reply (remarkSchema,
   * SUPPORT_TICKET_REPLY). Distinct from `addRemark` below only in that it
   * notifies the requester and is audited as "replied" rather than "remark
   * added" server-side (`supportTicketService.remark(..., adminReply=true)`)
   * — same request/response shape either way (returns the raw created
   * SupportTicketRemark row, not the full ticket).
   */
  async replyToTicket(id: string, input: ReplyOrRemarkInput) {
    return apiRequest<TicketRemarkEntry>({
      url: `${ADMIN_SUPPORT_TICKETS}/${id}/reply`,
      method: "POST",
      data: input,
    });
  },

  /** POST /api/v1/admin/support-tickets/:ticketId/remarks (remarkSchema, SUPPORT_TICKET_REPLY) — internal-only note, no requester notification. */
  async addRemark(id: string, input: ReplyOrRemarkInput) {
    return apiRequest<TicketRemarkEntry>({
      url: `${ADMIN_SUPPORT_TICKETS}/${id}/remarks`,
      method: "POST",
      data: input,
    });
  },

  /** PATCH /api/v1/admin/support-tickets/:ticketId/status (supportTicketStatusSchema, SUPPORT_TICKET_EDIT). `remark` is required when status is "CLOSED". */
  async updateStatus(id: string, input: UpdateTicketStatusInput) {
    return apiRequest<AdminSupportTicketRecord>({
      url: `${ADMIN_SUPPORT_TICKETS}/${id}/status`,
      method: "PATCH",
      data: input,
    });
  },

  /** PATCH /api/v1/admin/support-tickets/:ticketId/close (remarkSchema — `visibility` defaults and is ignored by the handler, which only reads `remark`; SUPPORT_TICKET_CLOSE). Internally `status(..., {status:"CLOSED", remark}, true)`. */
  async closeTicket(id: string, remark: string) {
    return apiRequest<AdminSupportTicketRecord>({
      url: `${ADMIN_SUPPORT_TICKETS}/${id}/close`,
      method: "PATCH",
      data: { remark },
    });
  },
};
