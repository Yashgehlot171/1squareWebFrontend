import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { Box, Collapse, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { alpha, styled } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { sidebarItems } from "../../constants/navigation";
import { layout } from "../../theme/spacing";
import { hasPermission } from "../../utils/permissions";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Shell = styled(Box, {
  shouldForwardProp: (prop) => prop !== "data-collapsed",
})(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRight: `1px solid ${theme.palette.divider}`,
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  left: 0,
  overflow: "hidden",
  position: "sticky",
  top: 0,
  transition: "width 220ms ease",
  width: layout.sidebarExpanded,
  zIndex: theme.zIndex.drawer,
  '&[data-collapsed="true"]': {
    width: layout.sidebarCollapsed,
  },
}));

const BrandPanel = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
  borderRadius: 22,
  boxShadow: `0 18px 40px ${alpha(theme.palette.primary.dark, 0.28)}`,
  color: theme.palette.primary.contrastText,
  margin: theme.spacing(2),
  padding: theme.spacing(2),
}));

const NavButton = styled(NavLink)(({ theme }) => ({
  alignItems: "center",
  borderRadius: 14,
  color: theme.palette.text.secondary,
  display: "flex",
  gap: theme.spacing(1.25),
  minHeight: 42,
  padding: theme.spacing(1, 1.25),
  position: "relative",
  textDecoration: "none",
  transition: "background-color 160ms ease, color 160ms ease, transform 160ms ease",
  "& svg": {
    flexShrink: 0,
    fontSize: 20,
  },
  "&:hover": {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.main,
    transform: "translateX(2px)",
  },
  "&.active": {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    fontWeight: 800,
  },
  "&.active::before": {
    backgroundColor: theme.palette.secondary.main,
    borderRadius: 999,
    bottom: 8,
    content: '""',
    left: 0,
    position: "absolute",
    top: 8,
    width: 4,
  },
}));

const groups = [
  { title: "Workspace", labels: ["Dashboard", "Lead Management", "Customer Management", "Broker Management", "Property Management"] },
    { title: "Services", labels: ["Construction Management", "Construction Builders", "Plan Approvals", "Construction RFQs", "Material Suppliers", "Service Providers", "Support Tickets"] },
  { title: "Admin", labels: ["Masters", "Notifications", "Reports", "Role Management", "Permission Management", "Employee Management", "Audit Logs", "Business Settings", "Legacy Users"] },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const user = useAppSelector((state) => state.auth.user);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ Workspace: true, Services: true, Admin: true });
  const permittedItems = sidebarItems.filter((item) => user && hasPermission(user.permissions, item.permission));

  const groupedItems = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          items: group.labels.map((label) => permittedItems.find((item) => item.label === label)).filter(Boolean),
        }))
        .filter((group) => group.items.length),
    [permittedItems],
  );

  return (
    <Shell data-collapsed={collapsed ? "true" : "false"}>
      <BrandPanel>
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent={collapsed ? "center" : "space-between"}>
          <Stack direction="row" spacing={1.25} alignItems="center" minWidth={0}>
            <Box
              sx={{
                alignItems: "center",
                bgcolor: "secondary.main",
                borderRadius: 2.5,
                display: "flex",
                flexShrink: 0,
                fontWeight: 900,
                height: 42,
                justifyContent: "center",
                width: 42,
              }}
            >
              1S
            </Box>
            {!collapsed ? (
              <Box minWidth={0}>
                <Typography variant="subtitle1" lineHeight={1.1}>
                  1Square
                </Typography>
                <Typography variant="caption" sx={{ color: "primary.light" }}>
                  Property Admin
                </Typography>
              </Box>
            ) : null}
          </Stack>
          {!collapsed ? (
            <IconButton color="inherit" size="small" onClick={onToggle}>
              <ChevronLeftRoundedIcon />
            </IconButton>
          ) : null}
        </Stack>
      </BrandPanel>

      {collapsed ? (
        <IconButton onClick={onToggle} sx={{ alignSelf: "center", mb: 1 }}>
          <ChevronRightRoundedIcon />
        </IconButton>
      ) : null}

      <Box sx={{ flex: 1, overflowY: "auto", px: 1.5, pb: 2 }}>
        {groupedItems.map((group) => {
          const groupOpen = collapsed || openGroups[group.title];
          return (
            <Box key={group.title} sx={{ mb: 1.25 }}>
              {!collapsed ? (
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  onClick={() => setOpenGroups((prev) => ({ ...prev, [group.title]: !prev[group.title] }))}
                  sx={{ cursor: "pointer", px: 1, py: 0.75 }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight={800}>
                    {group.title}
                  </Typography>
                  {openGroups[group.title] ? <ExpandLessRoundedIcon fontSize="small" /> : <ExpandMoreRoundedIcon fontSize="small" />}
                </Stack>
              ) : null}
              <Collapse in={groupOpen} timeout={180}>
                <Stack spacing={0.5}>
                  {group.items.map((item) => {
                    const active = location.pathname === item!.path || (item!.path !== "/construction" && location.pathname.startsWith(`${item!.path}/`));
                    const nav = (
                      <NavButton to={item!.path} className={active ? "active" : undefined}>
                        {item!.icon}
                        {!collapsed ? <Typography variant="body2" fontWeight="inherit" noWrap>{item!.label}</Typography> : null}
                      </NavButton>
                    );
                    return collapsed ? (
                      <Tooltip key={item!.path} title={item!.label} placement="right">
                        {nav}
                      </Tooltip>
                    ) : (
                      <Box key={item!.path}>{nav}</Box>
                    );
                  })}
                </Stack>
              </Collapse>
            </Box>
          );
        })}
      </Box>
    </Shell>
  );
}
