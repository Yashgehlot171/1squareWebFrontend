import { Link as RouterLink } from "react-router-dom";
import { Stack } from "@mui/material";
import { AppButton } from "../../components/common/AppButton";
import { EmptyState } from "../../components/common/EmptyState";

export function NotFoundPage() {
  return (
    <Stack spacing={2}>
      <EmptyState title="Page not found" description="The requested page does not exist in the current role-based admin app." />
      <AppButton component={RouterLink} to="/dashboard" sx={{ alignSelf: "flex-start" }}>
        Back to dashboard
      </AppButton>
    </Stack>
  );
}
