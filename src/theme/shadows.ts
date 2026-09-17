import { colors } from "./colors";

export const customShadows = {
  xs: `0 1px 2px rgba(${colors.shadowRgb}, 0.05)`,
  sm: `0 8px 20px rgba(${colors.shadowRgb}, 0.06)`,
  md: `0 18px 45px rgba(${colors.shadowRgb}, 0.08)`,
  lg: `0 24px 70px rgba(${colors.primaryShadowRgb}, 0.14)`,
  focus: `0 0 0 4px rgba(192, 132, 252, 0.18)`,
} as const;
