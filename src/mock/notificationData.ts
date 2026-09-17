import { date, pick } from "./locations";

export const notificationData = Array.from({ length: 18 }, (_, index) => ({
  id: `NOTIF-${String(index + 1).padStart(4, "0")}`,
  title: pick(["New verified property", "Broker KYC pending", "Construction plan offer", "Follow-up reminder", "Support ticket update"], index),
  message: pick(["A new approved property is available in your preferred city.", "Please complete pending verification documents.", "Premium construction plan has updated rates.", "Your scheduled follow-up is due today.", "Your support ticket has a new reply."], index),
  targetAudience: pick(["All Users", "Customers", "Brokers", "Selected Users"], index),
  image: index % 3 === 0 ? `notification-${index + 1}.jpg` : "",
  sentBy: pick(["Super Admin", "Aarav Sharma", "Priya Mehta"], index),
  sentDate: date(index + 1),
  status: pick(["Draft", "Sent", "Scheduled"], index),
}));
