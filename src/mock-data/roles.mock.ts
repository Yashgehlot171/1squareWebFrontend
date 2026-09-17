import type { Permission, RoleDefinition } from "../types";

export const superAdminPermissions: Permission[] = ["ALL"];

export const adminPermissions: Permission[] = [
  "DASHBOARD_VIEW",
  "PROPERTY_VIEW",
  "PROPERTY_CREATE",
  "PROPERTY_EDIT",
  "PROPERTY_APPROVE",
  "PROPERTY_REJECT",
  "PROPERTY_EXPORT",
  "BROKER_VIEW",
  "BROKER_VERIFY",
  "CUSTOMER_VIEW",
  "LEAD_VIEW",
  "LEAD_ASSIGN",
  "CONSTRUCTION_VIEW",
  "MATERIAL_SUPPLIER_VIEW",
  "SERVICE_PROVIDER_VIEW",
  "MASTER_VIEW",
  "NOTIFICATION_VIEW",
  "SUPPORT_TICKET_VIEW",
  "SUPPORT_TICKET_ASSIGN",
  "REPORT_VIEW",
  "REPORT_EXPORT",
];

export const supportTeamPermissions: Permission[] = [
  "DASHBOARD_VIEW",
  "LEAD_VIEW",
  "LEAD_UPDATE",
  "LEAD_REMARK",
  "SUPPORT_TICKET_VIEW",
  "SUPPORT_TICKET_REPLY",
  "CUSTOMER_VIEW",
];

export const rolesMock: RoleDefinition[] = [
  {
    id: "role_001",
    name: "Super Admin",
    code: "SUPER_ADMIN",
    description: "Full 1Square Property system access.",
    permissions: superAdminPermissions,
    status: "active",
  },
  {
    id: "role_002",
    name: "Admin",
    code: "ADMIN",
    description: "Operational access controlled by assigned permissions.",
    permissions: adminPermissions,
    status: "active",
  },
  {
    id: "role_003",
    name: "Support Team",
    code: "SUPPORT_TEAM",
    description: "Support ticket handling and lead follow-up access.",
    permissions: supportTeamPermissions,
    status: "active",
  },
];
