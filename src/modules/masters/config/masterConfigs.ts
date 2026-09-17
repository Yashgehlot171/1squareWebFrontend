import type { MasterConfig, MasterRecord } from "../types";

const now = "2026-07-19";

const withBase = (id: string, status = "Active") => ({ id, status, createdDate: now });

export const masterConfigs: MasterConfig[] = [
  {
    key: "state",
    title: "State",
    searchKeys: ["stateName"],
    fields: [
      { key: "stateName", label: "State Name", required: true },
      { key: "status", label: "Status", type: "status" },
    ],
    columns: [
      { key: "stateName", label: "State Name", sortable: true },
      { key: "status", label: "Status", sortable: true },
      { key: "createdDate", label: "Created Date", sortable: true },
    ],
    initialRows: [{ ...withBase("STATE-1"), stateName: "Madhya Pradesh" }],
  },
  {
    key: "city",
    title: "City",
    searchKeys: ["cityName", "state"],
    fields: [
      { key: "state", label: "State", type: "select", required: true, options: (records) => records.state?.map((row) => String(row.stateName)) ?? [] },
      { key: "cityName", label: "City Name", required: true },
      { key: "status", label: "Status", type: "status" },
    ],
    columns: [
      { key: "cityName", label: "City Name", sortable: true },
      { key: "state", label: "State", sortable: true },
      { key: "status", label: "Status", sortable: true },
    ],
    filters: [{ key: "state", label: "State", options: (records) => records.state?.map((row) => String(row.stateName)) ?? [] }],
    initialRows: [
      { ...withBase("CITY-1"), cityName: "Indore", state: "Madhya Pradesh" },
      { ...withBase("CITY-2"), cityName: "Bhopal", state: "Madhya Pradesh" },
      { ...withBase("CITY-3"), cityName: "Ujjain", state: "Madhya Pradesh" },
    ],
  },
  {
    key: "area",
    title: "Area",
    searchKeys: ["areaName", "city"],
    fields: [
      { key: "city", label: "City", type: "select", required: true, options: (records) => records.city?.map((row) => String(row.cityName)) ?? [] },
      { key: "areaName", label: "Area Name", required: true },
      { key: "status", label: "Status", type: "status" },
    ],
    columns: [
      { key: "areaName", label: "Area Name", sortable: true },
      { key: "city", label: "City", sortable: true },
      { key: "status", label: "Status", sortable: true },
    ],
    filters: [{ key: "city", label: "City", options: (records) => records.city?.map((row) => String(row.cityName)) ?? [] }],
    initialRows: [
      { ...withBase("AREA-1"), areaName: "Vijay Nagar", city: "Indore" },
      { ...withBase("AREA-2"), areaName: "Super Corridor", city: "Indore" },
    ],
  },
  {
    key: "propertyType",
    title: "Property Type",
    searchKeys: ["propertyTypeName"],
    fields: [
      { key: "propertyTypeName", label: "Property Type Name", required: true },
      { key: "iconFileId", label: "Icon", type: "image", uploadKind: "image" },
      { key: "status", label: "Status", type: "status" },
    ],
    columns: [
      { key: "propertyTypeName", label: "Property Type Name", sortable: true },
      { key: "iconFileId", label: "Icon File ID" },
      { key: "status", label: "Status", sortable: true },
    ],
    initialRows: ["Apartment", "Flat", "Villa", "Plot", "Office", "Commercial Property", "Agricultural Land", "Shop", "Warehouse"].map((propertyTypeName, index) => ({
      ...withBase(`PTYPE-${index + 1}`),
      propertyTypeName,
      iconFileId: "",
    })),
  },
  {
    key: "propertyCategory",
    title: "Property Category",
    searchKeys: ["propertyCategoryName"],
    fields: [
      { key: "propertyCategoryName", label: "Property Category Name", required: true },
      { key: "status", label: "Status", type: "status" },
    ],
    columns: [
      { key: "propertyCategoryName", label: "Property Category", sortable: true },
      { key: "status", label: "Status", sortable: true },
    ],
    initialRows: ["Residential", "Commercial", "Land"].map((propertyCategoryName, index) => ({ ...withBase(`PCAT-${index + 1}`), propertyCategoryName })),
  },
  {
    key: "propertyStatus",
    title: "Property Status",
    searchKeys: ["propertyStatusName"],
    fields: [
      { key: "propertyStatusName", label: "Property Status Name", required: true },
      { key: "status", label: "Status", type: "status" },
    ],
    columns: [
      { key: "propertyStatusName", label: "Property Status", sortable: true },
      { key: "status", label: "Status", sortable: true },
    ],
    initialRows: ["Draft", "Pending", "Approved", "Rejected", "Sold"].map((propertyStatusName, index) => ({ ...withBase(`PSTATUS-${index + 1}`), propertyStatusName })),
  },
  {
    key: "amenities",
    title: "Amenities",
    searchKeys: ["amenityName"],
    fields: [
      { key: "amenityName", label: "Amenity Name", required: true },
      { key: "iconFileId", label: "Icon", type: "image", uploadKind: "image" },
      { key: "status", label: "Status", type: "status" },
    ],
    columns: [
      { key: "amenityName", label: "Amenity", sortable: true },
      { key: "iconFileId", label: "Icon File ID" },
      { key: "status", label: "Status", sortable: true },
    ],
    initialRows: ["Parking", "Garden", "Security", "Lift", "Club House", "Water Supply"].map((amenityName, index) => ({ ...withBase(`AMN-${index + 1}`), amenityName, iconFileId: "" })),
  },
  {
    key: "banks",
    title: "Banks",
    searchKeys: ["bankName"],
    fields: [
      { key: "bankName", label: "Bank Name", required: true },
      { key: "status", label: "Status", type: "status" },
    ],
    columns: [
      { key: "bankName", label: "Bank Name", sortable: true },
      { key: "status", label: "Status", sortable: true },
    ],
    initialRows: ["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank"].map((bankName, index) => ({ ...withBase(`BANK-${index + 1}`), bankName })),
  },
  {
    key: "loanTypes",
    title: "Loan Types",
    searchKeys: ["loanTypeName"],
    fields: [
      { key: "loanTypeName", label: "Loan Type Name", required: true },
      { key: "status", label: "Status", type: "status" },
    ],
    columns: [
      { key: "loanTypeName", label: "Loan Type", sortable: true },
      { key: "status", label: "Status", sortable: true },
    ],
    initialRows: ["Home Loan", "Plot Loan", "Construction Loan", "Commercial Property Loan"].map((loanTypeName, index) => ({ ...withBase(`LOAN-${index + 1}`), loanTypeName })),
  },
  {
    key: "banner",
    title: "Banner",
    searchKeys: ["bannerTitle", "bannerType"],
    fields: [
      { key: "bannerImageFileId", label: "Banner Image", type: "image", uploadKind: "image" },
      { key: "bannerTitle", label: "Banner Title", required: true },
      { key: "bannerType", label: "Banner Type", type: "select", options: ["Home", "Property", "Construction", "Offer"] },
      { key: "redirectType", label: "Redirect Type", type: "select", options: ["None", "Module", "Property", "URL"] },
      { key: "redirectValue", label: "Redirect Value" },
      { key: "displayOrder", label: "Display Order", type: "number" },
      { key: "status", label: "Status", type: "status" },
    ],
    columns: [
      { key: "bannerTitle", label: "Banner Title", sortable: true },
      { key: "bannerType", label: "Type", sortable: true },
      { key: "redirectType", label: "Redirect" },
      { key: "displayOrder", label: "Order", sortable: true },
      { key: "status", label: "Status", sortable: true },
    ],
    initialRows: [{ ...withBase("BAN-1"), bannerTitle: "Super Corridor Plots", bannerType: "Property", redirectType: "Module", redirectValue: "Property", displayOrder: 1, bannerImageFileId: "" }],
  },
  {
    key: "constructionPlan",
    title: "Construction Plan",
    searchKeys: ["planName", "planCode", "badge"],
    fullPageCreatePath: "/masters/construction-plans/new",
    fields: [],
    columns: [
      { key: "planName", label: "Plan Name", sortable: true },
      { key: "planCode", label: "Code", sortable: true },
      { key: "pricePerSqFt", label: "Price / Sq.Ft", sortable: true },
      { key: "status", label: "Status", sortable: true },
    ],
    initialRows: [
      { ...withBase("CP-1", "Published"), planName: "Basic", planCode: "BASIC", pricePerSqFt: 1500, badge: "" },
      { ...withBase("CP-2", "Published"), planName: "Premium", planCode: "PREMIUM", pricePerSqFt: 2200, badge: "Recommended" },
    ] satisfies MasterRecord[],
  },
];

export const initialMasterRecords = masterConfigs.reduce<Record<string, MasterRecord[]>>((acc, config) => {
  acc[config.key] = config.initialRows;
  return acc;
}, {});
