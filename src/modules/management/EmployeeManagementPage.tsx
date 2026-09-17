import { managementRecords } from "../../mock-data/management.mock";
import { ManagementPage } from "../common/ManagementPage";

export function EmployeeManagementPage() {
  return (
    <ManagementPage
      title="Employee Management"
      subtitle="Employees, role assignments, and operational access controls."
      moduleKey="employee"
      viewPermission="EMPLOYEE_VIEW"
      createPermission="EMPLOYEE_CREATE"
      editPermission="EMPLOYEE_EDIT"
      blockPermission="EMPLOYEE_DELETE"
      records={managementRecords.employees}
    />
  );
}
