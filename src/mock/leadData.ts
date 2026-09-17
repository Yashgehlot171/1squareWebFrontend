import { areas, cities, date, mobile, names, pick } from "./locations";

const leadTypes = ["Buy", "Sell", "Property Add", "Property Interest", "Construction", "Supplier", "Service Provider", "General Login"];
const statuses = ["New", "Contacted", "Interested", "Not Interested", "Follow-up Required", "Converted", "Closed", "Invalid"];
const userTypes = ["Customer", "Broker", "Owner", "Supplier", "Service Provider"];

export const leadData = Array.from({ length: 64 }, (_, index) => ({
  id: `LEAD-${String(index + 1).padStart(4, "0")}`,
  userName: pick(names, index + 3),
  mobile: mobile(index + 201),
  userType: pick(userTypes, index),
  leadType: pick(leadTypes, index + 1),
  interestedProperty: index % 2 === 0 ? `PROP-${String((index % 56) + 1).padStart(4, "0")}` : "",
  propertyType: pick(["House", "Flat", "Plot", "Agriculture Land", "Shop"], index),
  city: pick(cities, index + 1),
  area: pick(areas, index + 4),
  budgetRange: pick(["15L-30L", "30L-50L", "50L-80L", "80L-1.5Cr", "1.5Cr+"], index),
  sourceScreen: pick(["Home", "Property Detail", "Construction Calculator", "Supplier Directory", "Login"], index),
  lastActivity: `${date(index)} 11:${String((index * 9) % 60).padStart(2, "0")} AM`,
  leadStatus: pick(statuses, index),
  assignedTo: pick(["Aarav Sharma", "Priya Mehta", "Nitin Bansal"], index),
  followUpDate: index % 4 === 0 ? date(index + 1) : "",
  lastRemark: pick(["Asked for site visit", "Budget mismatch", "Interested in Super Corridor", "Call not picked", "Converted to property visit"], index),
  createdDate: date(index),
  updatedDate: date(index + 2),
}));
