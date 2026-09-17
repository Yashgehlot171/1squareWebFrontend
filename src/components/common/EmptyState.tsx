import InboxRoundedIcon from "@mui/icons-material/InboxRounded";
import { Box, Paper, Stack, Typography } from "@mui/material";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Paper variant="outlined" sx={{ p: 5, textAlign: "center", borderRadius: 3 }}>
      <Stack spacing={1} alignItems="center">
        <Box sx={{ alignItems: "center", bgcolor: "primary.light", borderRadius: 4, color: "primary.main", display: "flex", height: 72, justifyContent: "center", width: 72 }}>
          <InboxRoundedIcon fontSize="large" />
        </Box>
        <Typography variant="h6">{title}</Typography>
        <Typography color="text.secondary">{description}</Typography>
      </Stack>
    </Paper>
  );
}
