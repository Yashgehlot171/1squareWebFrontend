import { apiRequest } from "./api/request";

const ADMIN_NOTIFICATIONS = "/admin/notifications";

/**
 * Shapes below mirror the raw `Notification` Prisma row (no presenter —
 * `notificationService.list/get/createAdmin/updateAdmin` in
 * 1SqrPropertyBackend/src/services/notification.service.ts all return the
 * repository result directly), `notificationInclude` in
 * src/repositories/notification.repository.ts, and the request schemas in
 * src/validators/notification.validator.ts. Route wiring verified against
 * src/routes/notification.routes.ts's `adminNotificationRouter`, mounted at
 * `/api/v1/admin/notifications` (src/routes/index.ts:
 * `apiRouter.use("/admin/notifications", adminNotificationRouter)`).
 */

export type NotificationStatus = "PENDING" | "SENT" | "FAILED" | "READ";
export type NotificationTargetAudience = "All Users" | "Customers" | "Brokers" | "Selected Users";

export interface AdminNotificationRecord {
  id: string;
  userId: string | null;
  notificationTypeId: number;
  title: string;
  body: string;
  module: string | null;
  targetAudience: NotificationTargetAudience | null;
  imageFileId: string | null;
  data: Record<string, unknown> | null;
  status: NotificationStatus;
  scheduledAt: string | null;
  readAt: string | null;
  sentAt: string | null;
  createdAt: string;
  type: { id: number; name: string; slug: string; isActive: boolean };
  user: { id: string; fullName: string | null; mobile: string | null; email: string | null; selectedRole: string | null } | null;
}

export interface AdminNotificationListParams {
  isRead?: boolean;
  module?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

interface AdminNotificationListEnvelope {
  items: AdminNotificationRecord[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

/**
 * `status` deliberately excludes "sent" here even though the backend's
 * `notificationCreateSchema` technically allows it: setting status to
 * "sent" at CREATE time only flips the broadcast definition row's own
 * `status` column — it does NOT fan out individual Notification rows to the
 * target audience (that fan-out only happens in `notificationService.send()`,
 * a separate action below). Offering "Sent" as a create-time choice would
 * silently do nothing visible, so this type — and the create form built on
 * it — only offers "draft"/"scheduled", and delivery always goes through
 * `sendNotification()`.
 */
export interface CreateNotificationInput {
  title: string;
  message: string;
  targetAudience: NotificationTargetAudience;
  selectedUserIds?: number[];
  imageFileId?: number | null;
  module?: string | null;
  payload?: Record<string, unknown>;
  scheduledAt?: string | null;
  status?: "draft" | "scheduled";
}

export type UpdateNotificationInput = Partial<CreateNotificationInput>;

const normalizeList = (envelope: AdminNotificationListEnvelope) => ({
  items: envelope.items,
  page: envelope.pagination.page,
  limit: envelope.pagination.limit,
  total: envelope.pagination.total,
  totalPages: envelope.pagination.totalPages,
});

export const notificationService = {
  /** GET /api/v1/admin/notifications (notificationQuerySchema, NOTIFICATION_VIEW). */
  async getNotifications(params: AdminNotificationListParams = {}) {
    const response = await apiRequest<AdminNotificationListEnvelope>({
      url: ADMIN_NOTIFICATIONS,
      method: "GET",
      params,
    });
    return { ...response, data: normalizeList(response.data) };
  },

  /** GET /api/v1/admin/notifications/:notificationId (NOTIFICATION_VIEW). */
  async getNotificationById(id: string) {
    return apiRequest<AdminNotificationRecord>({
      url: `${ADMIN_NOTIFICATIONS}/${id}`,
      method: "GET",
    });
  },

  /**
   * POST /api/v1/admin/notifications (notificationCreateSchema,
   * NOTIFICATION_CREATE). `module` is looked up as a NotificationType slug
   * (lowercased) server-side; if it doesn't match any configured type it
   * silently falls back to the "system" type (`notificationService
   * .createAdmin`'s `notificationRepository.type(...) ?? ...type("system")`)
   * rather than erroring — there is no admin-facing list-notification-types
   * endpoint to validate against up front, so this is a free-text field.
   */
  async createNotification(input: CreateNotificationInput) {
    return apiRequest<AdminNotificationRecord>({
      url: ADMIN_NOTIFICATIONS,
      method: "POST",
      data: { ...input, message: input.message },
    });
  },

  /** PATCH /api/v1/admin/notifications/:notificationId (notificationUpdateSchema, NOTIFICATION_EDIT). */
  async updateNotification(id: string, input: UpdateNotificationInput) {
    return apiRequest<AdminNotificationRecord>({
      url: `${ADMIN_NOTIFICATIONS}/${id}`,
      method: "PATCH",
      data: input,
    });
  },

  /**
   * POST /api/v1/admin/notifications/:notificationId/send (NOTIFICATION_SEND).
   * Fans this broadcast definition out into one real Notification row per
   * matching user (see `targetWhere()` in
   * 1SqrPropertyBackend/src/services/notification.service.ts — "Customers"
   * means `selectedRole in [buyer, seller]`, "Brokers" means
   * `selectedRole = broker`, same definition already used in
   * user.service.ts/report.repository.ts elsewhere in this codebase), marks
   * the source row SENT, and returns the recipient count.
   */
  async sendNotification(id: string) {
    return apiRequest<{ sent: boolean; recipients: number }>({
      url: `${ADMIN_NOTIFICATIONS}/${id}/send`,
      method: "POST",
    });
  },

  /** DELETE /api/v1/admin/notifications/:notificationId (NOTIFICATION_DELETE). */
  async deleteNotification(id: string) {
    return apiRequest<{ deleted: boolean }>({
      url: `${ADMIN_NOTIFICATIONS}/${id}`,
      method: "DELETE",
    });
  },
};
