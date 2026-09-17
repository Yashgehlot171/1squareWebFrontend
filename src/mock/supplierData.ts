import { areas, cities, mobile, names, pick } from "./locations";

const categories = ["Cement", "Steel", "Sand", "Bricks", "Aggregate", "Tiles", "Marble", "Granite", "Paint", "Electrical", "Plumbing", "Hardware"];
const businesses = ["Shree Traders", "Mahakal Suppliers", "Narmada Build Mart", "Prime Materials", "Malwa Hardware", "City Construction Store"];

export const supplierData = Array.from({ length: 42 }, (_, index) => ({
  id: `SUP-${String(index + 1).padStart(4, "0")}`,
  supplierName: pick(names, index + 7),
  businessName: `${pick(businesses, index)} ${pick(categories, index)}`,
  mobile: mobile(index + 401),
  whatsappNumber: mobile(index + 501),
  email: `supplier${index + 1}@1squareproperty.com`,
  state: "Madhya Pradesh",
  city: pick(cities, index),
  area: pick(areas, index + 1),
  address: `${20 + index}, ${pick(areas, index)}, ${pick(cities, index)}`,
  materialCategory: pick(categories, index),
  rating: Number((3 + (index % 21) / 10).toFixed(1)),
  primeSupplier: index % 5 === 0 ? "Yes" : "No",
  supplierImage: `supplier-${index + 1}.jpg`,
  description: `Reliable ${pick(categories, index).toLowerCase()} supplier for residential and commercial projects.`,
  status: index % 9 === 0 ? "Inactive" : "Active",
}));
