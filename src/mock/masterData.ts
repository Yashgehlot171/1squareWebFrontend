import { areas, cities } from "./locations";

export const masterData = [
  ...["Madhya Pradesh"].map((name, index) => ({ id: `STATE-${index + 1}`, masterType: "State Master", name, parent: "", status: "Active", description: "Enabled operating state" })),
  ...cities.map((name, index) => ({ id: `CITY-${index + 1}`, masterType: "City Master", name, parent: "Madhya Pradesh", status: "Active", description: "Serviceable city" })),
  ...areas.map((name, index) => ({ id: `AREA-${index + 1}`, masterType: "Area Master", name, parent: cities[index % cities.length], status: "Active", description: "Serviceable local area" })),
  ...["House", "Flat", "Plot", "Agriculture Land", "Commercial Plot", "Shop", "Office Space", "Commercial Building"].map((name, index) => ({ id: `PTYPE-${index + 1}`, masterType: "Property Type Master", name, parent: index < 2 ? "Residential" : "Commercial/Land", status: "Active", icon: "home", description: `${name} listing type` })),
  ...["Parking", "Garden", "Security", "Lift", "Club House", "Water Supply"].map((name, index) => ({ id: `AMN-${index + 1}`, masterType: "Amenities Master", name, parent: "House/Flat", status: "Active", icon: "check", description: `${name} amenity` })),
  ...["East", "West", "North", "South", "North-East", "South-West"].map((name, index) => ({ id: `DIR-${index + 1}`, masterType: "Direction Master", name, parent: "", status: "Active", description: "Facing direction" })),
  ...["Cement", "Steel", "Sand", "Bricks", "Aggregate", "Tiles", "Marble", "Granite", "Paint", "Electrical", "Plumbing", "Hardware"].map((name, index) => ({ id: `MAT-${index + 1}`, masterType: "Material Category Master", name, parent: "", status: "Active", icon: "inventory", description: `${name} material category` })),
  ...["Contractor", "Mistri", "Plumber", "Electrician", "Carpenter", "Painter", "Tiles Installer", "Marble Installer", "POP Worker", "Fabricator", "Labour Contractor"].map((name, index) => ({ id: `ROLE-${index + 1}`, masterType: "Service Role Master", name, parent: "", status: "Active", icon: "work", description: `${name} service role` })),
  { id: "BAN-1", masterType: "Banner Master", name: "Super Corridor Plots", parent: "Property", status: "Active", bannerImage: "super-corridor.jpg", redirectType: "Module", redirectModule: "Property", redirectId: "PROP-0003", displayOrder: 1, description: "Homepage banner" },
  { id: "CNT-1", masterType: "App Content Master", name: "About 1Square Property", parent: "About", status: "Active", pageType: "About", content: "Trusted property marketplace for Madhya Pradesh.", description: "App static content" },
  { id: "CON-1", masterType: "Contact Information Master", name: "1Square Property Support", parent: "", status: "Active", supportMobile: "9999999999", supportEmail: "support@1squareproperty.com", whatsappNumber: "9999999999", officeAddress: "Vijay Nagar, Indore", workingHours: "10 AM - 7 PM", description: "Primary support contact" },
];
