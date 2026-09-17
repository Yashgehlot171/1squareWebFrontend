import { createTheme } from "@mui/material/styles";
import { colors } from "./colors";
import { components } from "./components";
import { customShadows } from "./shadows";
import { typography } from "./typography";

export const theme = createTheme({
  palette: {
    primary: {
      main: colors.primaryMain,
      dark: colors.primaryDark,
      light: colors.primarySoft,
      contrastText: colors.white,
    },
    secondary: {
      main: colors.accent,
      light: colors.primarySoft,
      contrastText: colors.primary,
    },
    success: {
      main: colors.success,
    },
    warning: {
      main: colors.warning,
    },
    error: {
      main: colors.error,
    },
    info: {
      main: colors.info,
    },
    background: {
      default: colors.background,
      paper: colors.card,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },
    divider: colors.border,
  },
  shape: {
    borderRadius: 14,
  },
  typography,
  components,
});

export { colors, customShadows };
