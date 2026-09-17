import { brokerData } from "../../mock/brokerData";
import { BusinessModulePage } from "../common/BusinessModulePage";

export function BrokerManagementPage() {
  return (
    <BusinessModulePage
      title="Broker Management"
      subtitle="Broker onboarding, firm verification, RERA/GST review, remarks, and property workflow."
      rows={brokerData}
      columns={[
        { key: "id", label: "Broker ID" },
        { key: "brokerName", label: "Broker Name" },
        { key: "firmName", label: "Firm Name" },
        { key: "mobile", label: "Mobile" },
        { key: "city", label: "City" },
        { key: "verificationStatus", label: "Verification", status: true },
        { key: "totalProperties", label: "Properties" },
        { key: "rating", label: "Rating" },
        { key: "status", label: "Status", status: true },
      ]}
      fields={[
        { key: "brokerName", label: "Broker Name", required: true },
        { key: "firmName", label: "Firm Name", required: true },
        { key: "mobile", label: "Mobile", required: true, type: "mobile" },
        { key: "email", label: "Email", type: "email" },
        { key: "state", label: "State", required: true },
        { key: "city", label: "City", required: true },
        { key: "officeAddress", label: "Office Address", required: true, type: "textarea" },
        { key: "experience", label: "Experience" },
        { key: "reraNumber", label: "RERA Number" },
        { key: "gstNumber", label: "GST Number" },
        { key: "verificationStatus", label: "Verification Status", required: true, type: "select", options: ["Pending", "Verified", "Rejected"] },
        { key: "status", label: "Status", required: true, type: "select", options: ["Active", "Blocked"] },
      ]}
      searchableKeys={["id", "brokerName", "firmName", "mobile", "city", "officeAddress"]}
      actions={["Verify", "Reject", "Block", "Unblock", "Add Remark", "View Broker Properties"]}
      remarkRequiredActions={["Reject", "Block"]}
    />
  );
}
