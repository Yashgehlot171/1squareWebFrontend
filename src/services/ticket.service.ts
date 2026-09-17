import { ticketsMock } from "../mock-data/tickets.mock";
import { buildResponse } from "./base";

export const ticketService = {
  async getTickets() {
    return buildResponse({ items: ticketsMock, total: ticketsMock.length }, "req_ticket_list");
  },

  async getTicketById(id: string) {
    return buildResponse(ticketsMock.find((ticket) => ticket.id === id) ?? null, "req_ticket_detail");
  },

  async assignTicket(id: string, assignedTo: string) {
    return buildResponse({ id, assignedTo }, "req_ticket_assign");
  },

  async updateStatus(id: string, status: string) {
    return buildResponse({ id, status }, "req_ticket_status");
  },

  async updateTicketRequest(id: string, payload: { status: string; remark: string }) {
    return buildResponse({ id, ...payload }, "req_ticket_request_update");
  },
};
