import { serviceProviderData } from "../../mock/serviceProviderData";
import { BusinessModulePage } from "../common/BusinessModulePage";

export function ServiceProviderManagementPage() {
  return (
    <BusinessModulePage
      title="Home Service Provider Management"
      subtitle="40+ home service providers with role, verification, ratings, and service status workflows."
      rows={serviceProviderData}
      columns={[
        { key: "id", label: "Provider ID" },
        { key: "providerName", label: "Provider Name" },
        { key: "serviceRole", label: "Role" },
        { key: "mobile", label: "Mobile" },
        { key: "city", label: "City" },
        { key: "area", label: "Area" },
        { key: "rating", label: "Rating" },
        { key: "verifiedStatus", label: "Verified", status: true },
        { key: "status", label: "Status", status: true },
      ]}
      fields={[
        { key: "providerName", label: "Provider Name", required: true },
        { key: "serviceRole", label: "Service Role", required: true, type: "select", options: ["Contractor", "Mistri", "Plumber", "Electrician", "Carpenter", "Painter", "Tiles Installer", "Marble Installer", "POP Worker", "Fabricator", "Labour Contractor"] },
        { key: "mobile", label: "Mobile", required: true, type: "mobile" },
        { key: "whatsappNumber", label: "WhatsApp Number", type: "mobile" },
        { key: "alternateMobile", label: "Alternate Mobile", type: "mobile" },
        { key: "state", label: "State", required: true },
        { key: "city", label: "City", required: true },
        { key: "area", label: "Area", required: true },
        { key: "address", label: "Address", type: "textarea" },
        { key: "experience", label: "Experience" },
        { key: "chargesType", label: "Charges Type" },
        { key: "rating", label: "Rating", type: "number" },
        { key: "status", label: "Status", required: true, type: "select", options: ["Active", "Inactive"] },
      ]}
      searchableKeys={["id", "providerName", "serviceRole", "mobile", "city", "area"]}
      actions={["Verify", "Block", "Active/Inactive", "Rate Provider", "Delete"]}
      remarkRequiredActions={["Block", "Delete"]}
    />
  );
}
