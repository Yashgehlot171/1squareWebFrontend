import { Stack } from "@mui/material";
import { AppInput } from "./AppInput";

interface DateRangeFilterProps {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}

export function DateRangeFilter({ from, to, onFromChange, onToChange }: DateRangeFilterProps) {
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
      <AppInput label="From" type="date" value={from} onChange={(event) => onFromChange(event.target.value)} InputLabelProps={{ shrink: true }} />
      <AppInput label="To" type="date" value={to} onChange={(event) => onToChange(event.target.value)} InputLabelProps={{ shrink: true }} />
    </Stack>
  );
}
