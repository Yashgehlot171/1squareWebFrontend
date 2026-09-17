import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";
import LockOpenRoundedIcon from "@mui/icons-material/LockOpenRounded";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import StarBorderRoundedIcon from "@mui/icons-material/StarBorderRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { DialogActions, Grid, IconButton, MenuItem, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { AppInput } from "../../components/common/AppInput";
import { AppModal } from "../../components/common/AppModal";
import { AppTable } from "../../components/common/AppTable";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { EmptyState } from "../../components/common/EmptyState";
import { Loader } from "../../components/common/Loader";
import { PageHeader } from "../../components/common/PageHeader";
import { SearchFilter } from "../../components/common/SearchFilter";
import { StatusBadge } from "../../components/common/StatusBadge";
import { ToastNotification } from "../../components/common/ToastNotification";
import { propertyService } from "../../services/property.service";
import type { AdminPropertyListParams, AdminPropertyRecord } from "../../services/property.service";
import type { TableColumn } from "../../types";
import { hasPermission } from "../../utils/permissions";

const statusFilterOptions: Array<{ label: string; value: AdminPropertyListParams["status"] | "All" }> = [
  { label: "All", value: "All" },
  { label: "Draft", value: "draft" },
  { label: "Pending", value: "pending" },
  { label: "Under Review", value: "under_review" },
  { label: "Active", value: "active" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Blocked", value: "blocked" },
  { label: "Sold", value: "sold" },
  { label: "Rented", value: "rented" },
  { label: "Inactive", value: "inactive" },
  { label: "Archived", value: "archived" },
];

type ActionKind = "approve" | "reject" | "block" | "unblock" | "feature" | "unfeature";

const actionLabels: Record<ActionKind, string> = {
  approve: "Approve",
  reject: "Reject",
  block: "Block",
  unblock: "Unblock",
  feature: "Feature",
  unfeature: "Unfeature",
};

// Backend gates both approve and reject behind PROPERTY_APPROVE (there is no
// separate backend permission for reject, even though the admin Permission
// type still has a PROPERTY_REJECT literal) — flagged in the review summary.
const actionPermissions: Record<ActionKind, "PROPERTY_APPROVE" | "PROPERTY_BLOCK" | "PROPERTY_FEATURE"> = {
  approve: "PROPERTY_APPROVE",
  reject: "PROPERTY_APPROVE",
  block: "PROPERTY_BLOCK",
  unblock: "PROPERTY_BLOCK",
  feature: "PROPERTY_FEATURE",
  unfeature: "PROPERTY_FEATURE",
};

const remarkRequiredActions: ActionKind[] = ["reject"];

export function PropertiesPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [rows, setRows] = useState<AdminPropertyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<(typeof statusFilterOptions)[number]["value"]>("All");
  const [pending, setPending] = useState<{ row: AdminPropertyRecord; action: ActionKind } | null>(null);
  const [remark, setRemark] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: "success" | "error" } | null>(null);
  const [remarkTarget, setRemarkTarget] = useState<AdminPropertyRecord | null>(null);
  const [remarkText, setRemarkText] = useState("");

  const loadProperties = useCallback(() => {
    setLoading(true);
    setError("");
    // Max page size allowed by adminPropertyListSchema is 100; results are
    // paginated client-side below (same pattern as UsersPage). Server-side
    // pagination for >100 properties can be added in a later pass.
    propertyService
      .getProperties({ limit: 100, page: 1 })
      .then((response) => setRows(response.data.items))
      .catch(() => setError("Unable to load properties from the server."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const haystack = [row.id, row.title, row.basic.propertyType?.name, row.ownerSummary?.fullName, row.location?.city?.name, row.location?.area?.name]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const matchesSearch = haystack.includes(search.toLowerCase());
        const matchesStatus = status === "All" || row.status === status;
        return matchesSearch && matchesStatus;
      }),
    [rows, search, status],
  );

  const runAction = async (row: AdminPropertyRecord, action: ActionKind, actionRemark?: string) => {
    setSubmitting(true);
    try {
      let updated: AdminPropertyRecord;
      switch (action) {
        case "approve":
          updated = (await propertyService.approveProperty(row.id, actionRemark)).data;
          break;
        case "reject":
          updated = (await propertyService.rejectProperty(row.id, actionRemark ?? "")).data;
          break;
        case "block":
          updated = (await propertyService.blockProperty(row.id, actionRemark)).data;
          break;
        case "unblock":
          updated = (await propertyService.unblockProperty(row.id, actionRemark)).data;
          break;
        case "feature":
          updated = (await propertyService.featureProperty(row.id)).data;
          break;
        case "unfeature":
          updated = (await propertyService.unfeatureProperty(row.id)).data;
          break;
      }
      setRows((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setToast({ message: `${actionLabels[action]} completed for ${row.title}.`, severity: "success" });
      setPending(null);
      setRemark("");
    } catch {
      setToast({ message: `${actionLabels[action]} failed. Please try again.`, severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = () => {
    if (!pending) {
      return;
    }
    const needsRemark = remarkRequiredActions.includes(pending.action);
    if (needsRemark && !remark.trim()) {
      setToast({ message: "A remark is required for this action.", severity: "error" });
      return;
    }
    runAction(pending.row, pending.action, remark.trim() || undefined);
  };

  const handleAddRemark = async () => {
    if (!remarkTarget || !remarkText.trim()) {
      setToast({ message: "Enter a remark before submitting.", severity: "error" });
      return;
    }
    setSubmitting(true);
    try {
      await propertyService.addRemark(remarkTarget.id, remarkText.trim());
      setToast({ message: `Remark added for ${remarkTarget.title}.`, severity: "success" });
      setRemarkTarget(null);
      setRemarkText("");
    } catch {
      setToast({ message: "Failed to add remark. Please try again.", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const columns: TableColumn<AdminPropertyRecord>[] = [
    { key: "id", header: "Property ID", render: (row) => row.id },
    { key: "title", header: "Title", render: (row) => <Typography variant="body2">{row.title}</Typography> },
    { key: "type", header: "Type", render: (row) => row.basic.propertyType?.name ?? "" },
    { key: "owner", header: "Owner", render: (row) => row.ownerSummary?.fullName ?? "" },
    { key: "city", header: "City", render: (row) => row.location?.city?.name ?? "" },
    { key: "price", header: "Price", render: (row) => `INR ${Number(row.price).toLocaleString("en-IN")}` },
    { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> },
    { key: "featured", header: "Featured", render: (row) => (row.isFeatured ? <StarRoundedIcon fontSize="small" color="warning" /> : "") },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View">
            <IconButton size="small" component={RouterLink} to={`/properties/${row.id}`}>
              <VisibilityRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {user && hasPermission(user.permissions, actionPermissions.approve) ? (
            <>
              <Tooltip title="Approve">
                <IconButton size="small" color="success" onClick={() => setPending({ row, action: "approve" })}>
                  <CheckCircleOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reject">
                <IconButton size="small" color="error" onClick={() => setPending({ row, action: "reject" })}>
                  <HighlightOffRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          ) : null}
          {user && hasPermission(user.permissions, actionPermissions.block) ? (
            row.status === "blocked" ? (
              <Tooltip title="Unblock">
                <IconButton size="small" color="success" onClick={() => setPending({ row, action: "unblock" })}>
                  <LockOpenRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Block">
                <IconButton size="small" color="error" onClick={() => setPending({ row, action: "block" })}>
                  <BlockRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )
          ) : null}
          {user && hasPermission(user.permissions, actionPermissions.feature) ? (
            row.isFeatured ? (
              <Tooltip title="Unfeature">
                <IconButton size="small" onClick={() => setPending({ row, action: "unfeature" })}>
                  <StarRoundedIcon fontSize="small" color="warning" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Feature">
                <IconButton size="small" onClick={() => setPending({ row, action: "feature" })}>
                  <StarBorderRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )
          ) : null}
          {user && hasPermission(user.permissions, "PROPERTY_EDIT") ? (
            <Tooltip title="Add Remark">
              <IconButton size="small" onClick={() => setRemarkTarget(row)}>
                <RateReviewRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
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
        <PageHeader title="Property Management" subtitle="Live property list, approvals, and status workflow from the admin API." />
        <EmptyState title="Unable to load properties" description={error} />
        <AppButton onClick={loadProperties} sx={{ alignSelf: "flex-start" }}>
          Retry
        </AppButton>
      </Stack>
    );
  }

  const needsRemark = pending ? remarkRequiredActions.includes(pending.action) : false;

  return (
    <>
      <PageHeader title="Property Management" subtitle="Live property list, approvals, and status workflow from the admin API." />
      <Stack spacing={2}>
        <AppCard title="Filters" subtitle="Search and status filtering over the loaded property list.">
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <SearchFilter value={search} onChange={setSearch} placeholder="Search by title, type, owner, or city" />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth size="small" label="Status" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
                {statusFilterOptions.map((option) => (
                  <MenuItem key={option.label} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </AppCard>
        {filteredRows.length ? (
          <AppTable columns={columns} rows={filteredRows} />
        ) : (
          <EmptyState title="No properties found" description="Try changing the search or status filter." />
        )}
      </Stack>

      <ConfirmDialog
        open={Boolean(pending) && !needsRemark}
        title={pending ? `Confirm ${actionLabels[pending.action]}` : ""}
        description={pending ? `${actionLabels[pending.action]} "${pending.row.title}"?` : ""}
        onClose={() => setPending(null)}
        onConfirm={handleConfirm}
      />
      {pending && needsRemark ? (
        <AppModal open onClose={() => setPending(null)} title={`${actionLabels[pending.action]} — Remark Required`}>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              {actionLabels[pending.action]} "{pending.row.title}"
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

      {remarkTarget ? (
        <AppModal open onClose={() => setRemarkTarget(null)} title={`Add Remark — ${remarkTarget.title}`}>
          <Stack spacing={2}>
            <AppInput label="Remark *" multiline minRows={3} value={remarkText} onChange={(event) => setRemarkText(event.target.value)} disabled={submitting} />
            <DialogActions>
              <AppButton variant="text" onClick={() => setRemarkTarget(null)} disabled={submitting}>
                Cancel
              </AppButton>
              <AppButton onClick={handleAddRemark} disabled={submitting}>
                Submit
              </AppButton>
            </DialogActions>
          </Stack>
        </AppModal>
      ) : null}

      <ToastNotification open={Boolean(toast)} message={toast?.message ?? ""} severity={toast?.severity} onClose={() => setToast(null)} />
    </>
  );
}
