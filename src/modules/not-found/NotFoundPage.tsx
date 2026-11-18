import { Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AppButton } from "../../components/common/AppButton";
import { EmptyState } from "../../components/common/EmptyState";

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Stack spacing={2}>
      <EmptyState title="Page not found" description="The requested page does not exist in the current role-based admin app." />
      <AppButton onClick={() => navigate("/dashboard")} sx={{ alignSelf: "flex-start" }}>
        Back to dashboard
      </AppButton>
    </Stack>
  );
}
