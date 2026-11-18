import { STAFF_ROLE_SLUGS } from "../../services/user.service";
import { UserListPage } from "../users/UserListPage";

/**
 * "Employees" = internal staff, defined as every seeded role EXCEPT the
 * customer-facing ones (customer/buyer/seller/broker) — see
 * STAFF_ROLE_SLUGS's doc comment in user.service.ts for why this specific
 * set was chosen (it mirrors the backend's own ADMIN_ROLE_SLUGS constant).
 */
export function EmployeeManagementPage() {
  return (
    <UserListPage
      title="Employee Management"
      subtitle="Internal staff (admin, support, finance, legal, construction), role assignments, and operational access controls."
      roleFilter={STAFF_ROLE_SLUGS}
      assignableRoleSlugs={STAFF_ROLE_SLUGS}
      emptyTitle="No employees found"
    />
  );
}
