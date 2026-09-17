import type { DashboardConfig, LegalCaseRecord } from "../types";

export const legalDashboardMock: DashboardConfig = {
  metrics: [
    { label: "Pending Verification", value: "26" },
    { label: "Approved Verification", value: "142" },
    { label: "Rejected Verification", value: "11" },
    { label: "Documents Pending", value: "9" },
  ],
  recentActivities: ["Case lc_6003 moved to approved", "Additional document request sent for lc_6001", "Remarks updated on lc_6004"],
};

export const legalCasesMock: LegalCaseRecord[] = [
  { id: "lc_6001", propertyId: "prop_1001", owner: "Karthik R", documentType: "Sale Deed", status: "Pending", assignedTo: "Sonia Mehta", remarks: "Need updated encumbrance certificate." },
  { id: "lc_6002", propertyId: "prop_1002", owner: "Anita Joseph", documentType: "Land Record", status: "Approved", assignedTo: "Harish Menon", remarks: "All documents validated." },
  { id: "lc_6003", propertyId: "prop_1004", owner: "Global Retail LLP", documentType: "Mutation", status: "Rejected", assignedTo: "Sonia Mehta", remarks: "Entity documentation mismatch." },
  { id: "lc_6004", propertyId: "prop_1003", owner: "Madhav S", documentType: "Tax Receipt", status: "Need More Documents", assignedTo: "Harish Menon", remarks: "Previous year tax receipt missing." },
];
