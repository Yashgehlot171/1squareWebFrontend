import type { ReactNode } from "react";

export type RoleCode = "SUPER_ADMIN" | "ADMIN" | "SUPPORT_TEAM" | "LEGAL_TEAM" | "LOAN_TEAM";
export type AdminStatus = "active" | "inactive" | "blocked" | "suspended";

export type LegacyPermission =
  | "dashboard.view"
  | "users.view"
  | "users.create"
  | "users.edit"
  | "users.delete"
  | "users.suspend"
  | "users.activate"
  | "users.assign_role"
  | "roles.view"
  | "roles.create"
  | "roles.edit"
  | "roles.export"
  | "properties.view"
  | "properties.create"
  | "properties.edit"
  | "properties.approve"
  | "properties.reject"
  | "properties.mark_sold"
  | "verification.view"
  | "verification.approve"
  | "verification.reject"
  | "verification.request_documents"
  | "tickets.view"
  | "tickets.assign"
  | "tickets.note"
  | "tickets.status"
  | "tickets.close"
  | "finance.view"
  | "finance.refund"
  | "finance.invoice"
  | "legal.view"
  | "legal.approve"
  | "legal.reject"
  | "legal.request_documents"
  | "legal.note"
  | "reports.view"
  | "reports.export"
  | "settings.manage"
  | "audit.view";

export type ApiPermission =
  | "ALL"
  | "DASHBOARD_VIEW"
  | "ROLE_VIEW"
  | "ROLE_CREATE"
  | "ROLE_EDIT"
  | "ROLE_DELETE"
  | "ROLE_EXPORT"
  | "PERMISSION_VIEW"
  | "PERMISSION_EDIT"
  // Real backend permissions for the whole /admin/users domain (Users, Employees,
  // Brokers, Customers screens all share this one endpoint family) — verified
  // against 1SqrPropertyBackend/prisma/seed.ts's permission seed list and
  // src/routes/adminUser.routes.ts's authorizePermissions() gates. There is no
  // USER_DELETE (no delete route exists) and no EMPLOYEE_*/BROKER_*/CUSTOMER_*
  // permission anywhere in the backend, despite the EMPLOYEE_*/BROKER_*/CUSTOMER_*
  // entries kept below — those were never real and are kept only because
  // src/utils/permissions.ts's legacy alias map and other still-mock code
  // still reference them.
  | "USER_VIEW"
  | "USER_CREATE"
  | "USER_EDIT"
  | "EMPLOYEE_VIEW"
  | "EMPLOYEE_CREATE"
  | "EMPLOYEE_EDIT"
  | "EMPLOYEE_DELETE"
  | "CUSTOMER_VIEW"
  | "CUSTOMER_CREATE"
  | "CUSTOMER_EDIT"
  | "CUSTOMER_BLOCK"
  | "BROKER_VIEW"
  | "BROKER_CREATE"
  | "BROKER_EDIT"
  | "BROKER_VERIFY"
  | "BROKER_BLOCK"
  | "PROPERTY_VIEW"
  | "PROPERTY_CREATE"
  | "PROPERTY_EDIT"
  | "PROPERTY_DELETE"
  | "PROPERTY_APPROVE"
  | "PROPERTY_REJECT"
  | "PROPERTY_BLOCK"
  | "PROPERTY_FEATURE"
  | "PROPERTY_EXPORT"
  | "LEAD_VIEW"
  | "LEAD_CREATE"
  | "LEAD_EDIT"
  // NOTE: LEAD_UPDATE is not a real backend permission (see
  // 1SqrPropertyBackend/src/constants/permissions.ts) — it is kept here only
  // because src/utils/permissions.ts's legacy alias map still references it
  // for a mock support-team role slug. Real backend lead permissions verified against
  // 1SqrPropertyBackend/src/routes/lead.routes.ts are LEAD_VIEW, LEAD_CREATE,
  // LEAD_EDIT, LEAD_ASSIGN, LEAD_REASSIGN, LEAD_REMARK, LEAD_STATUS,
  // LEAD_CLOSE and LEAD_EXPORT (LEAD_EXPORT has no wired route yet).
  | "LEAD_UPDATE"
  | "LEAD_REMARK"
  | "LEAD_ASSIGN"
  | "LEAD_REASSIGN"
  | "LEAD_STATUS"
  | "LEAD_CLOSE"
  | "LEAD_EXPORT"
  | "CONSTRUCTION_VIEW"
  | "CONSTRUCTION_CREATE"
  | "CONSTRUCTION_EDIT"
  // Real backend permission slugs verified against
  // 1SqrPropertyBackend/prisma/seed.ts (modules "suppliers" / "providers") —
  // there is no *_DELETE variant seeded for either resource.
  | "SUPPLIER_VIEW"
  | "SUPPLIER_CREATE"
  | "SUPPLIER_EDIT"
  | "PROVIDER_VIEW"
  | "PROVIDER_CREATE"
  | "PROVIDER_EDIT"
  | "MASTER_VIEW"
  | "MASTER_CREATE"
  | "MASTER_EDIT"
  // Bank/Banner permissions, verified against
  // 1SqrPropertyBackend/src/routes/loan.routes.ts and
  // src/routes/banner.routes.ts — real, distinct backend permissions
  // (BANK_* / BANNER_*), not MASTER_* like the generic masters router.
  | "BANK_VIEW"
  | "BANK_CREATE"
  | "BANK_EDIT"
  | "BANK_DELETE"
  | "BANNER_VIEW"
  | "BANNER_CREATE"
  | "BANNER_EDIT"
  | "BANNER_DELETE"
  | "NOTIFICATION_VIEW"
  | "NOTIFICATION_CREATE"
  // NOTIFICATION_EDIT/SEND/DELETE verified as real, distinct seeded
  // permissions against 1SqrPropertyBackend/prisma/seed.ts and
  // src/routes/notification.routes.ts's adminNotificationRouter — they were
  // simply missing from this union (NOTIFICATION_VIEW/CREATE were the only
  // two previously listed).
  | "NOTIFICATION_EDIT"
  | "NOTIFICATION_SEND"
  | "NOTIFICATION_DELETE"
  | "SUPPORT_TICKET_VIEW"
  // SUPPORT_TICKET_CREATE/EDIT verified as real seeded permissions
  // (1SqrPropertyBackend/prisma/seed.ts) missing from this union.
  // SUPPORT_TICKET_EDIT specifically gates the admin status-change route
  // (adminSupportTicketRouter's PATCH .../status), distinct from
  // SUPPORT_TICKET_CLOSE which gates the separate PATCH .../close route.
  | "SUPPORT_TICKET_CREATE"
  | "SUPPORT_TICKET_EDIT"
  | "SUPPORT_TICKET_ASSIGN"
  | "SUPPORT_TICKET_REPLY"
  | "SUPPORT_TICKET_CLOSE"
  | "REPORT_VIEW"
  | "REPORT_EXPORT"
  | "AUDIT_LOG_VIEW"
  | "SETTINGS_MANAGE";

