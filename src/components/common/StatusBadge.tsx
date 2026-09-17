import { Chip } from "@mui/material";

interface StatusBadgeProps {
  value: string;
}

export function StatusBadge({ value }: StatusBadgeProps) {
  const tone = value.toLowerCase();
  let color: "success" | "warning" | "error" | "default" | "info" = "default";

  if (["approved", "active", "success", "paid", "processed", "closed"].includes(tone)) {
    color = "success";
  } else if (["verified", "prime", "converted", "resolved", "ready"].includes(tone)) {
    color = "success";
  } else if (["pending", "under review", "requested", "in progress", "follow-up required", "contacted", "in discussion", "scheduled", "draft"].includes(tone)) {
    color = "warning";
  } else if (["rejected", "failed", "suspended", "escalated", "overdue", "blocked", "inactive", "invalid", "not interested"].includes(tone)) {
    color = "error";
  } else if (["open", "new", "interested", "sent"].includes(tone)) {
    color = "info";
  }

  return <Chip label={value} color={color} size="small" variant="filled" sx={{ borderRadius: 999, fontWeight: 800 }} />;
}
