import { date, names, pick } from "./locations";

const actions = ["Login", "Logout", "Create", "Update", "Delete", "Approve", "Reject", "Block", "Status Change", "Assign Lead"];
const modules = ["Customer", "Broker", "Property", "Lead", "Construction", "Supplier", "Service Provider", "Support Ticket"];

export const auditLogData = Array.from({ length: 46 }, (_, index) => ({
  id: `LOG-${String(index + 1).padStart(5, "0")}`,
  userName: pick(names, index),
  role: pick(["Super Admin", "Admin", "Support Team"], index),
  module: pick(modules, index + 1),
  action: pick(actions, index),
  oldValue: index % 2 === 0 ? "Pending" : "Active",
  newValue: index % 2 === 0 ? "Approved" : "Updated",
  ipAddress: `103.21.${40 + (index % 50)}.${10 + index}`,
  dateTime: `${date(index)} 14:${String((index * 11) % 60).padStart(2, "0")}`,
}));
