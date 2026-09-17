import { dashboardsMock, reportsByRoleMock } from "../mock-data/reports.mock";
import type { RoleCode } from "../types";
import { buildResponse } from "./base";

export const reportService = {
  async getDashboard(role: RoleCode) {
    return buildResponse(dashboardsMock[role], "req_dashboard");
  },

  async getReports(role: RoleCode) {
    return buildResponse({ items: reportsByRoleMock[role], total: reportsByRoleMock[role].length }, "req_reports");
  },
};
