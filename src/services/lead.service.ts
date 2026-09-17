import { apiEndpoints } from "./api/endpoints";
import { apiRequest } from "./api/request";

const ADMIN_LEADS = apiEndpoints.adminLeads.base;

/**
 * Shapes below mirror `serialize()` in
 * 1SqrPropertyBackend/src/services/lead.service.ts and the admin route
 * responses in 1SqrPropertyBackend/src/controllers/lead.controller.ts,
 * verified directly against that source plus
 * 1SqrPropertyBackend/src/repositories/lead.repository.ts (`leadInclude`)
 * and prisma/schema.prisma.
 */

export interface LeadMasterRef {
  id: number;
  name: string;
  slug: string;
}

export interface LeadPersonSummary {
  id: string;
  fullName: string | null;
  mobile: string | null;
  email: string | null;
  selectedRole: string | null;
}

// Property.location includes full `city`/`area` relation rows (no `select`
// narrowing in leadInclude), but only id/name is modeled here — same
// judgment call as AdminPropertyMasterRef in property.service.ts.
export interface LeadPropertyRef {
  id: string;
  title: string;
  slug: string;
  ownerId: string | null;
  assignedAgentId: string | null;
  location: {
    cityId: number | null;
    areaId: number | null;
    city: { id: number; name: string } | null;
    area: { id: number; name: string } | null;
  } | null;
}

export interface LeadRemarkEntry {
  id: string;
  leadId: string;
  userId: string | null;
  remark: string;
  visibility: string;
  attachmentFileId: string | null;
  createdAt: string;
}

