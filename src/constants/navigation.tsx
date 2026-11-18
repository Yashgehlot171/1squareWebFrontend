import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";
import ViewCarouselRoundedIcon from "@mui/icons-material/ViewCarouselRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import EngineeringRoundedIcon from "@mui/icons-material/EngineeringRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import RequestQuoteRoundedIcon from "@mui/icons-material/RequestQuoteRounded";
import ShoppingCartCheckoutRoundedIcon from "@mui/icons-material/ShoppingCartCheckoutRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import HandshakeRoundedIcon from "@mui/icons-material/HandshakeRounded";
import HomeRepairServiceRoundedIcon from "@mui/icons-material/HomeRepairServiceRounded";
import HomeWorkRoundedIcon from "@mui/icons-material/HomeWorkRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import type { SidebarItem } from "../types";

export const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", path: "/dashboard", permission: "DASHBOARD_VIEW", icon: <DashboardRoundedIcon fontSize="small" /> },
  { label: "Lead Management", path: "/leads", permission: "LEAD_VIEW", icon: <AssignmentRoundedIcon fontSize="small" /> },
  { label: "Customer Management", path: "/customers", permission: "USER_VIEW", icon: <GroupsRoundedIcon fontSize="small" /> },
  { label: "Broker Management", path: "/brokers", permission: "USER_VIEW", icon: <HandshakeRoundedIcon fontSize="small" /> },
  { label: "Property Management", path: "/properties", permission: "PROPERTY_VIEW", icon: <HomeWorkRoundedIcon fontSize="small" /> },
  { label: "Buyer Lead Purchases", path: "/property-lead-purchases", permission: "PROPERTY_VIEW", icon: <ShoppingCartCheckoutRoundedIcon fontSize="small" /> },
  { label: "Construction Management", path: "/construction", permission: "CONSTRUCTION_VIEW", icon: <ConstructionRoundedIcon fontSize="small" /> },
  { label: "Construction Builders", path: "/construction/builders", permission: "CONSTRUCTION_VIEW", icon: <EngineeringRoundedIcon fontSize="small" /> },
  { label: "Plan Approvals", path: "/construction/plan-approvals", permission: "CONSTRUCTION_VIEW", icon: <FactCheckRoundedIcon fontSize="small" /> },
  { label: "Construction RFQs", path: "/construction/rfqs", permission: "CONSTRUCTION_VIEW", icon: <RequestQuoteRoundedIcon fontSize="small" /> },
  { label: "Construction Projects", path: "/construction/projects", permission: "CONSTRUCTION_VIEW", icon: <DescriptionRoundedIcon fontSize="small" /> },
  { label: "Construction Revenue", path: "/construction/revenue", permission: "CONSTRUCTION_VIEW", icon: <PaymentsRoundedIcon fontSize="small" /> },
  { label: "Material Suppliers", path: "/material-suppliers", permission: "SUPPLIER_VIEW", icon: <Inventory2RoundedIcon fontSize="small" /> },
  { label: "Service Providers", path: "/service-providers", permission: "PROVIDER_VIEW", icon: <HomeRepairServiceRoundedIcon fontSize="small" /> },
  { label: "Masters", path: "/masters", permission: "MASTER_VIEW", icon: <AccountTreeRoundedIcon fontSize="small" /> },
  { label: "Bank Management", path: "/banks", permission: "BANK_VIEW", icon: <AccountBalanceRoundedIcon fontSize="small" /> },
  { label: "Banner Management", path: "/banners", permission: "BANNER_VIEW", icon: <ViewCarouselRoundedIcon fontSize="small" /> },
  { label: "Notifications", path: "/notifications", permission: "NOTIFICATION_VIEW", icon: <CampaignRoundedIcon fontSize="small" /> },
  { label: "Support Tickets", path: "/tickets", permission: "SUPPORT_TICKET_VIEW", icon: <SupportAgentRoundedIcon fontSize="small" /> },
  { label: "Reports", path: "/reports", permission: "REPORT_VIEW", icon: <DescriptionRoundedIcon fontSize="small" /> },
  { label: "Role Management", path: "/roles", permission: "ROLE_VIEW", icon: <ManageAccountsRoundedIcon fontSize="small" /> },
  { label: "Permission Management", path: "/roles/matrix", permission: "PERMISSION_VIEW", icon: <SecurityRoundedIcon fontSize="small" /> },
  { label: "Employee Management", path: "/employees", permission: "USER_VIEW", icon: <EngineeringRoundedIcon fontSize="small" /> },
  { label: "Audit Logs", path: "/audit-logs", permission: "AUDIT_LOG_VIEW", icon: <ReceiptLongRoundedIcon fontSize="small" /> },
  { label: "Business Settings", path: "/settings", permission: "SETTINGS_MANAGE", icon: <BusinessRoundedIcon fontSize="small" /> },
  // Permission fixed from the invented EMPLOYEE_VIEW slug to the real USER_VIEW
  // (see the AppRouter.tsx route-guard comment for /employees et al.). Label kept
  // as "All Users" rather than "Legacy Users" now that this page is live-wired
  // (src/modules/users/UsersPage.tsx), not a mock leftover.
  { label: "All Users", path: "/users", permission: "USER_VIEW", icon: <ApartmentRoundedIcon fontSize="small" /> },
];
