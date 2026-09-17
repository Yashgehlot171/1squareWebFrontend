import { Box, Card, CardContent, Stack, Typography, type SxProps, type Theme } from "@mui/material";
import type { ReactNode } from "react";

interface AppCardProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  sx?: SxProps<Theme>;
}

export function AppCard({ title, subtitle, children, sx }: AppCardProps) {
  return (
    <Card sx={sx}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack spacing={1.5}>
          <Box>
            <Typography variant="h6" color="text.primary">
              {title}
            </Typography>
            {subtitle ? (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}
