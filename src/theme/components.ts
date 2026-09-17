import { alpha, type ThemeOptions } from "@mui/material/styles";
import { colors } from "./colors";
import { customShadows } from "./shadows";

export const components: ThemeOptions["components"] = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        backgroundColor: colors.background,
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: "none",
        minHeight: 40,
        textTransform: "none",
        transition: "transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease",
        "&:hover": {
          boxShadow: customShadows.sm,
          transform: "translateY(-1px)",
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        border: `1px solid ${colors.border}`,
        borderRadius: 20,
        boxShadow: customShadows.sm,
        transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
        "&:hover": {
          borderColor: alpha(colors.primaryMain, 0.18),
          boxShadow: customShadows.md,
          transform: "translateY(-2px)",
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: "none",
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      size: "small",
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        backgroundColor: colors.card,
        borderRadius: 12,
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 24,
        boxShadow: customShadows.lg,
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      head: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: 800,
        letterSpacing: 0,
      },
      body: {
        fontSize: 13,
      },
    },
  },
};
