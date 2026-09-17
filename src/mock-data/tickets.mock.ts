import type { TicketRecord } from "../types";

export const ticketsMock: TicketRecord[] = [
  { id: "tic_3001", user: "Ritu Shah", subject: "Property status not updating", category: "Property", priority: "High", status: "Open", assignedTo: "Neha Das", createdDate: "2026-06-07" },
  { id: "tic_3002", user: "Kabir Jain", subject: "Need invoice copy", category: "Billing", priority: "Medium", status: "In Progress", assignedTo: "Neha Das", createdDate: "2026-06-06" },
  { id: "tic_3003", user: "Sowmya Rao", subject: "Verification taking too long", category: "Verification", priority: "High", status: "Escalated", assignedTo: "Anjali Sethi", createdDate: "2026-06-05" },
  { id: "tic_3004", user: "Global Retail LLP", subject: "Refund request follow-up", category: "Finance", priority: "Low", status: "Closed", assignedTo: "Neha Das", createdDate: "2026-06-02" },
];
