import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { AppBar, Avatar, Badge, Box, Breadcrumbs, Divider, IconButton, InputAdornment, Link as MuiLink, Menu, MenuItem, Stack, TextField, Toolbar, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { clearSession } from "../../app/store";
import { AppButton } from "../common/AppButton";
import { authService } from "../../services/auth.service";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const segments = location.pathname.split("/").filter(Boolean);

  const handleLogout = async () => {
    await authService.logout();
    dispatch(clearSession());
    setAnchorEl(null);
    navigate("/login", { replace: true });
  };

  return (
    <AppBar
      position="sticky"
      color="inherit"
      elevation={0}
      sx={{
        backdropFilter: "blur(16px)",
        bgcolor: (theme) => alpha(theme.palette.background.paper, 0.9),
        borderBottom: 1,
        borderColor: "divider",
        boxShadow: (theme) => `0 10px 32px ${alpha(theme.palette.primary.dark, 0.06)}`,
      }}
    >
      <Toolbar sx={{ gap: 2, minHeight: 72 }}>
        <IconButton onClick={onToggleSidebar} color="primary">
          <MenuRoundedIcon />
        </IconButton>

        <Box sx={{ minWidth: 220 }}>
          <Typography variant="h6" color="primary.dark" lineHeight={1.1}>
            Admin Console
          </Typography>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mt: 0.35 }}>
            <MuiLink component={Link} color="inherit" underline="hover" to="/dashboard">
              Home
            </MuiLink>
            {segments.map((segment, index) => (
              <Typography color="text.primary" key={`${segment}-${index}`} sx={{ textTransform: "capitalize" }}>
                {segment.replace("-", " ")}
              </Typography>
            ))}
          </Breadcrumbs>
        </Box>

        <TextField
          placeholder="Search customers, leads, properties..."
          sx={{ display: { xs: "none", md: "block" }, maxWidth: 460, flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: "auto" }}>
          <AppButton startIcon={<AddRoundedIcon />} sx={{ display: { xs: "none", lg: "inline-flex" } }}>
            Quick Add
          </AppButton>
          <IconButton color="primary">
            <Badge color="warning" variant="dot">
              <NotificationsNoneRoundedIcon />
            </Badge>
          </IconButton>
          <IconButton color="primary">
            <Badge color="secondary" variant="dot">
              <ChatBubbleOutlineRoundedIcon />
            </Badge>
          </IconButton>
          <Box sx={{ display: { xs: "none", sm: "block" }, textAlign: "right" }}>
            <Typography variant="body2" color="text.primary" fontWeight={800}>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.roleLabel}
            </Typography>
          </Box>
          <IconButton onClick={(event) => setAnchorEl(event.currentTarget)} color="primary">
            <Avatar sx={{ bgcolor: "primary.light", color: "primary.main", width: 36, height: 36 }}>
              <AccountCircleRoundedIcon />
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem component={Link} to="/profile" onClick={() => setAnchorEl(null)}>
              Profile
            </MenuItem>
            <MenuItem component={Link} to="/change-password" onClick={() => setAnchorEl(null)}>
              Change Password
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
