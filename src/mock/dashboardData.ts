import { brokerData } from "./brokerData";
import { constructionRequests } from "./constructionData";
import { customerData } from "./customerData";
import { leadData } from "./leadData";
import { propertyData } from "./propertyData";
import { serviceProviderData } from "./serviceProviderData";
import { supplierData } from "./supplierData";
import { supportTicketData } from "./supportTicketData";
import { auditLogData } from "./auditLogData";

export const dashboardStats = [
  { label: "Total Customers", value: customerData.length },
  { label: "Active Customers", value: customerData.filter((item) => item.status === "Active").length },
  { label: "Blocked Customers", value: customerData.filter((item) => item.status === "Blocked").length },
  { label: "Total Brokers", value: brokerData.length },
  { label: "Pending Brokers", value: brokerData.filter((item) => item.verificationStatus === "Pending").length },
  { label: "Verified Brokers", value: brokerData.filter((item) => item.verificationStatus === "Verified").length },
  { label: "Rejected Brokers", value: brokerData.filter((item) => item.verificationStatus === "Rejected").length },
  { label: "Total Properties", value: propertyData.length },
  { label: "Pending Properties", value: propertyData.filter((item) => item.status === "Pending").length },
  { label: "Under Review Properties", value: propertyData.filter((item) => item.status === "Under Review").length },
  { label: "Approved Properties", value: propertyData.filter((item) => item.status === "Approved").length },
  { label: "Rejected Properties", value: propertyData.filter((item) => item.status === "Rejected").length },
  { label: "Blocked Properties", value: propertyData.filter((item) => item.status === "Blocked").length },
  { label: "Total Leads", value: leadData.length },
  { label: "New Leads", value: leadData.filter((item) => item.leadStatus === "New").length },
  { label: "Contacted Leads", value: leadData.filter((item) => item.leadStatus === "Contacted").length },
  { label: "Follow-up Today", value: leadData.filter((item) => item.followUpDate === "26-06-2026").length },
  { label: "Pending Follow-ups", value: leadData.filter((item) => item.leadStatus === "Follow-up Required").length },
  { label: "Converted Leads", value: leadData.filter((item) => item.leadStatus === "Converted").length },
  { label: "Construction Requests", value: constructionRequests.length },
  { label: "Material Suppliers", value: supplierData.length },
  { label: "Prime Suppliers", value: supplierData.filter((item) => item.primeSupplier === "Yes").length },
  { label: "Home Service Providers", value: serviceProviderData.length },
  { label: "Verified Providers", value: serviceProviderData.filter((item) => item.verifiedStatus === "Verified").length },
  { label: "Support Tickets", value: supportTicketData.length },
];

export const dashboardLists = {
  recentLeads: leadData.slice(0, 6),
  recentProperties: propertyData.slice(0, 6),
  pendingPropertyApprovals: propertyData.filter((item) => item.status === "Pending").slice(0, 6),
  pendingBrokerApprovals: brokerData.filter((item) => item.verificationStatus === "Pending").slice(0, 6),
  todayFollowUps: leadData.filter((item) => item.followUpDate).slice(0, 6),
  recentSupportTickets: supportTicketData.slice(0, 6),
  recentAuditActivities: auditLogData.slice(0, 6),
};
