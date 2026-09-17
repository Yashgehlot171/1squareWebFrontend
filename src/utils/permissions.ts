import type { AuthUser, Permission, RoleCode } from "../types";

const legacyPermissionAliases: Partial<Record<Permission, Permission>> = {
  "dashboard.view": "DASHBOARD_VIEW",
  "users.view": "EMPLOYEE_VIEW",
  "users.create": "EMPLOYEE_CREATE",
  "users.edit": "EMPLOYEE_EDIT",
  "users.delete": "EMPLOYEE_DELETE",
  "users.suspend": "CUSTOMER_BLOCK",
  "users.activate": "CUSTOMER_EDIT",
  "users.assign_role": "ROLE_EDIT",
  "roles.view": "ROLE_VIEW",
  "roles.create": "ROLE_CREATE",
  "roles.edit": "ROLE_EDIT",
  "roles.export": "ROLE_EXPORT",
  "properties.view": "PROPERTY_VIEW",
  "properties.create": "PROPERTY_CREATE",
  "properties.edit": "PROPERTY_EDIT",
  "properties.approve": "PROPERTY_APPROVE",
  "properties.reject": "PROPERTY_REJECT",
  "properties.mark_sold": "PROPERTY_EDIT",
  "verification.view": "PROPERTY_VIEW",
  "verification.approve": "PROPERTY_APPROVE",
  "verification.reject": "PROPERTY_REJECT",
  "verification.request_documents": "PROPERTY_EDIT",
  "tickets.view": "SUPPORT_TICKET_VIEW",
  "tickets.assign": "SUPPORT_TICKET_ASSIGN",
  "tickets.note": "SUPPORT_TICKET_REPLY",
  "tickets.status": "SUPPORT_TICKET_REPLY",
  "tickets.close": "SUPPORT_TICKET_CLOSE",
  "finance.view": "REPORT_VIEW",
  "finance.refund": "REPORT_EXPORT",
  "finance.invoice": "REPORT_EXPORT",
  "legal.view": "PROPERTY_VIEW",
  "legal.approve": "PROPERTY_APPROVE",
  "legal.reject": "PROPERTY_REJECT",
  "legal.request_documents": "PROPERTY_EDIT",
  "legal.note": "PROPERTY_EDIT",
  "reports.view": "REPORT_VIEW",
  "reports.export": "REPORT_EXPORT",
  "settings.manage": "SETTINGS_MANAGE",
  "audit.view": "AUDIT_LOG_VIEW",
};

const apiPermissionAliases = Object.entries(legacyPermissionAliases).reduce<Partial<Record<Permission, Permission>>>(
  (acc, [legacy, api]) => {
    acc[api] = legacy as Permission;
    return acc;
  },
  {},
);

export function hasPermission(permissions: Permission[], permission: Permission) {
  if (permissions.includes("ALL")) {
    return true;
  }

  const legacyToApiAlias = legacyPermissionAliases[permission];
  const apiToLegacyAlias = apiPermissionAliases[permission];
  return (
    permissions.includes(permission) ||
    Boolean(legacyToApiAlias && permissions.includes(legacyToApiAlias)) ||
    Boolean(apiToLegacyAlias && permissions.includes(apiToLegacyAlias))
  );
}

export function hasAnyPermission(permissions: Permission[], requiredPermissions: Permission[]) {
  if (permissions.includes("ALL")) {
    return true;
  }
  return requiredPermissions.some((permission) => hasPermission(permissions, permission));
}

export function hasRole(user: AuthUser | null, role: RoleCode) {
  return user?.role === role;
}
