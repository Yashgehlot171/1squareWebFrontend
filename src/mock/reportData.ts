import { brokerData } from "./brokerData";
import { constructionRequests } from "./constructionData";
import { customerData } from "./customerData";
import { leadData } from "./leadData";
import { propertyData } from "./propertyData";
import { serviceProviderData } from "./serviceProviderData";
import { supplierData } from "./supplierData";
import { supportTicketData } from "./supportTicketData";

export const reportData = [
  { id: "REP-001", name: "Customer Report", category: "Customer", status: "Ready", city: "Indore", recordCount: customerData.length, updatedAt: "26-06-2026" },
  { id: "REP-002", name: "Broker Report", category: "Broker", status: "Ready", city: "Bhopal", recordCount: brokerData.length, updatedAt: "26-06-2026" },
  { id: "REP-003", name: "Property Report", category: "Property", status: "Ready", city: "Ujjain", recordCount: propertyData.length, updatedAt: "26-06-2026" },
  { id: "REP-004", name: "Lead Report", category: "Lead", status: "Ready", city: "Dewas", recordCount: leadData.length, updatedAt: "26-06-2026" },
  { id: "REP-005", name: "Construction Request Report", category: "Construction", status: "Ready", city: "Indore", recordCount: constructionRequests.length, updatedAt: "26-06-2026" },
  { id: "REP-006", name: "Supplier Report", category: "Supplier", status: "Ready", city: "Pithampur", recordCount: supplierData.length, updatedAt: "26-06-2026" },
  { id: "REP-007", name: "Service Provider Report", category: "Service Provider", status: "Ready", city: "Rau", recordCount: serviceProviderData.length, updatedAt: "26-06-2026" },
  { id: "REP-008", name: "Support Ticket Report", category: "Support Ticket", status: "Ready", city: "Indore", recordCount: supportTicketData.length, updatedAt: "26-06-2026" },
];
