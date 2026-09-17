import { supplierData } from "../../mock/supplierData";
import { BusinessModulePage } from "../common/BusinessModulePage";

export function MaterialSupplierManagementPage() {
  return (
    <BusinessModulePage
      title="Material Supplier Management"
      subtitle="40+ material suppliers with categories, prime supplier flow, ratings, and active/inactive controls."
      rows={supplierData}
      columns={[
        { key: "id", label: "Supplier ID" },
        { key: "supplierName", label: "Supplier Name" },
        { key: "businessName", label: "Business Name" },
        { key: "mobile", label: "Mobile" },
        { key: "city", label: "City" },
        { key: "materialCategory", label: "Category" },
        { key: "rating", label: "Rating" },
        { key: "primeSupplier", label: "Prime" },
        { key: "status", label: "Status", status: true },
      ]}
      fields={[
        { key: "supplierName", label: "Supplier Name", required: true },
        { key: "businessName", label: "Business Name", required: true },
        { key: "mobile", label: "Mobile", required: true, type: "mobile" },
        { key: "whatsappNumber", label: "WhatsApp Number", type: "mobile" },
        { key: "email", label: "Email", type: "email" },
        { key: "state", label: "State", required: true },
        { key: "city", label: "City", required: true },
        { key: "area", label: "Area" },
        { key: "address", label: "Address", required: true, type: "textarea" },
        { key: "materialCategory", label: "Material Category", required: true, type: "select", options: ["Cement", "Steel", "Sand", "Bricks", "Aggregate", "Tiles", "Marble", "Granite", "Paint", "Electrical", "Plumbing", "Hardware"] },
        { key: "rating", label: "Rating", type: "number" },
        { key: "status", label: "Status", required: true, type: "select", options: ["Active", "Inactive"] },
      ]}
      searchableKeys={["id", "supplierName", "businessName", "mobile", "city", "materialCategory"]}
      actions={["Mark Prime", "Mark Non-Prime", "Active/Inactive", "Rate Supplier", "Delete"]}
      remarkRequiredActions={["Delete"]}
    />
  );
}
