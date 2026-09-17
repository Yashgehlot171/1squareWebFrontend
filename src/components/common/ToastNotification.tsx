import { Alert, Snackbar } from "@mui/material";

interface ToastNotificationProps {
  open: boolean;
  message: string;
  severity?: "success" | "error" | "info" | "warning";
  onClose: () => void;
}

export function ToastNotification({ open, message, severity = "success", onClose }: ToastNotificationProps) {
  return (
    <Snackbar open={open} autoHideDuration={3000} onClose={onClose} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
      <Alert severity={severity} variant="filled" onClose={onClose}>
        {message}
      </Alert>
    </Snackbar>
  );
}
