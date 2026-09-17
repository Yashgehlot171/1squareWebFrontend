import { auditLogsMock, settingsMock } from "../mock-data/audit.mock";
import { buildResponse } from "./base";

export const auditService = {
  async getAuditLogs() {
    return buildResponse({ items: auditLogsMock, total: auditLogsMock.length }, "req_audit_logs");
  },

  async getSettings() {
    return buildResponse(settingsMock, "req_settings");
  },
};
