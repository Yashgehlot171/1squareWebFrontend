import { CUSTOMER_ROLE_SLUGS } from "../../services/user.service";
import { UserListPage } from "../users/UserListPage";

/**
 * "Customers" = buyer + seller RBAC roles merged client-side, NOT the
 * seeded `customer` role slug. See CUSTOMER_ROLE_SLUGS's doc comment in
 * user.service.ts for why (self-registered users resolve to `buyer`/
 * `seller` RBAC roles in this backend, not `customer` — confirmed against
 * auth.service.ts's resolveSecurityRole() and constants/auth.ts).
 */
export function CustomerManagementPage() {
  return (
    <UserListPage
      title="Customer Management"
      subtitle="Buyer and seller accounts merged into one list, with profile and status actions sourced live from the admin API."
      roleFilter={CUSTOMER_ROLE_SLUGS}
      assignableRoleSlugs={CUSTOMER_ROLE_SLUGS}
      emptyTitle="No customers found"
    />
  );
}
