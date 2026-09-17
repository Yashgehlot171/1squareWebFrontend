import { financeDashboardMock, invoicesMock, refundsMock, revenueMock, transactionsMock } from "../mock-data/finance.mock";
import { buildResponse } from "./base";

export const financeService = {
  async getFinanceDashboard() {
    return buildResponse(financeDashboardMock, "req_finance_dashboard");
  },

  async getTransactions() {
    return buildResponse({ items: transactionsMock, total: transactionsMock.length }, "req_finance_txn");
  },

  async getTransactionById(id: string) {
    return buildResponse(transactionsMock.find((item) => item.id === id) ?? null, "req_finance_txn_detail");
  },

  async getInvoices() {
    return buildResponse({ items: invoicesMock, total: invoicesMock.length }, "req_finance_invoice");
  },

  async getInvoiceById(id: string) {
    return buildResponse(invoicesMock.find((item) => item.id === id) ?? null, "req_finance_invoice_detail");
  },

  async getRefunds() {
    return buildResponse({ items: refundsMock, total: refundsMock.length }, "req_finance_refund");
  },

  async getRefundById(id: string) {
    return buildResponse(refundsMock.find((item) => item.id === id) ?? null, "req_finance_refund_detail");
  },

  async getSubscriptionRevenue() {
    return buildResponse({ items: revenueMock, total: revenueMock.length }, "req_finance_revenue");
  },

  async updateFinanceRequest(
    type: "transaction" | "invoice" | "refund",
    id: string,
    payload: { status: string; remark: string },
  ) {
    return buildResponse({ type, id, ...payload }, "req_finance_request_update");
  },
};
