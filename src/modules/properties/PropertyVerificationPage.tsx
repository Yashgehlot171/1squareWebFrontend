import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { DialogActions, IconButton, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { AppButton } from "../../components/common/AppButton";
import { AppInput } from "../../components/common/AppInput";
import { AppModal } from "../../components/common/AppModal";
import { AppTable } from "../../components/common/AppTable";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { EmptyState } from "../../components/common/EmptyState";
import { Loader } from "../../components/common/Loader";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { ToastNotification } from "../../components/common/ToastNotification";
import { propertyService } from "../../services/property.service";
import type { AdminPropertyRecord } from "../../services/property.service";
import type { TableColumn } from "../../types";
import { hasPermission } from "../../utils/permissions";

/**
 * There is no dedicated "verification queue" endpoint on the backend admin
 * properties router — see propertyService.getVerificationQueue for the full
 * reasoning. This page lists properties currently in the "under_review"
 * status (the real adminPropertyListSchema `status` filter) and lets an
 * admin approve/reject them via the same verified approve/reject endpoints
 * used on PropertiesPage.
 */
export function PropertyVerificationPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [rows, setRows] = useState<AdminPropertyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<{ row: AdminPropertyRecord; action: "approve" | "reject" } | null>(null);
  const [remark, setRemark] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: "success" | "error" } | null>(null);

  const loadQueue = useCallback(() => {
    setLoading(true);
    setError("");
    propertyService
      .getVerificationQueue({ limit: 100, page: 1 })
      .then((response) => setRows(response.data.items))
      .catch(() => setError("Unable to load the verification queue from the server."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const handleConfirm = async () => {
    if (!pending) {
      return;
    }
    if (pending.action === "reject" && !remark.trim()) {
      setToast({ message: "A remark is required to reject a property.", severity: "error" });
      return;
    }
    setSubmitting(true);
    try {
      if (pending.action === "approve") {
        await propertyService.approveProperty(pending.row.id, remark.trim() || undefined);
      } else {
        await propertyService.rejectProperty(pending.row.id, remark.trim());
      }
      setRows((current) => current.filter((row) => row.id !== pending.row.id));
      setToast({ message: `${pending.action === "approve" ? "Approved" : "Rejected"} "${pending.row.title}".`, severity: "success" });
      setPending(null);
      setRemark("");
    } catch {
      setToast({ message: "Action failed. Please try again.", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const columns: TableColumn<AdminPropertyRecord>[] = [
    { key: "id", header: "Property ID", render: (row) => row.id },
    { key: "title", header: "Title", render: (row) => <Typography variant="body2">{row.title}</Typography> },
    { key: "owner", header: "Owner Name", render: (row) => row.ownerSummary?.fullName ?? "" },
    { key: "type", header: "Type", render: (row) => row.basic.propertyType?.name ?? "" },
    { key: "city", header: "City", render: (row) => row.location?.city?.name ?? "" },
    { key: "verificationStatus", header: "Verification Status", render: (row) => <StatusBadge value={row.verificationStatus} /> },
    { key: "status", header: "Property Status", render: (row) => <StatusBadge value={row.status} /> },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" component={RouterLink} to={`/properties/${row.id}`}>
            <VisibilityRoundedIcon fontSize="small" />
          </IconButton>
          {user && hasPermission(user.permissions, "PROPERTY_APPROVE") ? (
            <>
              <IconButton size="small" color="success" onClick={() => setPending({ row, action: "approve" })}>
                <CheckCircleOutlineRoundedIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" color="error" onClick={() => setPending({ row, action: "reject" })}>
                <HighlightOffRoundedIcon fontSize="small" />
              </IconButton>
            </>
          ) : null}
        </Stack>
      ),
    },
  ];

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Stack spacing={2}>
        <PageHeader title="Property Verification" subtitle="Properties awaiting admin review, approval, or rejection." />
        <EmptyState title="Unable to load the verification queue" description={error} />
        <AppButton onClick={loadQueue} sx={{ alignSelf: "flex-start" }}>
          Retry
        </AppButton>
      </Stack>
    );
  }

  return (
    <>
      <PageHeader title="Property Verification" subtitle="Properties currently under review, approval, or rejection workflow." />
      {rows.length ? <AppTable columns={columns} rows={rows} /> : <EmptyState title="Verification queue is empty" description="No properties are currently under review." />}

      <ConfirmDialog
        open={Boolean(pending) && pending?.action === "approve"}
        title="Confirm Approve"
        description={pending ? `Approve "${pending.row.title}"?` : ""}
        onClose={() => setPending(null)}
        onConfirm={handleConfirm}
      />
      {pending && pending.action === "reject" ? (
        <AppModal open onClose={() => setPending(null)} title="Reject — Remark Required">
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Reject "{pending.row.title}"
            </Typography>
            <AppInput label="Remark *" multiline minRows={3} value={remark} onChange={(event) => setRemark(event.target.value)} disabled={submitting} />
            <DialogActions>
              <AppButton variant="text" onClick={() => setPending(null)} disabled={submitting}>
                Cancel
              </AppButton>
              <AppButton color="error" onClick={handleConfirm} disabled={submitting}>
                Confirm
              </AppButton>
            </DialogActions>
          </Stack>
        </AppModal>
      ) : null}

      <ToastNotification open={Boolean(toast)} message={toast?.message ?? ""} severity={toast?.severity} onClose={() => setToast(null)} />
    </>
  );
}
