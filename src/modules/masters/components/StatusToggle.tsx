import { Switch, Stack, Typography } from "@mui/material";

interface StatusToggleProps {
  value: string;
  onChange: (value: string) => void;
}

export function StatusToggle({ value, onChange }: StatusToggleProps) {
  const active = value !== "Inactive";
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Switch checked={active} onChange={(event) => onChange(event.target.checked ? "Active" : "Inactive")} size="small" />
      <Typography variant="body2" color={active ? "success.main" : "text.secondary"} fontWeight={700}>
        {active ? "Active" : "Inactive"}
      </Typography>
    </Stack>
  );
}
