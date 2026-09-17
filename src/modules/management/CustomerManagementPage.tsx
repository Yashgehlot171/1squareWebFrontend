import { customerData } from "../../mock/customerData";
import { BusinessModulePage } from "../common/BusinessModulePage";

export function CustomerManagementPage() {
  return (
    <BusinessModulePage
      title="Customer Management"
      subtitle="30+ realistic Madhya Pradesh customers with profile, property, lead, and support workflow actions."
      rows={customerData}
      columns={[
        { key: "id", label: "Customer ID" },
        { key: "name", label: "Name" },
        { key: "mobile", label: "Mobile" },
        { key: "city", label: "City" },
        { key: "area", label: "Area" },
        { key: "totalProperties", label: "Properties" },
        { key: "totalLeads", label: "Leads" },
        { key: "savedProperties", label: "Saved" },
        { key: "status", label: "Status", status: true },
        { key: "registeredDate", label: "Registered" },
        { key: "lastLogin", label: "Last Login" },
      ]}
      fields={[
        { key: "name", label: "Name", required: true },
        { key: "mobile", label: "Mobile", required: true, type: "mobile" },
        { key: "email", label: "Email", type: "email" },
        { key: "state", label: "State", required: true },
        { key: "city", label: "City", required: true },
        { key: "area", label: "Area" },
        { key: "status", label: "Status", required: true, type: "select", options: ["Active", "Blocked"] },
      ]}
      searchableKeys={["id", "name", "mobile", "email", "city", "area"]}
      actions={["Block", "Unblock", "View Properties", "View Leads", "View Support Tickets"]}
      remarkRequiredActions={["Block"]}
    />
  );
}
