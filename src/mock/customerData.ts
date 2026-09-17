import { areas, cities, date, mobile, names, pick } from "./locations";

export interface CustomerData {
  id: string;
  name: string;
  mobile: string;
  email: string;
  state: string;
  city: string;
  area: string;
  totalProperties: number;
  totalLeads: number;
  savedProperties: number;
  status: "Active" | "Blocked";
  registeredDate: string;
  lastLogin: string;
}

export const customerData: CustomerData[] = Array.from({ length: 34 }, (_, index) => ({
  id: `CUST-${String(index + 1).padStart(4, "0")}`,
  name: pick(names, index),
  mobile: mobile(index + 1),
  email: `${pick(names, index).toLowerCase().replace(" ", ".")}@mail.com`,
  state: "Madhya Pradesh",
  city: pick(cities, index),
  area: pick(areas, index + 2),
  totalProperties: (index * 3) % 8,
  totalLeads: (index * 5) % 13,
  savedProperties: (index * 2) % 10,
  status: index % 11 === 0 ? "Blocked" : "Active",
  registeredDate: date(index),
  lastLogin: `${date(index + 2)} 10:${String((index * 7) % 60).padStart(2, "0")} AM`,
}));
