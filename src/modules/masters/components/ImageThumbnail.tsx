import BrokenImageRoundedIcon from "@mui/icons-material/BrokenImageRounded";
import { Box } from "@mui/material";
import { useEffect, useState } from "react";

interface ImageThumbnailProps {
  src?: string | null;
  alt?: string;
  size?: number;
}

/**
 * Small reusable thumbnail with a graceful fallback. There is no existing
 * reusable thumbnail/fallback component in this codebase — added here so
 * both `MasterUploadField` (form preview) and `MasterDataTable` (list
 * column, via a per-column `render`) can share the same broken-image/empty
 * handling instead of each rendering a raw `<img>`.
 */
export function ImageThumbnail({ src, alt = "", size = 48 }: ImageThumbnailProps) {
  const [failed, setFailed] = useState(false);

  // Reset the failed state whenever the source changes (e.g. local preview
  // swapped out, or a fresh record loaded) so a previous load failure
  // doesn't stick around and mask a valid new URL.
  useEffect(() => {
    setFailed(false);
  }, [src]);

  const showFallback = !src || failed;

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: 1.5,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "action.hover",
        border: "1px solid",
        borderColor: "divider",
        flexShrink: 0,
      }}
    >
      {showFallback ? (
        <BrokenImageRoundedIcon fontSize="small" sx={{ color: "text.disabled" }} />
      ) : (
        <Box component="img" src={src ?? undefined} alt={alt} onError={() => setFailed(true)} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
      )}
    </Box>
  );
}
