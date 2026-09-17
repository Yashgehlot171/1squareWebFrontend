import type { WizardStepConfig } from "../types";

export const constructionPlanWizardSteps: WizardStepConfig[] = [
  {
    key: "basic",
    label: "Basic Information",
    fields: [
      { key: "planName", label: "Plan Name", required: true },
      { key: "planCode", label: "Plan Code", required: true },
      { key: "pricePerSqFt", label: "Price Per Sq Ft", type: "number", required: true },
      { key: "shortDescription", label: "Short Description" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "thumbnailFileId", label: "Thumbnail", type: "image", uploadKind: "image" },
      { key: "brochureFileId", label: "Brochure", type: "file", uploadKind: "file" },
      { key: "status", label: "Status", type: "status" },
    ],
  },
  {
    key: "structure",
    label: "Structure",
    fields: ["Foundation Type", "Foundation Depth", "RCC Grade", "Steel Brand", "Steel Grade", "Steel Quantity", "Cement Brand", "Cement Grade", "Sand Quality", "Aggregate Size", "Brick Type", "External Wall Thickness", "Internal Wall Thickness", "Roof Slab Thickness", "Waterproofing Brand"].map((label) => ({ key: label.replace(/[^A-Za-z0-9]+/g, "_").toLowerCase(), label })),
  },
  {
    key: "flooring",
    label: "Flooring",
    fields: ["Living Room Tile", "Bedroom Tile", "Kitchen Tile", "Bathroom Tile", "Balcony Tile", "Parking Flooring", "Staircase Granite"].map((label) => ({ key: label.replace(/[^A-Za-z0-9]+/g, "_").toLowerCase(), label })),
  },
  {
    key: "doorsWindows",
    label: "Doors & Windows",
    fields: ["Main Door", "Main Door Frame", "Bedroom Door", "Bathroom Door", "Door Lock Brand", "Door Hardware", "Window Material", "Window Frame", "Glass Thickness", "Mosquito Mesh", "Grill Included"].map((label) => ({ key: label.replace(/[^A-Za-z0-9]+/g, "_").toLowerCase(), label })),
  },
  {
    key: "electrical",
    label: "Electrical",
    fields: ["Wire Brand", "Wire Type", "Switch Brand", "MCB Brand", "Distribution Board", "Light Points", "Fan Points", "AC Points", "TV Point", "Internet Point", "Geyser Point", "Solar Provision"].map((label) => ({ key: label.replace(/[^A-Za-z0-9]+/g, "_").toLowerCase(), label })),
  },
  {
    key: "plumbing",
    label: "Plumbing",
    fields: ["Pipe Brand", "Water Supply Pipe", "Drainage Pipe", "CP Fittings", "Sanitary Brand", "Wash Basin", "Kitchen Sink", "Water Tank Capacity"].map((label) => ({ key: label.replace(/[^A-Za-z0-9]+/g, "_").toLowerCase(), label })),
  },
  {
    key: "kitchenBathroom",
    label: "Kitchen & Bathroom",
    fields: ["Granite Brand", "Granite Thickness", "Kitchen Platform", "Kitchen Cabinets", "RO Point", "Chimney Provision", "Wall Tile Height", "Bathroom Wall Tiles", "Bathroom Floor Tiles", "Mirror", "Shower", "Health Faucet", "Soap Holder", "Towel Rod"].map((label) => ({ key: label.replace(/[^A-Za-z0-9]+/g, "_").toLowerCase(), label })),
  },
  {
    key: "painting",
    label: "Painting",
    fields: ["Interior Paint", "Exterior Paint", "Putty", "Primer", "Texture Paint", "Ceiling Paint"].map((label) => ({ key: label.replace(/[^A-Za-z0-9]+/g, "_").toLowerCase(), label })),
  },
  {
    key: "ceilingExterior",
    label: "Ceiling & Exterior",
    fields: ["Ceiling Height", "False Ceiling", "POP", "Gypsum", "Decorative Ceiling", "Compound Wall", "Main Gate", "Landscape", "Paving Block", "Rain Water Harvesting"].map((label) => ({ key: label.replace(/[^A-Za-z0-9]+/g, "_").toLowerCase(), label })),
  },
  {
    key: "smartSafety",
    label: "Smart Home & Safety",
    fields: ["Video Door Phone", "Smart Lock", "CCTV", "WiFi", "Home Automation", "EV Charging", "Solar System", "Fire Extinguisher", "Smoke Detector", "Lightning Protection", "Earth Pit"].map((label) => ({ key: label.replace(/[^A-Za-z0-9]+/g, "_").toLowerCase(), label })),
  },
  {
    key: "warrantyServices",
    label: "Warranty & Services",
    fields: ["Structural Warranty", "Waterproofing Warranty", "Electrical Warranty", "Plumbing Warranty", "Architectural Drawing", "Structural Drawing", "Electrical Drawing", "Plumbing Drawing", "3D Elevation", "Site Supervision", "Material Procurement", "Labour Included", "Cleaning Included"].map((label) => ({ key: label.replace(/[^A-Za-z0-9]+/g, "_").toLowerCase(), label })),
  },
  {
    key: "documentsGallery",
    label: "Documents & Gallery",
    fields: [
      { key: "brochurePdfFileId", label: "Brochure PDF", type: "file", uploadKind: "file" },
      { key: "specificationPdfFileId", label: "Specification PDF", type: "file", uploadKind: "file" },
      { key: "floorPlanPdfFileId", label: "Floor Plan PDF", type: "file", uploadKind: "file" },
      { key: "bannerImageFileId", label: "Banner Image", type: "image", uploadKind: "image" },
      { key: "galleryImageFileIds", label: "Gallery Images", type: "multifile", uploadKind: "image" },
      { key: "youtubeVideo", label: "YouTube Video", type: "url" },
      { key: "completionTime", label: "Completion Time" },
      { key: "materialGrade", label: "Material Grade" },
      { key: "labourQuality", label: "Labour Quality" },
      { key: "remarks", label: "Remarks", type: "textarea" },
      { key: "additionalNotes", label: "Additional Notes", type: "textarea" },
    ],
  },
];
