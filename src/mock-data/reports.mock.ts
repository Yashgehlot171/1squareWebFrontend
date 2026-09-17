import type { DashboardConfig, ReportRecord, RoleCode } from "../types";

export const dashboardsMock: Record<RoleCode, DashboardConfig> = {
  SUPER_ADMIN: {
    metrics: [
      { label: "Total Users", value: "12,482" },
      { label: "Total Properties", value: "3,208" },
      { label: "Pending Properties", value: "126" },
      { label: "Revenue", value: "INR 4.86Cr" },
      { label: "Open Tickets", value: "48" },
      { label: "Legal Pending", value: "26" },
    ],
    recentActivities: ["User created by Raman Nair", "Property prop_1001 moved to pending verification", "Refund ref_7002 processed by finance team"],
  },
  ADMIN: {
    metrics: [
      { label: "Total Users", value: "12,482" },
      { label: "Total Properties", value: "3,208" },
      { label: "Pending Approvals", value: "126" },
      { label: "Open Tickets", value: "48" },
    ],
    recentActivities: ["Ticket tic_3003 escalated to admin", "Property prop_1001 edited by operations", "Admin report exported"],
  },
  SUPPORT_TEAM: {
    metrics: [
      { label: "Open Tickets", value: "21" },
      { label: "Assigned Tickets", value: "14" },
      { label: "Escalated Tickets", value: "6" },
      { label: "Closed Tickets", value: "112" },
    ],
    recentActivities: ["Ticket tic_3001 assigned to Neha Das", "Support note added to tic_3002", "User query resolved for billing issue"],
  },
};

export const reportsByRoleMock: Record<RoleCode, ReportRecord[]> = {
  SUPER_ADMIN: [
    { id: "rep_8001", name: "User Report", category: "Users", updatedAt: "2026-06-08", recordCount: 12482 },
    { id: "rep_8002", name: "Property Report", category: "Properties", updatedAt: "2026-06-08", recordCount: 3208 },
    { id: "rep_8003", name: "Finance Report", category: "Finance", updatedAt: "2026-06-07", recordCount: 842 },
    { id: "rep_8004", name: "Legal Report", category: "Legal", updatedAt: "2026-06-08", recordCount: 179 },
  ],
  ADMIN: [
    { id: "rep_8101", name: "User Report", category: "Users", updatedAt: "2026-06-08", recordCount: 12482 },
    { id: "rep_8102", name: "Property Report", category: "Properties", updatedAt: "2026-06-08", recordCount: 3208 },
    { id: "rep_8103", name: "Ticket Report", category: "Support", updatedAt: "2026-06-08", recordCount: 153 },
  ],
  SUPPORT_TEAM: [{ id: "rep_8201", name: "Ticket Report", category: "Support", updatedAt: "2026-06-08", recordCount: 153 }],
};
