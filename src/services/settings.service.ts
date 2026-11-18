import { apiRequest } from "./api/request";

const ADMIN_SETTINGS = "/admin/settings";
const ADMIN_TEMPLATES = "/admin/templates";

/**
 * Shapes below mirror `systemService.settings/setting/upsertSetting/
 * templates/template/createTemplate/updateTemplate/deleteTemplate` in
 * 1SqrPropertyBackend/src/services/system.service.ts, the
 * ApplicationSetting/MessageTemplate Prisma models, and the request schemas
 * in src/validators/system.validator.ts. Route wiring verified against
 * src/routes/system.routes.ts's `adminSettingRouter` /
 * `adminTemplateRouter`, mounted at `/api/v1/admin/settings` and
 * `/api/v1/admin/templates` respectively (src/routes/index.ts), both gated
 * by SETTINGS_MANAGE.
 */

export type SettingValueType = "string" | "number" | "boolean" | "json" | "secret";

export interface AppSetting {
  id: number;
  category: string;
  key: string;
  /** Masked to the literal string "********" when `isSecret` is true and `includeSecrets` wasn't requested. */
  value: unknown;
  valueType: SettingValueType;
  isSecret: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertSettingInput {
  category: string;
  value?: unknown;
  valueType: SettingValueType;
  isSecret: boolean;
  description?: string | null;
}

export type TemplateChannel = "email" | "sms" | "push";

export interface MessageTemplate {
  id: string;
  channel: TemplateChannel;
  name: string;
  code: string;
  subject: string | null;
  body: string;
  variables: string[] | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateListParams {
  channel?: TemplateChannel;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateTemplateInput {
  channel: TemplateChannel;
  name: string;
  code: string;
  subject?: string | null;
  body: string;
  variables?: string[];
  isActive?: boolean;
}

export type UpdateTemplateInput = Partial<CreateTemplateInput>;

interface TemplateListEnvelope {
  items: MessageTemplate[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export const settingsService = {
  /**
   * GET /api/v1/admin/settings (settingsQuerySchema, SETTINGS_MANAGE).
   * NOTE: unlike every paginated list in this app, this one returns only
   * `{ items }` — no `pagination` block at all (`systemService.settings()`
   * returns `{ items: ... }` directly, and `listSettings()` has no
   * skip/take), because there is no page/limit query param on this
   * endpoint. `includeSecrets` defaults to false server-side.
   */
  async getSettings(params: { category?: string; includeSecrets?: boolean } = {}) {
    return apiRequest<{ items: AppSetting[] }>({
      url: ADMIN_SETTINGS,
      method: "GET",
      params,
    });
  },

  /** GET /api/v1/admin/settings/:key (SETTINGS_MANAGE). */
  async getSetting(key: string, includeSecrets = false) {
    return apiRequest<AppSetting>({
      url: `${ADMIN_SETTINGS}/${encodeURIComponent(key)}`,
      method: "GET",
      params: { includeSecrets },
    });
  },

  /**
   * PATCH /api/v1/admin/settings/:key (upsertSettingSchema,
   * SETTINGS_MANAGE). This is a genuine upsert — `systemRepository
   * .upsertSetting` creates the row if `key` doesn't exist yet, so the same
   * call handles both "add a new setting" and "edit an existing one" (there
   * is no separate POST /admin/settings route). The backend also exposes
   * PUT on the same path/handler; PATCH is used here since it's the verb
   * already established for partial-update endpoints elsewhere in this app.
   */
  async upsertSetting(key: string, input: UpsertSettingInput) {
    return apiRequest<AppSetting>({
      url: `${ADMIN_SETTINGS}/${encodeURIComponent(key)}`,
      method: "PATCH",
      data: input,
    });
  },

  /** GET /api/v1/admin/templates (templateQuerySchema, SETTINGS_MANAGE). */
  async getTemplates(params: TemplateListParams = {}) {
    const response = await apiRequest<TemplateListEnvelope>({
      url: ADMIN_TEMPLATES,
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

  /** GET /api/v1/admin/templates/:id (SETTINGS_MANAGE). */
  async getTemplateById(id: string) {
    return apiRequest<MessageTemplate>({
      url: `${ADMIN_TEMPLATES}/${id}`,
      method: "GET",
    });
  },

  /** POST /api/v1/admin/templates (createTemplateSchema, SETTINGS_MANAGE). */
  async createTemplate(input: CreateTemplateInput) {
    return apiRequest<MessageTemplate>({
      url: ADMIN_TEMPLATES,
      method: "POST",
      data: input,
    });
  },

  /** PATCH /api/v1/admin/templates/:id (updateTemplateSchema, SETTINGS_MANAGE). */
  async updateTemplate(id: string, input: UpdateTemplateInput) {
    return apiRequest<MessageTemplate>({
      url: `${ADMIN_TEMPLATES}/${id}`,
      method: "PATCH",
      data: input,
    });
  },

  /**
   * DELETE /api/v1/admin/templates/:id (SETTINGS_MANAGE). Soft-delete
   * server-side (`deletedAt` set, `isActive` forced false —
   * `systemRepository.deleteTemplate`), returns `{ deleted: true }`.
   */
  async deleteTemplate(id: string) {
    return apiRequest<{ deleted: boolean }>({
      url: `${ADMIN_TEMPLATES}/${id}`,
      method: "DELETE",
    });
  },
};
