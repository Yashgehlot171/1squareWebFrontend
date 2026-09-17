import { date, mobile, names, pick } from "./locations";

export const supportTicketData = Array.from({ length: 27 }, (_, index) => ({
  id: `TICK-${String(index + 1).padStart(4, "0")}`,
  userName: pick(names, index + 2),
  mobile: mobile(index + 901),
  userType: pick(["Customer", "Broker", "Owner", "Supplier", "Service Provider"], index),
  subject: pick(["Unable to contact owner", "Broker verification delay", "Property price mismatch", "Construction request callback", "App login issue"], index),
  category: pick(["Property", "Broker", "Lead", "Construction", "Account"], index),
  message: "Customer needs admin support for this operational request.",
  status: pick(["Open", "In Progress", "Resolved", "Closed"], index),
  assignedTo: pick(["Priya Mehta", "Aarav Sharma", "Nitin Bansal"], index),
  createdDate: date(index),
  lastReply: pick(["We are checking this with operations.", "Ticket assigned to support team.", "Customer informed on call.", "Awaiting customer confirmation."], index),
}));
