import { Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AppButton } from "../../components/common/AppButton";
import { EmptyState } from "../../components/common/EmptyState";

export function ForbiddenPage() {
  const navigate = useNavigate();
  return (
    <Stack spacing={2}>
      <EmptyState title="403 Unauthorized" description="You do not have permission to access this page or action." />
      <AppButton onClick={() => navigate("/dashboard")} sx={{ alignSelf: "flex-start" }}>
        Back to dashboard
      </AppButton>
    </Stack>
  );
}
