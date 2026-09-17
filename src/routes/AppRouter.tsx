import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { setInitialized, setSession } from "../app/store";
import { AuthGuard } from "../components/common/AuthGuard";
import { Loader } from "../components/common/Loader";
import { AppLayout } from "../components/layout/AppLayout";
import { AuditPage } from "../modules/audit/AuditPage";
import { ForgotPasswordPage } from "../modules/auth/ForgotPasswordPage";
import { LoginPage } from "../modules/auth/LoginPage";
import { PasswordFormPage } from "../modules/auth/PasswordFormPage";
import { DashboardPage } from "../modules/dashboard/DashboardPage";
import { FinancePage } from "../modules/finance/FinancePage";
import { FinanceRequestDetailsPage } from "../modules/finance/FinanceRequestDetailsPage";
import { ForbiddenPage } from "../modules/forbidden/ForbiddenPage";
import { LegalCaseDetailsPage } from "../modules/legal/LegalCaseDetailsPage";
import { LegalPage } from "../modules/legal/LegalPage";
import { BrokerManagementPage } from "../modules/management/BrokerManagementPage";
import { ConstructionManagementPage } from "../modules/management/ConstructionManagementPage";
import { CustomerManagementPage } from "../modules/management/CustomerManagementPage";
import { EmployeeManagementPage } from "../modules/management/EmployeeManagementPage";
import { LeadManagementPage } from "../modules/management/LeadManagementPage";
import { MasterManagementPage } from "../modules/management/MasterManagementPage";
import { MaterialSupplierManagementPage } from "../modules/management/MaterialSupplierManagementPage";
import { NotificationManagementPage } from "../modules/management/NotificationManagementPage";
import { ServiceProviderManagementPage } from "../modules/management/ServiceProviderManagementPage";
import { ConstructionPlanWizardPage } from "../modules/masters/ConstructionPlanWizardPage";
import { NotFoundPage } from "../modules/not-found/NotFoundPage";
import { ProfilePage } from "../modules/profile/ProfilePage";
import { PropertyDetailsPage } from "../modules/properties/PropertyDetailsPage";
import { PropertyFormPage } from "../modules/properties/PropertyFormPage";
import { PropertiesPage } from "../modules/properties/PropertiesPage";
import { PropertyVerificationPage } from "../modules/properties/PropertyVerificationPage";
import { ReportsPage } from "../modules/reports/ReportsPage";
import { PermissionMatrixPage } from "../modules/roles/PermissionMatrixPage";
import { RoleFormPage } from "../modules/roles/RoleFormPage";
import { RolesPage } from "../modules/roles/RolesPage";
import { SettingsPage } from "../modules/settings/SettingsPage";
import { TicketDetailsPage } from "../modules/tickets/TicketDetailsPage";
import { TicketsPage } from "../modules/tickets/TicketsPage";
import { UserDetailsPage } from "../modules/users/UserDetailsPage";
import { UserFormPage } from "../modules/users/UserFormPage";
import { UsersPage } from "../modules/users/UsersPage";
import { authService } from "../services/auth.service";
import type { Permission } from "../types";
import { hasPermission } from "../utils/permissions";

function RouteGuard({ permission, children }: { permission: Permission; children: JSX.Element }) {
  const user = useAppSelector((state) => state.auth.user);
  if (!user || user.status !== "active" || !hasPermission(user.permissions, permission)) {
    return <Navigate to="/403" replace />;
  }
  return children;
}

function DashboardRedirect() {
  const user = useAppSelector((state) => state.auth.user);
  return <Navigate to={user ? authService.getRoleDashboardPath(user.role) : "/login"} replace />;
}

function SessionBootstrapper({ children }: { children: JSX.Element }) {
  const dispatch = useAppDispatch();
  const initialized = useAppSelector((state) => state.auth.initialized);

  useEffect(() => {
    authService.getStoredSession().then((session) => {
      if (session) {
        dispatch(setSession(session));
      } else {
        dispatch(setInitialized(undefined));
      }
    });
  }, [dispatch]);

  if (!initialized) {
    return <Loader />;
  }

  return children;
}

