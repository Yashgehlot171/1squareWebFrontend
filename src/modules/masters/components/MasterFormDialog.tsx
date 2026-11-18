import { DialogActions, Grid, MenuItem, TextField } from "@mui/material";
import { AppButton } from "../../../components/common/AppButton";
import { AppInput } from "../../../components/common/AppInput";
import { AppModal } from "../../../components/common/AppModal";
import { normalizeMasterOptions, type MasterConfig, type MasterFieldConfig, type MasterRecord, type MasterRecordValue } from "../types";
import { MasterUploadField } from "./MasterUploadField";
import { StatusToggle } from "./StatusToggle";

interface MasterFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  config: MasterConfig;
  value: MasterRecord;
  recordsByMaster: Record<string, MasterRecord[]>;
  onChange: (value: MasterRecord) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const getOptions = (field: MasterFieldConfig, recordsByMaster: Record<string, MasterRecord[]>) =>
  normalizeMasterOptions((typeof field.options === "function" ? field.options(recordsByMaster) : field.options) ?? []);

const toInputValue = (value: MasterRecordValue) => (value === null || value === undefined ? "" : String(value));

export function MasterFormDialog({ open, mode, config, value, recordsByMaster, onChange, onClose, onSubmit }: MasterFormDialogProps) {
  const setField = (key: string, fieldValue: MasterRecordValue) => onChange({ ...value, [key]: fieldValue });

  return (
    <AppModal open={open} onClose={onClose} title={`${mode === "create" ? "Add" : "Edit"} ${config.title}`}>
      <Grid container spacing={2}>
        {config.fields.map((field) => {
          const fieldValue = value[field.key] ?? (field.type === "status" ? "Active" : "");
          if (field.type === "status") {
            return (
              <Grid item xs={12} md={6} key={field.key}>
                <StatusToggle value={toInputValue(fieldValue)} onChange={(nextValue) => setField(field.key, nextValue)} />
              </Grid>
            );
          }

          if (field.type === "select") {
            return (
              <Grid item xs={12} md={6} key={field.key}>
                <TextField select fullWidth size="small" label={`${field.label}${field.required ? " *" : ""}`} value={toInputValue(fieldValue)} onChange={(event) => setField(field.key, event.target.value)}>
                  {getOptions(field, recordsByMaster).map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            );
          }

          if (field.type === "file" || field.type === "image") {
            // `uploadModule` must be set per-field in masterConfigs.ts (backend
            // requires `module` on every /uploads request). "cms" is a
            // defensive fallback only — every field wired today (propertyType
            // and amenities icons, banner image) sets it explicitly.
            return (
              <Grid item xs={12} md={6} key={field.key}>
                <MasterUploadField
                  label={field.label}
                  value={toInputValue(fieldValue)}
                  accept={field.type === "image" ? "image/*" : undefined}
                  module={field.uploadModule ?? "cms"}
                  previewUrl={field.previewUrlKey ? toInputValue(value[field.previewUrlKey]) || undefined : undefined}
                  onChange={(fileId) => setField(field.key, fileId)}
                />
              </Grid>
            );
          }

          if (field.type === "textarea") {
            return (
              <Grid item xs={12} key={field.key}>
                <AppInput multiline minRows={3} label={`${field.label}${field.required ? " *" : ""}`} value={toInputValue(fieldValue)} onChange={(event) => setField(field.key, event.target.value)} />
              </Grid>
            );
          }

          return (
            <Grid item xs={12} md={6} key={field.key}>
              <AppInput
                type={field.type === "number" ? "number" : "text"}
                label={`${field.label}${field.required ? " *" : ""}`}
                value={toInputValue(fieldValue)}
                onChange={(event) => setField(field.key, field.type === "number" ? Number(event.target.value) : event.target.value)}
              />
            </Grid>
          );
        })}
      </Grid>
      <DialogActions sx={{ px: 0, pb: 0, pt: 2 }}>
        <AppButton variant="text" onClick={onClose}>
          Cancel
        </AppButton>
        <AppButton onClick={onSubmit}>Save</AppButton>
      </DialogActions>
    </AppModal>
  );
}
