import { apiEndpoints } from "./api/endpoints";
import { apiRequest } from "./api/request";

/**
 * Generic response item shape for every `/admin/masters/:type` entry,
 * mirroring `present()` in 1SqrPropertyBackend/src/services/master.service.ts.
 * Verified against real, live responses on 2026-09-17 for the "states",
 * "cities" and "areas" master types (see masterConfigs.ts for the per-type
 * mapping into MasterRecord). This same shape applies to every other
 * registered master type in 1SqrPropertyBackend/src/config/master.config.ts,
 * so this service is written generically and is intended to be reused for
 * later master-type batches (property types, amenities, banks, etc.), not
 * just state/city/area.
 */
export interface MasterApiItem {
  id: number;
  type: string;
  name: string;
  code: string;
  description: string | null;
  parentId: number | null;
  sortOrder: number;
  status: "active" | "inactive";
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface MasterMutationInput {
  name: string;
  /**
   * Required by `createMasterSchema`/`updateMasterSchema`
   * (1SqrPropertyBackend/src/validators/master.validator.ts) for every
   * master type, but only actually persisted for types with a `codeField`
   * (e.g. "states" -> its real `code` column, uppercased server-side). For
   * types without a `codeField`/`slugField` (city, area), the server ignores
   * this value entirely and instead de-duplicates on `name`
   * (`masterService.normalizeCode`/`assertUniqueCode`) — callers for those
   * types may pass any non-empty string (e.g. the name itself).
   */
  code: string;
  description?: string | null;
  parentId?: number | null;
  sortOrder?: number;
  status?: "active" | "inactive";
  metadata?: Record<string, unknown> | null;
}

interface MasterListEnvelope {
  items: MasterApiItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

/**
 * Thin wrapper over `/admin/masters/:type`, verified live against the
 * production backend (http://3.109.54.6/api/v1) on 2026-09-17 for
 * states/cities/areas: authenticated GET list, POST create, PATCH
 * .../status, and DELETE all confirmed working end-to-end (create -> read
 * back -> status toggle -> soft delete -> 404 on re-fetch), then cleaned up.
 *
 * IMPORTANT — `update()` (plain PATCH /:type/:id, no `/status` suffix) is
 * CONFIRMED BROKEN on the backend as of that same live test:
 *
 *   Request:  PATCH /admin/masters/states/5  { "name": "ZZTEST_STATE_EDITED" }
 *   Response: 500 { "success": false, "message": "Internal server error",
 *                    "errors": [{ "message": "Internal server error" }] }
 *
 * Root cause (read from source, not guessed): `updateMasterSchema` in
 * 1SqrPropertyBackend/src/validators/master.validator.ts is built as
 * `createMasterSchema.extend({ body: ... })`. `.extend()` only overrides the
 * `body` key of the schema — `params` is inherited unchanged from
 * `createMasterSchema`, which is `z.object({ type: masterType })` (no `id`
 * field), unlike the standalone, correctly-defined `masterIdParamSchema`
 * (`{ type, id }`) used by GET-by-id/DELETE, and `updateMasterStatusSchema`
 * (also standalone, also correctly includes `id`) used by the status route.
 * `validate()` (src/middlewares/validate.middleware.ts) does
 * `req.params = parsed.params ?? req.params` after `schema.parse(...)`, and
 * Zod's default "strip" behavior on `z.object.parse()` drops any input key
 * not declared in the schema — so the real `id` route param is silently
 * stripped from `req.params` before `masterController.update` runs.
 * `Number(req.params.id)` then evaluates to `NaN`, and
 * `masterRepository.findById(config, NaN)` throws inside Prisma, which the
 * global error handler surfaces as a generic 500. This affects every master
 * type's plain-update endpoint, not just states/cities/areas — it is a
 * backend defect, not an admin-side contract mismatch, and this codebase's
 * scope (propertyWebAdmin only) does not include fixing it. The fix would be
 * a one-line change on the backend (give `updateMasterSchema.params` the
 * same `{ type, id }` shape as `masterIdParamSchema`/`updateMasterStatusSchema`,
 * e.g. by extending `masterIdParamSchema` instead of `createMasterSchema`).
 *
 * This method is still implemented (rather than omitted) so the "Edit" flow
 * starts working the moment that backend fix lands, with zero admin-side
 * change required. Until then, calling it will surface a 500 to the user via
 * the existing global API-error toast (see apiClient.ts) — MasterManagementPage
 * still exposes the Edit action (per config field `type: undefined` for city
 * label handling is unaffected), but every save attempt will fail with that
 * error until the backend is fixed.
 */
export const masterCrudService = {
  async list(type: string): Promise<MasterApiItem[]> {
    const response = await apiRequest<MasterListEnvelope>({
      url: apiEndpoints.adminMasters.base(type),
      method: "GET",
      params: { limit: 100 },
    });
    return response.data.items;
  },

  async create(type: string, input: MasterMutationInput): Promise<MasterApiItem> {
    const response = await apiRequest<MasterApiItem>({
      url: apiEndpoints.adminMasters.base(type),
      method: "POST",
      data: input,
    });
    return response.data;
  },

  /** See the class-level doc comment above — confirmed broken server-side. */
  async update(type: string, id: string | number, input: Partial<MasterMutationInput>): Promise<MasterApiItem> {
    const response = await apiRequest<MasterApiItem>({
      url: apiEndpoints.adminMasters.byId(type, id),
      method: "PATCH",
      data: input,
    });
    return response.data;
  },

  async updateStatus(type: string, id: string | number, status: "active" | "inactive"): Promise<MasterApiItem> {
    const response = await apiRequest<MasterApiItem>({
      url: apiEndpoints.adminMasters.status(type, id),
      method: "PATCH",
      data: { status },
    });
    return response.data;
  },

  async remove(type: string, id: string | number): Promise<void> {
    await apiRequest<{ deleted: boolean }>({
      url: apiEndpoints.adminMasters.byId(type, id),
      method: "DELETE",
    });
  },
};
