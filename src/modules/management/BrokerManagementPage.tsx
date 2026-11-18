import { UserListPage } from "../users/UserListPage";

export function BrokerManagementPage() {
  return (
    <UserListPage
      title="Broker Management"
      subtitle="Brokers filtered by RBAC role, with broker profile details (firm, RERA, GST, verification) where available."
      roleFilter="broker"
      assignableRoleSlugs={["broker"]}
      emptyTitle="No brokers found"
    />
  );
}
