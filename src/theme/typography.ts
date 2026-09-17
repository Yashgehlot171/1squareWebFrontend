import type { ThemeOptions } from "@mui/material/styles";

export const typography: ThemeOptions["typography"] = {
  fontFamily: "Inter, sans-serif",
  h4: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "2rem",
    fontWeight: 800,
    letterSpacing: 0,
    lineHeight: 1.2,
  },
  h5: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.625rem",
    fontWeight: 800,
    letterSpacing: 0,
  },
  h6: {
    fontFamily: "Poppins, sans-serif",
    fontSize: "1.125rem",
    fontWeight: 700,
    letterSpacing: 0,
  },
  subtitle1: {
    fontSize: "1rem",
    fontWeight: 700,
  },
  subtitle2: {
    fontSize: "0.9375rem",
    fontWeight: 700,
  },
  body1: {
    fontSize: "0.875rem",
    lineHeight: 1.65,
  },
  body2: {
    fontSize: "0.8125rem",
    lineHeight: 1.6,
  },
  caption: {
    fontSize: "0.75rem",
    lineHeight: 1.5,
  },
  button: {
    fontSize: "0.875rem",
    fontWeight: 700,
    textTransform: "none",
  },
};
