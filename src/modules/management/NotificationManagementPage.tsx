import { notificationData } from "../../mock/notificationData";
import { BusinessModulePage } from "../common/BusinessModulePage";

export function NotificationManagementPage() {
  return (
    <BusinessModulePage
      title="Notification Management"
      subtitle="Notification creation, targeting, send workflow, and deletion controls."
      rows={notificationData}
      columns={[
        { key: "id", label: "Notification ID" },
        { key: "title", label: "Title" },
        { key: "targetAudience", label: "Audience" },
        { key: "sentBy", label: "Sent By" },
        { key: "sentDate", label: "Sent Date" },
        { key: "status", label: "Status", status: true },
      ]}
      fields={[
        { key: "title", label: "Title", required: true },
        { key: "message", label: "Message", required: true, type: "textarea" },
        { key: "targetAudience", label: "Target Audience", required: true, type: "select", options: ["All Users", "Customers", "Brokers", "Selected Users"] },
        { key: "image", label: "Image" },
        { key: "status", label: "Status", type: "select", options: ["Draft", "Sent", "Scheduled"] },
      ]}
      searchableKeys={["id", "title", "message", "targetAudience", "sentBy"]}
      actions={["Send Notification", "Delete"]}
      remarkRequiredActions={["Delete"]}
    />
  );
}
