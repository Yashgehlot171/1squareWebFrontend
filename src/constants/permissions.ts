import type { Permission } from "../types";

export const permissionGroups: Record<string, Permission[]> = {
  users: ["users.view", "users.create", "users.edit", "users.delete", "users.suspend", "users.activate", "users.assign_role"],
  roles: ["roles.view", "roles.create", "roles.edit", "roles.export"],
  properties: ["properties.view", "properties.create", "properties.edit", "properties.approve", "properties.reject", "properties.mark_sold"],
  verification: ["verification.view", "verification.approve", "verification.reject", "verification.request_documents"],
  tickets: ["tickets.view", "tickets.assign", "tickets.note", "tickets.status", "tickets.close"],
  finance: ["finance.view", "finance.refund", "finance.invoice"],
  legal: ["legal.view", "legal.approve", "legal.reject", "legal.request_documents", "legal.note"],
  reports: ["reports.view", "reports.export"],
};

export const permissionMatrixColumns = ["View", "Create", "Edit", "Delete", "Approve", "Reject", "Export"];
