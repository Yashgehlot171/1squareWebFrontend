import { MenuItem, TextField } from "@mui/material";
import type { OptionItem } from "../../types";

interface AppSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: OptionItem[];
  error?: boolean;
  helperText?: string;
}

export function AppSelect({ label, value, onChange, options, error, helperText }: AppSelectProps) {
  return (
    <TextField
      select
      fullWidth
      size="small"
      label={label}
      value={value}
      error={error}
      helperText={helperText}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
