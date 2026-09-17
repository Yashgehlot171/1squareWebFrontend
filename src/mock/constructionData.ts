import { areas, cities, date, mobile, names, pick } from "./locations";

export const constructionPlans = [
  { id: "PLAN-001", planName: "Basic Plan", planType: "Budget", costPerSqFt: 1200, city: "Indore", shortDescription: "Essential construction with standard finish.", fullDescription: "RCC structure, basic flooring, standard electrical and plumbing.", features: "RCC frame, vitrified tiles, standard paint", planImage: "basic-plan.jpg", status: "Active" },
  { id: "PLAN-002", planName: "Standard Plan", planType: "Standard", costPerSqFt: 1500, city: "Bhopal", shortDescription: "Balanced plan for family homes.", fullDescription: "Good quality materials, modular wiring, branded fittings.", features: "Branded fittings, elevation, modular wiring", planImage: "standard-plan.jpg", status: "Active" },
  { id: "PLAN-003", planName: "Premium Plan", planType: "Premium", costPerSqFt: 1900, city: "Indore", shortDescription: "Premium finish with better elevation.", fullDescription: "Premium flooring, designer elevation, branded sanitary fittings.", features: "Premium tiles, designer elevation, false ceiling", planImage: "premium-plan.jpg", status: "Active" },
  { id: "PLAN-004", planName: "Luxury Plan", planType: "Luxury", costPerSqFt: 2500, city: "Ujjain", shortDescription: "Luxury villa quality execution.", fullDescription: "Luxury finish, curated elevation, premium fixtures and landscaping readiness.", features: "Italian marble, luxury fittings, smart wiring", planImage: "luxury-plan.jpg", status: "Inactive" },
];

export const constructionRequests = Array.from({ length: 28 }, (_, index) => ({
  id: `CONREQ-${String(index + 1).padStart(4, "0")}`,
  userName: pick(names, index + 1),
  mobile: mobile(index + 301),
  city: pick(cities, index),
  location: pick(areas, index + 2),
  plotSize: 900 + index * 75,
  selectedPlan: pick(constructionPlans, index).planName,
  budget: 1600000 + index * 145000,
  status: pick(["Pending", "Contacted", "In Discussion", "Converted", "Rejected", "Closed"], index),
  assignedTo: pick(["Aarav Sharma", "Priya Mehta", "Nitin Bansal"], index),
  remark: index % 6 === 4 ? "Customer budget is below selected plan." : "Follow-up scheduled with construction consultant.",
  createdDate: date(index + 1),
  followUpDate: index % 3 === 0 ? date(index + 2) : "",
}));
