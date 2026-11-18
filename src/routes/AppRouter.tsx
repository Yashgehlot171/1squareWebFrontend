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
import { BuyerLeadPurchasesPage } from "../modules/management/BuyerLeadPurchasesPage";
import { BankManagementPage } from "../modules/masters/BankManagementPage";
import { BannerManagementPage } from "../modules/masters/BannerManagementPage";
import { ConstructionManagementPage } from "../modules/management/ConstructionManagementPage";
import { ConstructionBuildersPage } from "../modules/management/ConstructionBuildersPage";
import { ConstructionPlanApprovalsPage } from "../modules/management/ConstructionPlanApprovalsPage";
import { ConstructionRfqsPage } from "../modules/management/ConstructionRfqsPage";
import { ConstructionProjectsPage } from "../modules/management/ConstructionProjectsPage";
import { ConstructionRevenuePage } from "../modules/management/ConstructionRevenuePage";
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
import { TicketsPage } from "../modules/tickets/TicketsPage";
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
        {/*
          Permission slugs below fixed from the mock-era EMPLOYEE_VIEW/BROKER_VIEW/
          CUSTOMER_VIEW/EMPLOYEE_CREATE/EMPLOYEE_EDIT invented slugs to the real backend
          ones. Verified against 1SqrPropertyBackend/prisma/seed.ts's permission seed
          list and src/routes/adminUser.routes.ts: the ONLY permissions that exist for
          the users domain are USER_VIEW / USER_CREATE / USER_EDIT (there is no
          USER_DELETE, and no EMPLOYEE-prefixed, BROKER-prefixed or CUSTOMER-prefixed
          permission anywhere in the backend). Under the old slugs, any admin who
          wasn't super-admin (i.e. did not
          get the "ALL" bypass) could never actually pass these guards, since a
          permission that no role can ever hold always evaluates false.
        */}
        <Route path="/customers" element={<RouteGuard permission="USER_VIEW"><CustomerManagementPage /></RouteGuard>} />
        <Route path="/brokers" element={<RouteGuard permission="USER_VIEW"><BrokerManagementPage /></RouteGuard>} />
        <Route path="/construction" element={<RouteGuard permission="CONSTRUCTION_VIEW"><ConstructionManagementPage /></RouteGuard>} />
        <Route path="/construction/builders" element={<RouteGuard permission="CONSTRUCTION_VIEW"><ConstructionBuildersPage /></RouteGuard>} />
        <Route path="/construction/builders/:userId" element={<RouteGuard permission="CONSTRUCTION_VIEW"><ConstructionBuildersPage /></RouteGuard>} />
        <Route path="/construction/plan-approvals" element={<RouteGuard permission="CONSTRUCTION_VIEW"><ConstructionPlanApprovalsPage /></RouteGuard>} />
        <Route path="/construction/plan-approvals/:versionId" element={<RouteGuard permission="CONSTRUCTION_VIEW"><ConstructionPlanApprovalsPage /></RouteGuard>} />
        <Route path="/construction/rfqs" element={<RouteGuard permission="CONSTRUCTION_VIEW"><ConstructionRfqsPage /></RouteGuard>} />
        <Route path="/construction/rfqs/:id" element={<RouteGuard permission="CONSTRUCTION_VIEW"><ConstructionRfqsPage /></RouteGuard>} />
        <Route path="/construction/projects" element={<RouteGuard permission="CONSTRUCTION_VIEW"><ConstructionProjectsPage /></RouteGuard>} />
        <Route path="/construction/projects/:id" element={<RouteGuard permission="CONSTRUCTION_VIEW"><ConstructionProjectsPage /></RouteGuard>} />
        <Route path="/construction/revenue" element={<RouteGuard permission="CONSTRUCTION_VIEW"><ConstructionRevenuePage /></RouteGuard>} />
        <Route path="/material-suppliers" element={<RouteGuard permission="SUPPLIER_VIEW"><MaterialSupplierManagementPage /></RouteGuard>} />
        <Route path="/service-providers" element={<RouteGuard permission="PROVIDER_VIEW"><ServiceProviderManagementPage /></RouteGuard>} />
        <Route path="/masters" element={<RouteGuard permission="MASTER_VIEW"><MasterManagementPage /></RouteGuard>} />
        <Route path="/masters/construction-plans/new" element={<RouteGuard permission="MASTER_VIEW"><ConstructionPlanWizardPage /></RouteGuard>} />
        <Route path="/masters/construction-plans/:id/edit" element={<RouteGuard permission="MASTER_VIEW"><ConstructionPlanWizardPage /></RouteGuard>} />
        <Route path="/banks" element={<RouteGuard permission="BANK_VIEW"><BankManagementPage /></RouteGuard>} />
        <Route path="/banners" element={<RouteGuard permission="BANNER_VIEW"><BannerManagementPage /></RouteGuard>} />
        <Route path="/notifications" element={<RouteGuard permission="NOTIFICATION_VIEW"><NotificationManagementPage /></RouteGuard>} />
        <Route path="/employees" element={<RouteGuard permission="USER_VIEW"><EmployeeManagementPage /></RouteGuard>} />
        {/*
          /users/new, /users/:id and /users/:id/edit removed: UsersPage now renders
          create/view/edit/status/role actions as modals (UserListPage), matching the
          pattern already established by LeadManagementPage, instead of separate mock
          form/detail routes. UserFormPage.tsx and UserDetailsPage.tsx (mock-only, no
          real service calls) were deleted along with them.
        */}
        <Route path="/users" element={<RouteGuard permission="USER_VIEW"><UsersPage /></RouteGuard>} />
        <Route path="/roles" element={<RouteGuard permission="ROLE_VIEW"><RolesPage /></RouteGuard>} />
        <Route path="/roles/new" element={<RouteGuard permission="ROLE_CREATE"><RoleFormPage /></RouteGuard>} />
        <Route path="/roles/:id/edit" element={<RouteGuard permission="ROLE_EDIT"><RoleFormPage /></RouteGuard>} />
        <Route path="/roles/matrix" element={<RouteGuard permission="PERMISSION_VIEW"><PermissionMatrixPage /></RouteGuard>} />
        <Route path="/properties" element={<RouteGuard permission="PROPERTY_VIEW"><PropertiesPage /></RouteGuard>} />
        <Route path="/property-lead-purchases" element={<RouteGuard permission="PROPERTY_VIEW"><BuyerLeadPurchasesPage /></RouteGuard>} />
        <Route path="/properties/new" element={<RouteGuard permission="PROPERTY_CREATE"><PropertyFormPage /></RouteGuard>} />
        <Route path="/properties/:id" element={<RouteGuard permission="PROPERTY_VIEW"><PropertyDetailsPage /></RouteGuard>} />
        <Route path="/properties/:id/edit" element={<RouteGuard permission="PROPERTY_EDIT"><PropertyFormPage /></RouteGuard>} />
        <Route path="/verification" element={<RouteGuard permission="PROPERTY_VIEW"><PropertyVerificationPage /></RouteGuard>} />
        {/*
          /tickets/:id removed: TicketsPage now renders ticket detail, assign, reply,
          remark, status, and close actions as modals, matching the pattern already
          established by LeadManagementPage, instead of a separate mock detail route.
          TicketDetailsPage.tsx (mock-only) was deleted along with it.
        */}
        <Route path="/tickets" element={<RouteGuard permission="SUPPORT_TICKET_VIEW"><TicketsPage /></RouteGuard>} />
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