export type Permission = ApiPermission | LegacyPermission;

export interface ApiMeta {
  requestId: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  status?: "success";
  success?: boolean;
  message?: string;
  meta?: ApiMeta;
  data: T;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string | null;
  mobile: string;
  role: RoleCode;
  roleLabel: string;
  permissions: Permission[];
  status: AdminStatus;
  city?: string | null;
  avatar?: string;
  createdAt?: string;
  tokenExpiresAt?: string;
  lastLogin?: string;
  lastLoginAt?: string;
}

export interface SessionPayload {
  token: string;
  refreshToken?: string;
  user: AuthUser;
  tokenExpiresAt?: string;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: RoleCode;
  roleLabel: string;
  status: "active" | "suspended";
  createdDate: string;
  lastLogin: string;
}

export interface PropertyRecord {
  id: string;
  title: string;
  type: "Plot" | "Agricultural Land" | "House" | "Commercial";
  owner: string;
  location: string;
  price: number;
  area: string;
  status: "Draft" | "Pending" | "Approved" | "Rejected" | "Sold";
  createdDate: string;
}

export interface VerificationRecord {
  id: string;
  propertyId: string;
  ownerName: string;
  documentType: string;
  documentStatus: "Submitted" | "Under Review" | "Approved" | "Rejected";
  assignedLegalMember: string;
  remarks: string;
}

export interface TicketRecord {
  id: string;
  user: string;
  subject: string;
  category: string;
  priority: "Low" | "Medium" | "High";
  status: "Open" | "In Progress" | "Escalated" | "Closed";
  assignedTo: string;
  createdDate: string;
}

export interface TransactionRecord {
  id: string;
  user: string;
  amount: number;
  paymentMethod: string;
  status: "Success" | "Pending" | "Failed";
  date: string;
}

export interface InvoiceRecord {
  id: string;
  user: string;
  amount: number;
  gst: number;
  status: "Paid" | "Pending" | "Overdue";
  downloadUrl: string;
}

export interface RefundRecord {
  id: string;
  user: string;
  amount: number;
  reason: string;
  status: "Requested" | "Processed" | "Rejected";
}

export interface RevenueRecord {
  plan: string;
  subscribers: number;
  revenue: number;
}

export interface LegalCaseRecord {
  id: string;
  propertyId: string;
  owner: string;
  documentType: string;
  status: "Pending" | "Approved" | "Rejected" | "Need More Documents";
  assignedTo: string;
  remarks: string;
}

export interface ReportRecord {
  id: string;
  name: string;
  category: string;
  updatedAt: string;
  recordCount: number;
}

export interface AuditRecord {
  id: string;
  user: string;
  action: string;
  module: string;
  date: string;
  ipAddress: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  detail?: string;
}

export interface DashboardConfig {
  metrics: DashboardMetric[];
  recentActivities: string[];
}

export interface SidebarItem {
  label: string;
  path: string;
  permission: Permission;
  icon?: ReactNode;
}

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
}

export interface LoginFormValues {
  identifier: string;
  password: string;
  rememberMe: boolean;
}

export interface PasswordFormValues {
  currentPassword?: string;
  password: string;
  confirmPassword: string;
}

export interface OptionItem {
  label: string;
  value: string;
}

export interface SettingsSection {
  key: string;
  title: string;
  description: string;
}
