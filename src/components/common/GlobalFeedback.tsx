import { Backdrop, CircularProgress } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { clearGlobalMessage } from "../../app/store";
import { ToastNotification } from "./ToastNotification";

export function GlobalFeedback() {
  const dispatch = useAppDispatch();
  const { loading, message } = useAppSelector((state) => state.ui);

  return (
    <>
      <Backdrop open={loading} sx={{ zIndex: (theme) => theme.zIndex.modal + 1, color: "#fff" }}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <ToastNotification
        open={Boolean(message)}
        message={message?.message ?? ""}
        severity={message?.severity}
        onClose={() => dispatch(clearGlobalMessage())}
      />
    </>
  );
}
