import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { InputAdornment } from "@mui/material";
import { AppInput } from "./AppInput";

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchFilter({ value, onChange, placeholder = "Search" }: SearchFilterProps) {
  return (
    <AppInput
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchRoundedIcon fontSize="small" />
          </InputAdornment>
        ),
      }}
    />
  );
}
