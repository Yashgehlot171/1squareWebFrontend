import { areas, cities, mobile, names, pick } from "./locations";

const roles = ["Contractor", "Mistri", "Plumber", "Electrician", "Carpenter", "Painter", "Tiles Installer", "Marble Installer", "POP Worker", "Fabricator", "Labour Contractor"];

export const serviceProviderData = Array.from({ length: 44 }, (_, index) => ({
  id: `HSP-${String(index + 1).padStart(4, "0")}`,
  providerName: pick(names, index + 9),
  serviceRole: pick(roles, index),
  mobile: mobile(index + 601),
  whatsappNumber: mobile(index + 701),
  alternateMobile: index % 4 === 0 ? mobile(index + 801) : "",
  state: "Madhya Pradesh",
  city: pick(cities, index + 2),
  area: pick(areas, index + 3),
  address: `${32 + index}, ${pick(areas, index + 1)}, ${pick(cities, index + 2)}`,
  experience: `${1 + (index % 18)} Years`,
  chargesType: pick(["Per Day", "Per SqFt", "Per Visit", "Project Based"], index),
  rating: Number((3.1 + (index % 19) / 10).toFixed(1)),
  verifiedStatus: pick(["Pending", "Verified", "Rejected"], index),
  providerImage: `provider-${index + 1}.jpg`,
  description: `${pick(roles, index)} available for home and commercial service work.`,
  status: index % 10 === 0 ? "Inactive" : "Active",
}));
