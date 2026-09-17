import { legalCasesMock, legalDashboardMock } from "../mock-data/legal.mock";
import { buildResponse } from "./base";

export const legalService = {
  async getLegalDashboard() {
    return buildResponse(legalDashboardMock, "req_legal_dashboard");
  },

  async getLegalQueue() {
    return buildResponse({ items: legalCasesMock, total: legalCasesMock.length }, "req_legal_queue");
  },

  async getLegalCaseById(id: string) {
    return buildResponse(legalCasesMock.find((item) => item.id === id) ?? null, "req_legal_case");
  },

  async updateLegalCase(id: string, action: string) {
    return buildResponse({ id, action }, "req_legal_action");
  },

  async updateLegalRequest(id: string, payload: { status: string; remark: string }) {
    return buildResponse({ id, ...payload }, "req_legal_request_update");
  },
};
