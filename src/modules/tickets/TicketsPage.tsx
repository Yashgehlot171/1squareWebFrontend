import { supportTicketData } from "../../mock/supportTicketData";
import { BusinessModulePage } from "../common/BusinessModulePage";

export function TicketsPage() {
  return (
    <BusinessModulePage
      title="Support Ticket Management"
      subtitle="25+ support tickets with reply, status change, close validation, and assignment workflow."
      rows={supportTicketData}
      columns={[
        { key: "id", label: "Ticket ID" },
        { key: "userName", label: "User Name" },
        { key: "mobile", label: "Mobile" },
        { key: "userType", label: "User Type" },
        { key: "subject", label: "Subject" },
        { key: "category", label: "Category" },
        { key: "status", label: "Status", status: true },
        { key: "assignedTo", label: "Assigned To" },
        { key: "createdDate", label: "Created Date" },
      ]}
      fields={[
        { key: "userName", label: "User Name", required: true },
        { key: "mobile", label: "Mobile", required: true, type: "mobile" },
        { key: "userType", label: "User Type", required: true, type: "select", options: ["Customer", "Broker", "Owner", "Supplier", "Service Provider"] },
        { key: "subject", label: "Subject", required: true },
        { key: "category", label: "Category", required: true },
        { key: "message", label: "Message", required: true, type: "textarea" },
        { key: "status", label: "Status", required: true, type: "select", options: ["Open", "In Progress", "Resolved", "Closed"] },
        { key: "assignedTo", label: "Assigned To" },
        { key: "lastReply", label: "Last Reply", type: "textarea", validateWhen: (values) => values.status === "Closed" },
      ]}
      searchableKeys={["id", "userName", "mobile", "userType", "subject", "category", "assignedTo"]}
      actions={["Reply", "Change Status", "Close Ticket"]}
      remarkRequiredActions={["Close Ticket"]}
    />
  );
}
