import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2.5} mb={3.5}>
      <Box sx={{ maxWidth: 820 }}>
        <Typography variant="caption" color="secondary.main" fontWeight={900}>
          1SQUARE PROPERTY
        </Typography>
        <Typography variant="h4" color="text.primary" mt={0.25}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" mt={0.75}>
          {subtitle}
        </Typography>
      </Box>
      {actions}
    </Stack>
  );
}
