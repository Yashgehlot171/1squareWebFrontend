import { Link as RouterLink } from "react-router-dom";
import { Stack } from "@mui/material";
import { AppButton } from "../../components/common/AppButton";
import { EmptyState } from "../../components/common/EmptyState";

export function ForbiddenPage() {
  return (
    <Stack spacing={2}>
      <EmptyState title="403 Unauthorized" description="You do not have permission to access this page or action." />
      <AppButton component={RouterLink} to="/dashboard" sx={{ alignSelf: "flex-start" }}>
        Back to dashboard
      </AppButton>
    </Stack>
  );
}
