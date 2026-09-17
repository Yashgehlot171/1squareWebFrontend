import { Tab, Tabs } from "@mui/material";
import { useState } from "react";
import { constructionPlans, constructionRequests } from "../../mock/constructionData";
import { BusinessModulePage } from "../common/BusinessModulePage";

export function ConstructionManagementPage() {
  const [tab, setTab] = useState(0);

  return (
    <>
      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 2 }}>
        <Tab label="Construction Requests" />
        <Tab label="Construction Plan Master" />
      </Tabs>
      {tab === 0 ? (
        <BusinessModulePage
          title="Construction Request Management"
          subtitle="25+ realistic requests with assignment, follow-up, status, and close workflows."
          rows={constructionRequests}
          columns={[
            { key: "id", label: "Request ID" },
            { key: "userName", label: "User Name" },
            { key: "mobile", label: "Mobile" },
            { key: "city", label: "City" },
            { key: "location", label: "Location" },
            { key: "plotSize", label: "Plot Size" },
            { key: "selectedPlan", label: "Plan" },
            { key: "budget", label: "Budget", currency: true },
            { key: "status", label: "Status", status: true },
            { key: "followUpDate", label: "Follow-up" },
          ]}
          fields={[
            { key: "userName", label: "User Name", required: true },
            { key: "mobile", label: "Mobile", required: true, type: "mobile" },
            { key: "city", label: "City", required: true },
            { key: "location", label: "Location", required: true },
            { key: "plotSize", label: "Plot Size", required: true, type: "number" },
            { key: "selectedPlan", label: "Selected Plan", type: "select", options: ["Basic Plan", "Standard Plan", "Premium Plan", "Luxury Plan"] },
            { key: "budget", label: "Budget", type: "number" },
            { key: "status", label: "Status", required: true, type: "select", options: ["Pending", "Contacted", "In Discussion", "Converted", "Rejected", "Closed"] },
            { key: "assignedTo", label: "Assigned To" },
            { key: "followUpDate", label: "Follow-up Date", type: "date", validateWhen: (values) => ["Contacted", "In Discussion"].includes(values.status) },
            { key: "remark", label: "Remark", type: "textarea", validateWhen: (values) => ["Rejected", "Closed"].includes(values.status) },
          ]}
          searchableKeys={["id", "userName", "mobile", "city", "location", "selectedPlan"]}
          actions={["Update Status", "Assign Employee", "Add Remark", "Add Follow-up", "Close Request"]}
          remarkRequiredActions={["Close Request"]}
        />
      ) : (
        <BusinessModulePage
          title="Construction Plan Master"
          subtitle="Basic, Standard, Premium, and Luxury construction plans with realistic MP rates."
          rows={constructionPlans}
          columns={[
            { key: "id", label: "Plan ID" },
            { key: "planName", label: "Plan Name" },
            { key: "planType", label: "Plan Type" },
            { key: "costPerSqFt", label: "Cost / SqFt", currency: true },
            { key: "city", label: "City" },
            { key: "status", label: "Status", status: true },
          ]}
          fields={[
            { key: "planName", label: "Plan Name", required: true },
            { key: "planType", label: "Plan Type", required: true },
            { key: "costPerSqFt", label: "Cost Per Square Feet", required: true, type: "number" },
            { key: "city", label: "City" },
            { key: "shortDescription", label: "Short Description" },
            { key: "fullDescription", label: "Full Description", type: "textarea" },
            { key: "features", label: "Features", type: "textarea" },
            { key: "planImage", label: "Plan Image" },
            { key: "status", label: "Status", required: true, type: "select", options: ["Active", "Inactive"] },
          ]}
          searchableKeys={["id", "planName", "planType", "city"]}
          actions={["Active/Inactive", "Delete"]}
          remarkRequiredActions={["Delete"]}
        />
      )}
    </>
  );
}
