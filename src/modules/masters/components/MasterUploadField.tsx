import UploadRoundedIcon from "@mui/icons-material/UploadRounded";
import { Alert, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { AppButton } from "../../../components/common/AppButton";
import { uploadFile, type UploadModule } from "../../../services/api/upload";
import { ImageThumbnail } from "./ImageThumbnail";

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
  /**
   * Backend `module` value (see `src/services/api/upload.ts`'s `uploadModules`,
   * mirrored from 1SqrPropertyBackend's `createUploadSchema`). Required:
   * `POST /uploads` returns 422 without it. Callers must pass the value that
   * semantically matches what's being uploaded (e.g. "banner" for a banner
   * image), not a generic default.
   */
  module: UploadModule;
  /**
   * The currently-uploaded file's real, resolved URL (e.g. a banner's
   * `imageUrl` from the backend), shown as the preview when a dialog opens in
   * edit mode with no new file picked yet. Purely additive/optional —
   * existing callers (property-type/amenity icon uploads) that don't pass it
   * simply get the empty-state fallback thumbnail until a new file is
   * picked, exactly as before this field existed.
   */
  previewUrl?: string;
}

export function MasterUploadField({ label, value, accept, onChange, module, previewUrl }: MasterUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const localPreviewRef = useRef<string | null>(null);

  // Revoke whatever local object-URL is outstanding when the component
  // unmounts (e.g. dialog closed) so we don't leak blob URLs.
  useEffect(
    () => () => {
      if (localPreviewRef.current) {
        URL.revokeObjectURL(localPreviewRef.current);
      }
    },
    [],
  );

  const handleFileChange = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    // Show the picked file immediately, before the upload network call even
    // starts — revoke any previous local preview first so we don't leak it.
    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
    }
    const objectUrl = URL.createObjectURL(file);
    localPreviewRef.current = objectUrl;
    setLocalPreview(objectUrl);

    setUploading(true);
    setError("");
    try {
      const response = await uploadFile<UploadResponse>(file, { extraFields: { module } });
      const fileId = response.data.fileId ?? response.data.id ?? response.data.url;
      if (!fileId) {
        throw new Error("Upload response did not include a fileId.");
      }
      onChange(fileId);
      // Keep showing the local object-URL preview after upload completes —
      // it's the exact same file the user just picked, so it's simpler (no
      // extra round trip) and visually identical to swapping to a freshly
      // returned remote URL.
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const displaySrc = localPreview ?? previewUrl ?? null;

  return (
    <Stack spacing={1}>
      <Typography variant="caption" color="text.secondary" fontWeight={700}>
        {label}
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
        <ImageThumbnail src={displaySrc} alt={label} size={72} />
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
