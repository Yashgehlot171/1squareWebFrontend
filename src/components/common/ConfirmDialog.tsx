import { DialogActions, DialogContentText, Stack } from "@mui/material";
import { AppButton } from "./AppButton";
import { AppModal } from "./AppModal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AppModal open={open} onClose={onClose} title={title}>
      <Stack spacing={2}>
        <DialogContentText>{description}</DialogContentText>
        <DialogActions>
          <AppButton variant="text" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton color="error" onClick={onConfirm}>
            {confirmText}
          </AppButton>
        </DialogActions>
      </Stack>
    </AppModal>
  );
}