export interface LeadFollowUpEntry {
  id: string;
  leadId: string;
  assignedToId: string | null;
  followUpAt: string;
  status: string;
  priority: string | null;
  nextAction: string | null;
  reminderAt: string | null;
  notes: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Only present on the single-lead detail response (GET /:leadId) — the list
// response (GET /) uses the plain `leadInclude` which does not join
// assignments/activities/statusHistory. See leadRepository.findById vs
// leadRepository.list.
export interface LeadAssignmentEntry {
  id: string;
  leadId: string;
  assignedToId: string | null;
  assignedTeam: string | null;
  assignedById: string | null;
  status: string;
  remarks: string | null;
  assignedAt: string;
}

export interface LeadActivityEntry {
  id: string;
  leadId: string;
  userId: string | null;
  activityType: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface LeadStatusHistoryEntry {
  id: string;
  leadId: string;
  oldStatusId: number | null;
  newStatusId: number;
  changedById: string | null;
  remarks: string | null;
  createdAt: string;
  newStatus: LeadMasterRef;
}

export interface AdminLeadRecord {
  id: string;
  leadNo: string;
  status: LeadMasterRef | null;
  source: LeadMasterRef | null;
  customer: LeadPersonSummary | null;
  property: LeadPropertyRef | null;
  assignedTo: LeadPersonSummary | null;
  name: string;
  mobile: string;
  email: string | null;
  message: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  priority: string | null;
  nextAction: string | null;
  requirement: Record<string, unknown> | null;
  // Capped at the 10 most recent rows by `leadInclude` on both list and
  // detail responses — there is no "list all remarks/follow-ups" endpoint,
  // only POST/PATCH to add one. Older history is not retrievable through
  // this router.
  remarks: LeadRemarkEntry[];
  followUps: LeadFollowUpEntry[];
  assignments?: LeadAssignmentEntry[];
  // Capped at the 50 most recent rows here; GET /:leadId/activity below
  // returns the full, unbounded activity list separately.
  activities?: LeadActivityEntry[];
  statusHistory?: LeadStatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Fixed slug enum accepted by `PATCH /:leadId/status`, mirrored verbatim from
 * `leadStatusSlugSchema` in
 * 1SqrPropertyBackend/src/validators/lead.validator.ts. `Lead.leadStatusId`
 * is a foreign key into the `lead_statuses` master table (config-driven,
 * editable via /admin/masters/lead-statuses), but the status-CHANGE endpoint
 * only accepts one of these eight slugs regardless of what other rows exist
 * in that table — `leadService.changeStatus()` looks the slug up with
 * `leadRepository.findStatus(slug)` and 400s if it does not resolve. So this
 * enum, not the full master list, is the authoritative option set for the
 * status-change dropdown. Live master data is still used for display names
 * (see getLeadStatuses below) and for anything the table returns beyond this
 * fixed set.
 */
export const LEAD_STATUS_SLUGS = ["new", "contacted", "interested", "site-visit", "negotiation", "closed", "lost", "converted"] as const;
export type LeadStatusSlug = (typeof LEAD_STATUS_SLUGS)[number];

export const LEAD_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type LeadPriority = (typeof LEAD_PRIORITIES)[number];

export const LEAD_ASSIGNMENT_TEAMS = ["support", "sales", "broker", "construction", "legal", "finance"] as const;
export type LeadAssignmentTeam = (typeof LEAD_ASSIGNMENT_TEAMS)[number];

export interface AdminLeadListParams {
  search?: string;
  status?: string;
  assignedUserId?: string | number;
  propertyId?: string | number;
  cityId?: number;
  areaId?: number;
  priority?: LeadPriority;
  source?: string;
  customerId?: string | number;
  brokerId?: string | number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "priority";
  sortOrder?: "asc" | "desc";
}

export interface LeadAnalytics {
  leadCount: number;
  callCount: number;
  whatsAppCount: number;
  interestedCount: number;
  convertedCount: number;
  lostCount: number;
  averageResponseTimeMinutes: number;
}

interface AdminLeadListEnvelope {
  items: AdminLeadRecord[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  analytics: LeadAnalytics;
}

export interface AdminLeadListResult {
  items: AdminLeadRecord[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  analytics: LeadAnalytics;
}

export interface CreateLeadInput {
  propertyId?: string | number | null;
  customerId?: string | number | null;
  leadSource?: string;
  name: string;
  mobile: string;
  email?: string | null;
  message?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  priority?: LeadPriority;
  nextAction?: string | null;
  requirement?: Record<string, unknown>;
}

export interface UpdateLeadStatusInput {
  status: LeadStatusSlug;
  remark?: string;
  visitDate?: string;
}

export interface AssignLeadInput {
  assignedToId?: string | number | null;
  assignedTeam?: LeadAssignmentTeam;
  remarks?: string;
}

export interface AssignLeadResult {
  lead: AdminLeadRecord;
  assignment: LeadAssignmentEntry;
}

export interface AddLeadRemarkInput {
  remark: string;
  visibility?: "internal" | "public";
  attachmentFileId?: string | number | null;
}

export interface AddLeadFollowUpInput {
  followUpAt: string;
  reminderAt?: string | null;
  priority?: LeadPriority;
  nextAction: string;
  notes?: string | null;
  assignedToId?: string | number | null;
}

export interface MasterListItem {
  id: number;
  type: string;
  name: string;
  code: string;
  description: string | null;
  parentId: number | null;
  sortOrder: number;
  status: "active" | "inactive";
}

interface MasterListEnvelope {
  items: MasterListItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const leadService = {
  /**
   * GET /api/v1/admin/leads (leadListQuerySchema, LEAD_VIEW). Backend nests
   * pagination under `pagination`, matching the same non-`meta` envelope
   * inconsistency already flagged for properties in
   * docs/PROJECT_MASTER.md section 3.4 and property.service.ts. Also returns
   * an `analytics` block (lead/call/WhatsApp/interested/converted/lost
   * counts + average response time) computed over the same filtered `where`
   * — surfaced here for the dashboard summary tiles.
   */
  async getLeads(params: AdminLeadListParams = {}) {
    const response = await apiRequest<AdminLeadListEnvelope>({
      url: ADMIN_LEADS,
      method: "GET",
      params,
    });
    const result: AdminLeadListResult = {
      items: response.data.items,
      page: response.data.pagination.page,
      limit: response.data.pagination.limit,
      total: response.data.pagination.total,
      totalPages: response.data.pagination.totalPages,
      analytics: response.data.analytics,
    };
    return { ...response, data: result };
  },

  /**
   * GET /api/v1/admin/leads/:id (LEAD_VIEW). Richer than the list row — adds
   * `assignments`, `activities` (last 50) and `statusHistory` (with the
   * related `newStatus` record). List rows never carry these three fields,
   * so the details view always re-fetches by id rather than reusing a row
   * from the table (same pattern as property.service.ts's separate
   * status-history call).
   */
  async getLeadById(id: string) {
    return apiRequest<AdminLeadRecord>({
      url: `${ADMIN_LEADS}/${id}`,
      method: "GET",
    });
  },

  /** POST /api/v1/admin/leads (createLeadSchema, LEAD_CREATE). */
  async createLead(input: CreateLeadInput) {
    return apiRequest<AdminLeadRecord>({
      url: ADMIN_LEADS,
      method: "POST",
      data: input,
    });
  },

  /**
   * PATCH /api/v1/admin/leads/:id (updateLeadSchema — a partial of
   * createLeadSchema's body, LEAD_EDIT). At least one field is required by
   * the backend refine check.
   */
  async updateLead(id: string, input: Partial<CreateLeadInput>) {
    return apiRequest<AdminLeadRecord>({
      url: `${ADMIN_LEADS}/${id}`,
      method: "PATCH",
      data: input,
    });
  },

  /**
   * PATCH /api/v1/admin/leads/:id/status (updateLeadStatusSchema, LEAD_STATUS).
   * `remark` is required by the backend superRefine when status is
   * "closed" | "lost" | "converted"; `visitDate` is required when status is
   * "site-visit".
   */
  async updateStatus(id: string, input: UpdateLeadStatusInput) {
    return apiRequest<AdminLeadRecord>({
      url: `${ADMIN_LEADS}/${id}/status`,
      method: "PATCH",
      data: input,
    });
  },

  /**
   * PATCH /api/v1/admin/leads/:id/assign (leadAssignmentSchema, LEAD_ASSIGN).
   * Response is NOT a plain lead record — it is `{ lead, assignment }`,
   * where `assignment` is the raw created LeadAssignment row.
   */
  async assignLead(id: string, input: AssignLeadInput) {
    return apiRequest<AssignLeadResult>({
      url: `${ADMIN_LEADS}/${id}/assign`,
      method: "PATCH",
      data: input,
    });
  },

  /**
   * PATCH /api/v1/admin/leads/:id/reassign (leadAssignmentSchema,
   * LEAD_REASSIGN — a distinct permission from LEAD_ASSIGN). Same
   * `{ lead, assignment }` response shape as assign.
   */
  async reassignLead(id: string, input: AssignLeadInput) {
    return apiRequest<AssignLeadResult>({
      url: `${ADMIN_LEADS}/${id}/reassign`,
      method: "PATCH",
      data: input,
    });
  },

  /**
   * POST /api/v1/admin/leads/:id/remarks (leadRemarkSchema, LEAD_REMARK).
   * Returns the raw created LeadRemark row (not the full lead), same
   * pattern as propertyService.addRemark.
   */
  async addRemark(id: string, input: AddLeadRemarkInput) {
    return apiRequest<LeadRemarkEntry>({
      url: `${ADMIN_LEADS}/${id}/remarks`,
      method: "POST",
      data: input,
    });
  },

  /**
   * PATCH /api/v1/admin/leads/:id/follow-up (leadFollowupSchema, LEAD_EDIT
   * — there is no separate LEAD_FOLLOWUP permission on the backend). Despite
   * the PATCH verb this always creates a new LeadFollowUp row
   * (`leadRepository.createFollowUp`) and returns that raw row, not the
   * full lead.
   */
  async addFollowUp(id: string, input: AddLeadFollowUpInput) {
    return apiRequest<LeadFollowUpEntry>({
      url: `${ADMIN_LEADS}/${id}/follow-up`,
      method: "PATCH",
      data: input,
    });
  },

  /**
   * PATCH /api/v1/admin/leads/:id/convert (terminalLeadActionSchema,
   * LEAD_STATUS). `remark` is required (min length 1). Internally this is
   * `changeStatus(..., { status: "converted", remark })`, so it returns the
   * full serialized lead.
   */
  async convertLead(id: string, remark: string) {
    return apiRequest<AdminLeadRecord>({
      url: `${ADMIN_LEADS}/${id}/convert`,
      method: "PATCH",
      data: { remark },
    });
  },

  /**
   * PATCH /api/v1/admin/leads/:id/close (terminalLeadActionSchema).
   * IMPORTANT: gated by LEAD_CLOSE, not LEAD_STATUS — verified directly
   * against `adminLeadRouter.patch("/:leadId/close", authorizePermissions
   * ("LEAD_CLOSE"), ...)` in lead.routes.ts. `remark` is required.
   */
  async closeLead(id: string, remark: string) {
    return apiRequest<AdminLeadRecord>({
      url: `${ADMIN_LEADS}/${id}/close`,
      method: "PATCH",
      data: { remark },
    });
  },

  /**
   * GET /api/v1/admin/leads/:id/activity (LEAD_VIEW). Returns the FULL,
   * unbounded LeadActivity list (`leadRepository.listActivities`, no
   * `take`), unlike the `activities` field embedded in the detail response
   * above which is capped at the 50 most recent rows.
   */
  async getActivity(id: string) {
    return apiRequest<LeadActivityEntry[]>({
      url: `${ADMIN_LEADS}/${id}/activity`,
      method: "GET",
    });
  },

  /**
   * GET /api/v1/masters/lead-statuses (publicMasterRouter, optionalAuthenticate
   * — no permission gate). Verified against master.config.ts's "lead-statuses"
   * entry (model: leadStatus). Used for live display names/ordering of
   * statuses; the fixed LEAD_STATUS_SLUGS enum above is still what gates
   * which slug the status-change endpoint will accept.
   */
  async getLeadStatuses() {
    return apiRequest<MasterListEnvelope>({
      url: apiEndpoints.masters.byType("lead-statuses"),
      method: "GET",
      params: { limit: 100 },
    });
  },

  /**
   * GET /api/v1/masters/lead-sources (same router/config family as above,
   * model: leadSource). `leadSource` on create/update is a free string that
   * the backend auto-vivifies into a new LeadSource row if it doesn't
   * already exist (`leadService.ensureSource`), so this list is offered as
   * suggestions rather than a closed enum.
   */
  async getLeadSources() {
    return apiRequest<MasterListEnvelope>({
      url: apiEndpoints.masters.byType("lead-sources"),
      method: "GET",
      params: { limit: 100 },
    });
  },
};
