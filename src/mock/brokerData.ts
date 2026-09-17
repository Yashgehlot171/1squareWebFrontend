import { areas, cities, date, mobile, names, pick } from "./locations";

const firms = ["Shree Realty", "MP Homes", "Prime Estate", "Cityspace Brokers", "Landmark Deals", "Aakar Properties"];

export const brokerData = Array.from({ length: 28 }, (_, index) => ({
  id: `BRK-${String(index + 1).padStart(4, "0")}`,
  brokerName: pick(names, index + 4),
  firmName: `${pick(firms, index)} ${pick(cities, index)}`,
  mobile: mobile(index + 41),
  email: `broker${index + 1}@1squareproperty.com`,
  state: "Madhya Pradesh",
  city: pick(cities, index + 1),
  officeAddress: `${12 + index}, ${pick(areas, index)}, ${pick(cities, index + 1)}`,
  experience: `${2 + (index % 14)} Years`,
  reraNumber: `MP-RERA-BRK-${2020 + (index % 6)}-${1000 + index}`,
  gstNumber: `23ABCDE${1000 + index}F1Z${index % 9}`,
  verificationStatus: pick(["Pending", "Verified", "Rejected"], index),
  totalProperties: 5 + ((index * 7) % 40),
  rating: Number((3.2 + (index % 18) / 10).toFixed(1)),
  status: index % 13 === 0 ? "Blocked" : "Active",
  createdDate: date(index + 3),
  remark: index % 3 === 0 ? "KYC documents pending verification." : "Broker profile looks complete.",
}));
