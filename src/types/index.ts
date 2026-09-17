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
  // because src/mock-data/roles.mock.ts still references it for a mock
  // support-team role. Real backend lead permissions verified against
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
  | "MATERIAL_SUPPLIER_VIEW"
  | "MATERIAL_SUPPLIER_CREATE"
  | "MATERIAL_SUPPLIER_EDIT"
  | "SERVICE_PROVIDER_VIEW"
  | "SERVICE_PROVIDER_CREATE"
  | "SERVICE_PROVIDER_EDIT"
  | "MASTER_VIEW"
  | "MASTER_CREATE"
  | "MASTER_EDIT"
  | "NOTIFICATION_VIEW"
  | "NOTIFICATION_CREATE"
  | "SUPPORT_TICKET_VIEW"
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

export interface RoleDefinition {
  id: string;
  name: string;
  code: RoleCode;
  description: string;
  permissions: Permission[];
  status: "active" | "inactive";
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
