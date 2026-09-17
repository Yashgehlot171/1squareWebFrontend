import { areas, cities, date, mobile, names, pick } from "./locations";

const propertyTypes = ["House", "Flat", "Plot", "Agriculture Land", "Commercial Plot", "Shop", "Office Space", "Commercial Building"];
const directions = ["East", "West", "North", "South", "North-East", "South-West"];
const statuses = ["Pending", "Under Review", "Approved", "Rejected", "Blocked"];
const amenities = ["Water", "Electricity", "Drainage", "Park", "School", "Hospital", "Security", "Lift", "Parking"];
const nearbyFacilities = ["Metro Station", "School", "Hospital", "Market", "Bus Stop", "Mall"];

export const propertyData = Array.from({ length: 56 }, (_, index) => {
  const propertyType = pick(propertyTypes, index);
  const isHome = propertyType === "House" || propertyType === "Flat";
  const isFarm = propertyType === "Agriculture Land";
  const isPlot = propertyType === "Plot";
  const isCommercial = ["Commercial Plot", "Shop", "Office Space", "Commercial Building"].includes(propertyType);
  const isLand = isPlot || isFarm || propertyType === "Commercial Plot";
  const city = pick(cities, index + 2);
  const area = pick(areas, index);
  const price = isFarm ? 2800000 + index * 210000 : 1800000 + index * 335000;
  const size = isFarm ? 2 + (index % 7) : 700 + index * 65;
  const sizeUnit = isFarm ? pick(["Acre", "Hectare", "Bigha"], index) : propertyType === "Plot" ? pick(["Square Feet", "Square Yard"], index) : "Square Feet";
  return {
    id: `PROP-${String(index + 1).padStart(4, "0")}`,
    title: `${isHome ? `${2 + (index % 4)} BHK` : ""} ${propertyType} in ${area}`.trim(),
    propertyCategory: isHome ? "Residential" : isFarm ? "Agriculture" : isCommercial ? "Commercial" : "Land",
    propertyType,
    listedBy: index % 3 === 0 ? "Broker" : "Owner",
    listedByUserType: index % 3 === 0 ? "Broker" : "Customer",
    ownerName: pick(names, index + 6),
    ownerMobile: mobile(index + 101),
    ownerEmail: `owner${index + 1}@mail.com`,
    brokerName: index % 3 === 0 ? `${pick(names, index + 9)} Realty` : "",
    brokerFirmName: index % 3 === 0 ? `${pick(["Prime Realty", "Malwa Property Hub", "Shree Estate", "Cityspace"], index)} ${city}` : "",
    brokerMobile: index % 3 === 0 ? mobile(index + 801) : "",
    brokerVerificationStatus: index % 3 === 0 ? pick(["Verified", "Pending", "Rejected"], index) : "",
    sellRentType: index % 4 === 0 ? "Rent" : "Sell",
    price,
    totalPrice: price,
    pricePerUnit: Math.round(price / Number(size)),
    maintenanceCharges: isHome ? 1500 + index * 100 : 0,
    negotiable: index % 2 === 0 ? "Yes" : "No",
    state: "Madhya Pradesh",
    city,
    area,
    address: `${45 + index}, ${area}, Near Ring Road, ${city}`,
    landmark: pick(["Near City Mall", "Opposite Petrol Pump", "Behind Main Market", "Near Ring Road"], index),
    latitude: (22.71 + index / 1000).toFixed(6),
    longitude: (75.85 + index / 1000).toFixed(6),
    mapLocation: `https://maps.google.com/?q=${22.71 + index / 1000},${75.85 + index / 1000}`,
    pincode: `4520${String(index % 10).padStart(2, "0")}`,
    size,
    sizeUnit,
    builtUpArea: isHome || isCommercial ? 650 + index * 44 : 0,
    carpetArea: isHome || isCommercial ? 560 + index * 38 : 0,
    plotSize: isPlot || isCommercial ? 900 + index * 50 : 0,
    landSize: isFarm ? size : 0,
    bhk: isHome ? `${1 + (index % 5)} BHK` : "",
    bedrooms: isHome ? 1 + (index % 5) : 0,
    bathrooms: isHome ? 1 + (index % 4) : 0,
    floorNumber: isHome || propertyType === "Shop" || propertyType === "Office Space" ? index % 12 : 0,
    totalFloors: isHome || propertyType === "Shop" || propertyType === "Office Space" ? 3 + (index % 12) : 0,
    furnishingStatus: isHome ? pick(["Unfurnished", "Semi Furnished", "Fully Furnished"], index) : "",
    readyToMove: isHome ? pick(["Ready To Move", "Under Construction"], index) : "",
    constructionStatus: isHome ? pick(["New Construction", "Resale", "Under Construction"], index) : "",
    parking: isHome || isCommercial ? pick(["Available", "Not Available"], index) : "",
    balcony: isHome ? `${index % 3}` : "",
    landUnit: isFarm ? pick(["Acre", "Hectare", "Bigha"], index) : "",
    roadAccess: isLand ? pick(["Yes", "No"], index) : "",
    roadWidth: isLand || isCommercial ? `${pick([20, 30, 40, 60], index)} Feet` : "",
    roadType: isLand ? pick(["Cement Road", "Main Road", "Kachcha Road", "Colony Road"], index) : "",
    boundaryWall: isPlot ? pick(["Yes", "No"], index) : "",
    cornerPlot: isPlot ? pick(["Yes", "No"], index + 1) : "",
    waterAvailability: isFarm ? pick(["Canal", "Borewell", "Well", "Seasonal"], index) : "",
    electricityAvailability: isFarm ? pick(["Available", "Not Available"], index) : "",
    soilType: isFarm ? pick(["Black Cotton", "Red Soil", "Alluvial", "Mixed"], index) : "",
    distanceFromMainRoad: isFarm ? `${1 + (index % 8)} km` : "",
    commercialType: isCommercial ? propertyType : "",
    frontage: isCommercial ? `${18 + (index % 40)} Feet` : "",
    businessSuitableFor: isCommercial ? pick(["Retail Store", "Clinic", "Office", "Warehouse", "Restaurant"], index) : "",
    washroomAvailable: isCommercial ? pick(["Yes", "No"], index) : "",
    direction: pick(directions, index),
    status: pick(statuses, index),
    createdDate: date(index + 1),
    updatedDate: date(index + 4),
    description: `Well located ${propertyType.toLowerCase()} in ${area}, ${city}, suitable for ${isHome ? "family living" : isFarm ? "farming and investment" : isCommercial ? "business use" : "investment"}.`,
    amenities: amenities.slice(0, 4 + (index % 5)),
    nearbyFacilities: nearbyFacilities.slice(0, 3 + (index % 3)),
    additionalNotes: index % 4 === 0 ? "Owner is open for quick site visit with prior appointment." : "All details are available for admin review.",
    images: [`property-${(index % 4) + 1}.jpg`, `property-${((index + 1) % 4) + 1}.jpg`, `property-${((index + 2) % 4) + 1}.jpg`],
    videos: index % 5 === 0 ? [`walkthrough-${index + 1}.mp4`] : [],
    documents: ["property-document.pdf", "registry-document.pdf", "id-proof.pdf"],
    ownershipDocument: "ownership-document.pdf",
    registryDocument: "registry-document.pdf",
    adminRemark: index % 5 === 0 ? "Price and ownership documents need review." : "Ready for admin workflow.",
    approvalRejectionRemark: index % 5 === 0 ? "Please verify registry document before approval." : "No escalation remark.",
    lastActionBy: pick(["Super Admin", "Aarav Sharma", "Priya Mehta"], index),
    lastActionDate: date(index + 5),
    statusHistory: [
      { label: "Draft Created", date: date(index + 1), by: "Mobile User" },
      { label: "Submitted for Review", date: date(index + 2), by: pick(names, index + 6) },
      { label: pick(statuses, index), date: date(index + 5), by: pick(["Super Admin", "Aarav Sharma"], index) },
    ],
    remarkHistory: [
      { remark: "Property submitted from mobile app.", date: date(index + 1), by: "Mobile User" },
      { remark: index % 5 === 0 ? "Ownership document needs manual verification." : "Initial admin check completed.", date: date(index + 4), by: "Admin Team" },
    ],
  };
});
