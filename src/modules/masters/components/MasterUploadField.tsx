import UploadRoundedIcon from "@mui/icons-material/UploadRounded";
import { Alert, Stack, Typography } from "@mui/material";
import { useState } from "react";
import { AppButton } from "../../../components/common/AppButton";
import { uploadFile } from "../../../services/api/upload";

interface UploadResponse {
  fileId?: string;
  id?: string;
  url?: string;
}

interface MasterUploadFieldProps {
  label: string;
  value: string;
  accept?: string;
  onChange: (fileId: string) => void;
}

export function MasterUploadField({ label, value, accept, onChange }: MasterUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (file: File | undefined) => {
    if (!file) {
      return;
    }
    setUploading(true);
    setError("");
    try {
      const response = await uploadFile<UploadResponse>(file);
      const fileId = response.data.fileId ?? response.data.id ?? response.data.url;
      if (!fileId) {
        throw new Error("Upload response did not include a fileId.");
      }
      onChange(fileId);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Stack spacing={1}>
      <Typography variant="caption" color="text.secondary" fontWeight={700}>
        {label}
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
        <AppButton component="label" variant="outlined" startIcon={<UploadRoundedIcon />} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
          <input hidden type="file" accept={accept} onChange={(event) => handleFileChange(event.target.files?.[0])} />
        </AppButton>
        <Typography variant="body2" color={value ? "text.primary" : "text.secondary"} sx={{ wordBreak: "break-all" }}>
          {value || "No file selected"}
        </Typography>
      </Stack>
      {error ? <Alert severity="error">{error}</Alert> : null}
    </Stack>
  );
}
