import { Dialog, DialogContent, DialogTitle, Typography, type DialogProps } from "@mui/material";
import type { ReactNode } from "react";

interface AppModalProps extends Omit<DialogProps, "title"> {
  title: string;
  children: ReactNode;
}

export function AppModal({ title, children, ...props }: AppModalProps) {
  return (
    <Dialog fullWidth maxWidth="md" {...props}>
      <DialogTitle sx={{ pb: 1.5, pt: 3 }}>
        <Typography variant="h6">{title}</Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        {children}
      </DialogContent>
    </Dialog>
  );
}
