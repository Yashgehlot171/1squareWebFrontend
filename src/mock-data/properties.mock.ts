import type { PropertyRecord, VerificationRecord } from "../types";

export const propertiesMock: PropertyRecord[] = [
  { id: "prop_1001", title: "North city plot phase 2", type: "Plot", owner: "Karthik R", location: "Bengaluru", price: 8600000, area: "2400 sq ft", status: "Pending", createdDate: "2026-05-22" },
  { id: "prop_1002", title: "Green acres farm parcel", type: "Agricultural Land", owner: "Anita Joseph", location: "Mysuru", price: 14200000, area: "8.2 acres", status: "Approved", createdDate: "2026-04-18" },
  { id: "prop_1003", title: "Townhouse near ring road", type: "House", owner: "Madhav S", location: "Hyderabad", price: 12800000, area: "1860 sq ft", status: "Draft", createdDate: "2026-06-01" },
  { id: "prop_1004", title: "Commercial corner site", type: "Commercial", owner: "Global Retail LLP", location: "Pune", price: 32500000, area: "4200 sq ft", status: "Rejected", createdDate: "2026-05-29" },
  { id: "prop_1005", title: "Approved gated community plot", type: "Plot", owner: "Sowmya Rao", location: "Bengaluru", price: 9400000, area: "2600 sq ft", status: "Sold", createdDate: "2026-03-12" },
];

export const verificationMock: VerificationRecord[] = [
  { id: "ver_2001", propertyId: "prop_1001", ownerName: "Karthik R", documentType: "Sale Deed", documentStatus: "Under Review", assignedLegalMember: "Sonia Mehta", remarks: "Need tax receipt cross-check." },
  { id: "ver_2002", propertyId: "prop_1002", ownerName: "Anita Joseph", documentType: "Land Record", documentStatus: "Approved", assignedLegalMember: "Sonia Mehta", remarks: "Verified and cleared." },
  { id: "ver_2003", propertyId: "prop_1004", ownerName: "Global Retail LLP", documentType: "Mutation", documentStatus: "Rejected", assignedLegalMember: "Harish Menon", remarks: "Mismatch in ownership chain." },
];