function AppShell() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/dashboard" element={<RouteGuard permission="DASHBOARD_VIEW"><DashboardRedirect /></RouteGuard>} />
        <Route path="/dashboard/super-admin" element={<RouteGuard permission="DASHBOARD_VIEW"><DashboardPage /></RouteGuard>} />
        <Route path="/dashboard/admin" element={<RouteGuard permission="DASHBOARD_VIEW"><DashboardPage /></RouteGuard>} />
        <Route path="/dashboard/support" element={<RouteGuard permission="DASHBOARD_VIEW"><DashboardPage /></RouteGuard>} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/change-password" element={<PasswordFormPage mode="change" />} />
        <Route path="/leads" element={<RouteGuard permission="LEAD_VIEW"><LeadManagementPage /></RouteGuard>} />
        <Route path="/customers" element={<RouteGuard permission="CUSTOMER_VIEW"><CustomerManagementPage /></RouteGuard>} />
        <Route path="/brokers" element={<RouteGuard permission="BROKER_VIEW"><BrokerManagementPage /></RouteGuard>} />
        <Route path="/construction" element={<RouteGuard permission="CONSTRUCTION_VIEW"><ConstructionManagementPage /></RouteGuard>} />
        <Route path="/material-suppliers" element={<RouteGuard permission="MATERIAL_SUPPLIER_VIEW"><MaterialSupplierManagementPage /></RouteGuard>} />
        <Route path="/service-providers" element={<RouteGuard permission="SERVICE_PROVIDER_VIEW"><ServiceProviderManagementPage /></RouteGuard>} />
        <Route path="/masters" element={<RouteGuard permission="MASTER_VIEW"><MasterManagementPage /></RouteGuard>} />
        <Route path="/masters/construction-plans/new" element={<RouteGuard permission="MASTER_VIEW"><ConstructionPlanWizardPage /></RouteGuard>} />
        <Route path="/masters/construction-plans/:id/edit" element={<RouteGuard permission="MASTER_VIEW"><ConstructionPlanWizardPage /></RouteGuard>} />
        <Route path="/notifications" element={<RouteGuard permission="NOTIFICATION_VIEW"><NotificationManagementPage /></RouteGuard>} />
        <Route path="/employees" element={<RouteGuard permission="EMPLOYEE_VIEW"><EmployeeManagementPage /></RouteGuard>} />
        <Route path="/users" element={<RouteGuard permission="EMPLOYEE_VIEW"><UsersPage /></RouteGuard>} />
        <Route path="/users/new" element={<RouteGuard permission="EMPLOYEE_CREATE"><UserFormPage /></RouteGuard>} />
        <Route path="/users/:id" element={<RouteGuard permission="EMPLOYEE_VIEW"><UserDetailsPage /></RouteGuard>} />
        <Route path="/users/:id/edit" element={<RouteGuard permission="EMPLOYEE_EDIT"><UserFormPage /></RouteGuard>} />
        <Route path="/roles" element={<RouteGuard permission="ROLE_VIEW"><RolesPage /></RouteGuard>} />
        <Route path="/roles/new" element={<RouteGuard permission="ROLE_CREATE"><RoleFormPage /></RouteGuard>} />
        <Route path="/roles/:id/edit" element={<RouteGuard permission="ROLE_EDIT"><RoleFormPage /></RouteGuard>} />
        <Route path="/roles/matrix" element={<RouteGuard permission="PERMISSION_VIEW"><PermissionMatrixPage /></RouteGuard>} />
        <Route path="/properties" element={<RouteGuard permission="PROPERTY_VIEW"><PropertiesPage /></RouteGuard>} />
        <Route path="/properties/new" element={<RouteGuard permission="PROPERTY_CREATE"><PropertyFormPage /></RouteGuard>} />
        <Route path="/properties/:id" element={<RouteGuard permission="PROPERTY_VIEW"><PropertyDetailsPage /></RouteGuard>} />
        <Route path="/properties/:id/edit" element={<RouteGuard permission="PROPERTY_EDIT"><PropertyFormPage /></RouteGuard>} />
        <Route path="/verification" element={<RouteGuard permission="PROPERTY_VIEW"><PropertyVerificationPage /></RouteGuard>} />
        <Route path="/tickets" element={<RouteGuard permission="SUPPORT_TICKET_VIEW"><TicketsPage /></RouteGuard>} />
        <Route path="/tickets/:id" element={<RouteGuard permission="SUPPORT_TICKET_VIEW"><TicketDetailsPage /></RouteGuard>} />
        <Route path="/finance" element={<RouteGuard permission="REPORT_VIEW"><FinancePage /></RouteGuard>} />
        <Route path="/finance/:type/:id" element={<RouteGuard permission="REPORT_VIEW"><FinanceRequestDetailsPage /></RouteGuard>} />
        <Route path="/legal" element={<RouteGuard permission="PROPERTY_VIEW"><LegalPage /></RouteGuard>} />
        <Route path="/legal/:id" element={<RouteGuard permission="PROPERTY_VIEW"><LegalCaseDetailsPage /></RouteGuard>} />
        <Route path="/reports" element={<RouteGuard permission="REPORT_VIEW"><ReportsPage /></RouteGuard>} />
        <Route path="/settings" element={<RouteGuard permission="SETTINGS_MANAGE"><SettingsPage /></RouteGuard>} />
        <Route path="/audit-logs" element={<RouteGuard permission="AUDIT_LOG_VIEW"><AuditPage /></RouteGuard>} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AppLayout>
  );
}

export function AppRouter() {
  const token = useAppSelector((state) => state.auth.token);

  return (
    <BrowserRouter>
      <SessionBootstrapper>
        <Routes>
          <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/forgot-password" element={token ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />} />
          <Route path="/reset-password" element={token ? <Navigate to="/dashboard" replace /> : <PasswordFormPage mode="reset" />} />
          <Route element={<AuthGuard />}>
            <Route path="/*" element={<AppShell />} />
          </Route>
        </Routes>
      </SessionBootstrapper>
    </BrowserRouter>
  );
}
