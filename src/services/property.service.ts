import { apiEndpoints } from "./api/endpoints";
import { apiRequest } from "./api/request";

const ADMIN_PROPERTIES = apiEndpoints.adminProperties.base;

/**
 * Generic master-data lookup item, mirroring `present()` in
 * 1SqrPropertyBackend/src/services/master.service.ts. Duplicated locally
 * rather than imported from lead.service.ts's identical `MasterListItem` to
 * keep service modules independent (same judgment call already made there).
 */
export interface PropertyMasterOption {
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
  items: PropertyMasterOption[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

/**
 * Fixed 11-state vocabulary accepted by `propertyStatusSchema`
 * (1SqrPropertyBackend/src/validators/property.validator.ts), reused verbatim
 * by adminCreatePropertySchema/adminUpdatePropertySchema. Verified directly
 * against that source rather than the 5-value PropertyRecord["status"] this
 * module used to import.
 */
export const PROPERTY_STATUSES = [
  "draft",
  "pending",
  "active",
  "under_review",
  "approved",
  "rejected",
  "blocked",
  "sold",
  "rented",
  "inactive",
  "archived",
] as const;
export type PropertyStatusValue = (typeof PROPERTY_STATUSES)[number];

export interface PropertyLocationInput {
  stateId: number;
  cityId: number;
  areaId?: number | null;
  address: string;
  addressLine2?: string | null;
  landmark?: string | null;
  pincode?: string | null;
}

/**
 * Partially mirrors `propertyBodySchema` (1SqrPropertyBackend/src/validators/property.validator.ts),
 * extended with the two admin-only fields from `adminOwnershipFields`
 * (adminProperty.validator.ts). `ownerId`/`assignedAgentId` are typed here for
 * completeness but deliberately never populated by PropertyFormPage — see the
 * form for why (no user/broker picker exists anywhere in this admin app yet).
 * `media` is omitted here too: it defaults to `{ images: [], videos: [],
 * documents: [] }` server-side when absent, and this pass does not add an
 * image/document upload UI to the property form.
 *
 * Disclosed scope cut: `propertyBodySchema` also accepts 7 further optional
 * fields — `roadWidth`, `availabilityDate`, `expectedPossession`,
 * `surveyNumber`, `waterSource`, `landType`, `commercialType` — all stored
 * alongside `constructionYear`/`readyState`/`furnishing`/`ownership` in the
 * same backend `details` JSON column (see `PropertyService.details()`,
 * property.service.ts:359-373). None of them are modeled here or exposed in
 * PropertyFormPage yet; since they are simply never sent (never force-nulled),
 * omitting them does not corrupt existing data, only leaves those 7 fields
 * un-editable from this admin form for now. Add them as a follow-up pass if
 * the business wants them surfaced.
 */
export interface AdminPropertyInput {
  title: string;
  description?: string | null;
  propertyTypeId: number;
  propertyCategoryId: number;
  listingTypeId: number;
  price: number;
  carpetAreaSqft?: number | null;
  builtUpAreaSqft?: number | null;
  plotAreaSqft?: number | null;
  bhkTypeId?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  balconies?: number | null;
  parkingCount?: number | null;
  facingId?: number | null;
  constructionQualityId?: number | null;
  floorNumber?: number | null;
  totalFloors?: number | null;
  constructionYear?: number | null;
  propertyAge?: number | null;
  readyState?: string | null;
  furnishing?: string | null;
  ownership?: string | null;
  isPriceNegotiable?: boolean;
  amenityIds?: number[];
  location: PropertyLocationInput;
  status?: PropertyStatusValue;
  ownerId?: number;
  assignedAgentId?: number | null;
}

/**
 * Shapes below mirror `presentProperty` in
 * 1SqrPropertyBackend/src/services/property.service.ts and the admin route
 * responses in 1SqrPropertyBackend/src/controllers/adminProperty.controller.ts,
 * verified directly against that source. Master-data relations (propertyType,
 * category, listingType, bhk, facing, constructionQuality, amenities) come back
 * as full records; only `id`/`name` are modeled here since that is all the
 * current UI needs.
 */
export interface AdminPropertyMasterRef {
  id: number;
  name: string;
}

export interface AdminPropertyPersonSummary {
  id: string;
  fullName: string;
  email: string | null;
  mobile: string | null;
  selectedRole: string | null;
}

export interface AdminPropertyLocation {
  addressLine1: string;
  addressLine2: string | null;
  landmark: string | null;
  pincode: string | null;
  latitude: string | number | null;
  longitude: string | number | null;
  state: AdminPropertyMasterRef | null;
  city: AdminPropertyMasterRef | null;
  area: AdminPropertyMasterRef | null;
}

export interface AdminPropertyFile {
  id: string;
  originalName: string;
  url: string;
  mimeType: string;
  fileType: string;
}

export interface AdminPropertyRecord {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  price: number;
  area: {
    carpetAreaSqft: number | null;
    builtUpAreaSqft: number | null;
    plotAreaSqft: number | null;
  };
  basic: {
    propertyType: AdminPropertyMasterRef | null;
    category: AdminPropertyMasterRef | null;
    listingType: AdminPropertyMasterRef | null;
    bhk: AdminPropertyMasterRef | null;
    bedrooms: number | null;
    bathrooms: number | null;
    balconies: number | null;
    parking: number | null;
    facing: AdminPropertyMasterRef | null;
    floorNumber: number | null;
    totalFloors: number | null;
    propertyAge: number | null;
    constructionQuality: AdminPropertyMasterRef | null;
    // Dynamic, property-type-specific fields. Backend stores this as a raw
    // Prisma Json column with no fixed schema seen in the validators, so it
    // is intentionally left untyped and should be rendered generically.
    details: Record<string, unknown>;
  };
  location: AdminPropertyLocation | null;
  amenities: AdminPropertyMasterRef[];
  media: {
    images: Array<{ id: string; title: string | null; mediaType: string; sortOrder: number; isPrimary: boolean; file: AdminPropertyFile | null }>;
    videos: Array<{ id: string; title: string | null; mediaType: string; sortOrder: number; file: AdminPropertyFile | null; thumbnail: AdminPropertyFile | null }>;
    documents: Array<{ id: string; title: string | null; documentType: string; isVerified: boolean; file: AdminPropertyFile | null }>;
  };
  ownerSummary: AdminPropertyPersonSummary | null;
  brokerSummary: AdminPropertyPersonSummary | null;
  verificationStatus: string;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  statistics?: Record<string, unknown>;
}

export interface AdminPropertyListParams {
  page?: number;
  limit?: number;
  status?: "draft" | "pending" | "active" | "under_review" | "approved" | "rejected" | "blocked" | "sold" | "rented" | "inactive" | "archived";
  search?: string;
  stateId?: number;
  cityId?: number;
  areaId?: number;
  propertyTypeId?: number;
  listingTypeId?: number;
  propertyCategoryId?: number;
  featured?: boolean;
  // NOTE: verified as `false` cannot be relied on today — see getVerificationQueue
  // below for why. `verified: true` is safe to send.
  verified?: boolean;
  sort?: "newest" | "price_low_to_high" | "price_high_to_low";
}

interface AdminPropertyListEnvelope {
  items: AdminPropertyRecord[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  nextCursor: string | null;
}

export interface AdminPropertyListResult {
  items: AdminPropertyRecord[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  nextCursor: string | null;
}

export interface PropertyStatusHistoryEntry {
  id: string;
  propertyId: string;
  oldStatus: string | null;
  newStatus: string;
  remarks: string | null;
  changedById: string | null;
  createdAt: string;
}

export interface PropertyRemarkActivity {
  id: string;
  propertyId: string;
  userId: string | null;
  activityType: string;
  description: string | null;
  createdAt: string;
}

export const propertyService = {
  /**
   * GET /api/v1/admin/properties (adminPropertyListSchema, PROPERTY_VIEW).
   * Backend nests pagination under `pagination` (page/limit/total/totalPages),
   * not under the common `meta` envelope used elsewhere in this app — flagged
   * in the review summary as the same meta/schema inconsistency already noted
   * in docs/PROJECT_MASTER.md section 3.4. Normalized here into a flat shape
   * the admin pages consume.
   */
  async getProperties(params: AdminPropertyListParams = {}) {
    const response = await apiRequest<AdminPropertyListEnvelope>({
      url: ADMIN_PROPERTIES,
      method: "GET",
      params,
    });
    const result: AdminPropertyListResult = {
      items: response.data.items,
      page: response.data.pagination.page,
      limit: response.data.pagination.limit,
      total: response.data.pagination.total,
      totalPages: response.data.pagination.totalPages,
      nextCursor: response.data.nextCursor,
    };
    return { ...response, data: result };
  },

  /** GET /api/v1/admin/properties/:id (PROPERTY_VIEW). */
  async getPropertyById(id: string) {
    return apiRequest<AdminPropertyRecord>({
      url: `${ADMIN_PROPERTIES}/${id}`,
      method: "GET",
    });
  },

  /**
   * POST /api/v1/admin/properties (adminCreatePropertySchema, PROPERTY_CREATE).
   * Confirmed live in backend Module 3a (2026-09-04) — previously correctly
   * left unwired for lack of an endpoint, now wired for real. Delegates
   * server-side into the same propertyService.create() the public
   * POST /properties route uses, so the response is the full
   * `presentProperty()` shape (AdminPropertyRecord).
   */
  async createProperty(input: AdminPropertyInput) {
    return apiRequest<AdminPropertyRecord>({
      url: ADMIN_PROPERTIES,
      method: "POST",
      data: input,
    });
  },

  /**
   * PATCH /api/v1/admin/properties/:id (adminUpdatePropertySchema, PROPERTY_EDIT).
   * Body is a partial of AdminPropertyInput; backend requires at least one
   * field. Omitting `location` on update leaves the existing location
   * untouched (propertyService.update only calls upsertLocation when
   * `input.location` is present); omitting `ownerId`/`assignedAgentId`
   * likewise leaves current ownership/assignment untouched.
   */
  async updateProperty(id: string, input: Partial<AdminPropertyInput>) {
    return apiRequest<AdminPropertyRecord>({
      url: `${ADMIN_PROPERTIES}/${id}`,
      method: "PATCH",
      data: input,
    });
  },

  /** PATCH /api/v1/admin/properties/:id/approve (PROPERTY_APPROVE), body: { remark? }. */
  async approveProperty(id: string, remark?: string) {
    return apiRequest<AdminPropertyRecord>({
      url: `${ADMIN_PROPERTIES}/${id}/approve`,
      method: "PATCH",
      data: { remark },
    });
  },

  /**
   * PATCH /api/v1/admin/properties/:id/reject (PROPERTY_APPROVE — the reject
   * route is gated by the same permission as approve, there is no separate
   * backend PROPERTY_REJECT permission even though the admin `Permission`
   * type still has a `PROPERTY_REJECT` literal; flagged in summary).
   * body: { remark }. The Zod schema marks `remark` optional, but
   * propertyStatusService.change() throws "Remark is required for rejection"
   * when status is "rejected" and no remark is supplied, so remark is
   * effectively required here and is typed as required.
   */
  async rejectProperty(id: string, remark: string) {
    return apiRequest<AdminPropertyRecord>({
      url: `${ADMIN_PROPERTIES}/${id}/reject`,
      method: "PATCH",
      data: { remark },
    });
  },

  /** PATCH /api/v1/admin/properties/:id/block (PROPERTY_BLOCK), body: { remark? }. */
  async blockProperty(id: string, remark?: string) {
    return apiRequest<AdminPropertyRecord>({
      url: `${ADMIN_PROPERTIES}/${id}/block`,
      method: "PATCH",
      data: { remark },
    });
  },

  /** PATCH /api/v1/admin/properties/:id/unblock (PROPERTY_BLOCK), body: { remark? }. */
  async unblockProperty(id: string, remark?: string) {
    return apiRequest<AdminPropertyRecord>({
      url: `${ADMIN_PROPERTIES}/${id}/unblock`,
      method: "PATCH",
      data: { remark },
    });
  },

  /** PATCH /api/v1/admin/properties/:id/feature (PROPERTY_FEATURE). */
  async featureProperty(id: string) {
    return apiRequest<AdminPropertyRecord>({
      url: `${ADMIN_PROPERTIES}/${id}/feature`,
      method: "PATCH",
      data: {},
    });
  },

  /** PATCH /api/v1/admin/properties/:id/unfeature (PROPERTY_FEATURE). */
  async unfeatureProperty(id: string) {
    return apiRequest<AdminPropertyRecord>({
      url: `${ADMIN_PROPERTIES}/${id}/unfeature`,
      method: "PATCH",
      data: {},
    });
  },

  /**
   * POST /api/v1/admin/properties/:id/remarks (PROPERTY_EDIT), body: { remark }
   * (adminPropertyRemarkSchema requires a non-empty remark, max 1000 chars).
   * Returns the raw created PropertyActivity row (not run through
   * presentProperty), so the response shape intentionally differs from
   * AdminPropertyRecord.
   */
  async addRemark(id: string, remark: string) {
    return apiRequest<PropertyRemarkActivity>({
      url: `${ADMIN_PROPERTIES}/${id}/remarks`,
      method: "POST",
      data: { remark },
    });
  },

  /**
   * GET /api/v1/admin/properties/:id/status-history (PROPERTY_VIEW). Returns
   * the raw PropertyStatusHistory rows (newest first); not part of the
   * GET /:id response, so it is fetched separately by the details page.
   */
  async getStatusHistory(id: string) {
    return apiRequest<PropertyStatusHistoryEntry[]>({
      url: `${ADMIN_PROPERTIES}/${id}/status-history`,
      method: "GET",
    });
  },

  /**
   * There is no dedicated "verification queue" endpoint on the backend.
   * adminPropertyListSchema does support a `verified` boolean filter
   * (`where.verification.status`), which looked like the natural fit, but it
   * cannot be used for the "not yet verified" case needed here: the schema
   * declares `verified: z.coerce.boolean().optional()`, and Zod's
   * `coerce.boolean()` is just `Boolean(value)` — since query values arrive
   * as strings, `?verified=false` coerces to `Boolean("false")`, which is
   * `true`, not `false`. So only `verified=true` behaves as expected; a
   * reliable "unverified" filter is not currently reachable through this
   * query param. This is flagged back to backend-senior-developer.
   *
   * As a working substitute, the queue is implemented against the real
   * `status` enum filter using `under_review` — the status admins are
   * expected to be actively deciding approve/reject/block on. This is a
   * judgment call, not a confirmed contract term ("queue" is a UI concept),
   * so it is called out for BA/backend confirmation in the review summary.
   *
   * Separately: propertyStatusService's workflow map only allows `approved`
   * to be reached FROM `under_review` (or `blocked`), never directly from
   * `pending`/`PENDING_REVIEW`. The dedicated admin properties router does
   * not expose an action that moves a property from pending into
   * under_review, but that transition is already reachable today via the
   * generic `PATCH /api/v1/properties/:propertyId/status` route (gated by
   * `PROPERTY_EDIT`, calling the same `propertyStatusService.change()`), so
   * this is not a backend workflow gap — it is just not wired into the
   * admin properties module/UI yet. Flagged back, not fixed here.
   */
  async getVerificationQueue(params: Omit<AdminPropertyListParams, "status"> = {}) {
    return propertyService.getProperties({ ...params, status: "under_review" });
  },

  /**
   * GET /api/v1/masters/:type (publicMasterRouter, optionalAuthenticate — no
   * permission gate), verified against 1SqrPropertyBackend/src/config/master.config.ts.
   * Same pattern as leadService.getLeadStatuses/getLeadSources. Used to
   * populate the property form's FK dropdowns with live master data instead
   * of a hardcoded list.
   *
   * Type slugs are the exact registered keys in master.config.ts — note
   * "bhk-options" (not "bhk-types") and "facing-directions" (not "facings").
   */
  async getPropertyTypes() {
    return apiRequest<MasterListEnvelope>({ url: apiEndpoints.masters.byType("property-types"), method: "GET", params: { limit: 100 } });
  },
  async getPropertyCategories() {
    return apiRequest<MasterListEnvelope>({ url: apiEndpoints.masters.byType("property-categories"), method: "GET", params: { limit: 100 } });
  },
  async getListingTypes() {
    return apiRequest<MasterListEnvelope>({ url: apiEndpoints.masters.byType("listing-types"), method: "GET", params: { limit: 100 } });
  },
  async getBhkOptions() {
    return apiRequest<MasterListEnvelope>({ url: apiEndpoints.masters.byType("bhk-options"), method: "GET", params: { limit: 100 } });
  },
  async getFacingDirections() {
    return apiRequest<MasterListEnvelope>({ url: apiEndpoints.masters.byType("facing-directions"), method: "GET", params: { limit: 100 } });
  },
  async getConstructionQualities() {
    return apiRequest<MasterListEnvelope>({ url: apiEndpoints.masters.byType("construction-qualities"), method: "GET", params: { limit: 100 } });
  },
  async getAmenityOptions() {
    return apiRequest<MasterListEnvelope>({ url: apiEndpoints.masters.byType("amenities"), method: "GET", params: { limit: 200 } });
  },

  /**
   * Location masters, verified against masterService.list()'s `parentId`
   * handling (1SqrPropertyBackend/src/services/master.service.ts): `cities`
   * is filtered by `parentId` = stateId (config.parentKey "stateId"), `areas`
   * by `parentId` = cityId (config.parentKey "cityId"). Same cascading
   * state -> city -> area pattern the location-scoped masters already use
   * elsewhere in the backend (masterService.cities/areas helpers).
   */
  async getStates() {
    return apiRequest<MasterListEnvelope>({ url: apiEndpoints.masters.byType("states"), method: "GET", params: { limit: 100 } });
  },
  async getCities(stateId: number) {
    return apiRequest<MasterListEnvelope>({ url: apiEndpoints.masters.byType("cities"), method: "GET", params: { parentId: stateId, limit: 100 } });
  },
  async getAreas(cityId: number) {
    return apiRequest<MasterListEnvelope>({ url: apiEndpoints.masters.byType("areas"), method: "GET", params: { parentId: cityId, limit: 200 } });
  },
};

