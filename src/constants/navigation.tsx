import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import EngineeringRoundedIcon from "@mui/icons-material/EngineeringRounded";
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
  { label: "Customer Management", path: "/customers", permission: "CUSTOMER_VIEW", icon: <GroupsRoundedIcon fontSize="small" /> },
  { label: "Broker Management", path: "/brokers", permission: "BROKER_VIEW", icon: <HandshakeRoundedIcon fontSize="small" /> },
  { label: "Property Management", path: "/properties", permission: "PROPERTY_VIEW", icon: <HomeWorkRoundedIcon fontSize="small" /> },
  { label: "Construction Management", path: "/construction", permission: "CONSTRUCTION_VIEW", icon: <ConstructionRoundedIcon fontSize="small" /> },
  { label: "Material Suppliers", path: "/material-suppliers", permission: "MATERIAL_SUPPLIER_VIEW", icon: <Inventory2RoundedIcon fontSize="small" /> },
  { label: "Service Providers", path: "/service-providers", permission: "SERVICE_PROVIDER_VIEW", icon: <HomeRepairServiceRoundedIcon fontSize="small" /> },
  { label: "Masters", path: "/masters", permission: "MASTER_VIEW", icon: <AccountTreeRoundedIcon fontSize="small" /> },
  { label: "Notifications", path: "/notifications", permission: "NOTIFICATION_VIEW", icon: <CampaignRoundedIcon fontSize="small" /> },
  { label: "Support Tickets", path: "/tickets", permission: "SUPPORT_TICKET_VIEW", icon: <SupportAgentRoundedIcon fontSize="small" /> },
  { label: "Reports", path: "/reports", permission: "REPORT_VIEW", icon: <DescriptionRoundedIcon fontSize="small" /> },
  { label: "Role Management", path: "/roles", permission: "ROLE_VIEW", icon: <ManageAccountsRoundedIcon fontSize="small" /> },
  { label: "Permission Management", path: "/roles/matrix", permission: "PERMISSION_VIEW", icon: <SecurityRoundedIcon fontSize="small" /> },
  { label: "Employee Management", path: "/employees", permission: "EMPLOYEE_VIEW", icon: <EngineeringRoundedIcon fontSize="small" /> },
  { label: "Audit Logs", path: "/audit-logs", permission: "AUDIT_LOG_VIEW", icon: <ReceiptLongRoundedIcon fontSize="small" /> },
  { label: "Business Settings", path: "/settings", permission: "SETTINGS_MANAGE", icon: <BusinessRoundedIcon fontSize="small" /> },
  { label: "Legacy Users", path: "/users", permission: "EMPLOYEE_VIEW", icon: <ApartmentRoundedIcon fontSize="small" /> },
];
