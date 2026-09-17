const today = "2026-06-26";

export const managementRecords = {
  leads: [
    { id: "lead_001", name: "Site visit request", owner: "Priya Mehta", status: "In Progress", category: "Buy", updatedAt: today },
    { id: "lead_002", name: "Commercial plot enquiry", owner: "Aarav Sharma", status: "Pending", category: "Commercial", updatedAt: today },
  ],
  customers: [
    { id: "cust_001", name: "Rohit Verma", owner: "Priya Mehta", status: "Active", category: "Buyer", updatedAt: today },
    { id: "cust_002", name: "Meenal Jain", owner: "Aarav Sharma", status: "Blocked", category: "Seller", updatedAt: today },
  ],
  brokers: [
    { id: "brk_001", name: "Cityspace Brokers", owner: "Aarav Sharma", status: "Pending", category: "Residential", updatedAt: today },
    { id: "brk_002", name: "Prime Land Partners", owner: "Super Admin", status: "Approved", category: "Land", updatedAt: today },
  ],
  construction: [
    { id: "con_001", name: "Villa construction package", owner: "Aarav Sharma", status: "Active", category: "Package", updatedAt: today },
    { id: "con_002", name: "Cost estimation request", owner: "Priya Mehta", status: "Pending", category: "Quotation", updatedAt: today },
  ],
  suppliers: [
    { id: "sup_001", name: "Shree Cement Traders", owner: "Aarav Sharma", status: "Active", category: "Cement", updatedAt: today },
    { id: "sup_002", name: "Rajasthan Steel Mart", owner: "Super Admin", status: "Pending", category: "Steel", updatedAt: today },
  ],
  serviceProviders: [
    { id: "svc_001", name: "HomeCare Plumbing", owner: "Priya Mehta", status: "Active", category: "Plumbing", updatedAt: today },
    { id: "svc_002", name: "Secure Electric Works", owner: "Aarav Sharma", status: "Pending", category: "Electrical", updatedAt: today },
  ],
  masters: [
    { id: "mst_001", name: "Property Type", owner: "Super Admin", status: "Active", category: "Lookup", updatedAt: today },
    { id: "mst_002", name: "Lead Source", owner: "Super Admin", status: "Active", category: "Lookup", updatedAt: today },
  ],
  notifications: [
    { id: "not_001", name: "Broker verification reminder", owner: "Aarav Sharma", status: "Active", category: "Push", updatedAt: today },
    { id: "not_002", name: "Lead follow-up alert", owner: "Priya Mehta", status: "Pending", category: "Email", updatedAt: today },
  ],
  employees: [
    { id: "emp_001", name: "Aarav Sharma", owner: "Super Admin", status: "Active", category: "Admin", updatedAt: today },
    { id: "emp_002", name: "Priya Mehta", owner: "Super Admin", status: "Active", category: "Support Team", updatedAt: today },
  ],
};
