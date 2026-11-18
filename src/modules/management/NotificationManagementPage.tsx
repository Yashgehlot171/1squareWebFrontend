import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { DialogActions, Grid, IconButton, MenuItem, Stack, Tooltip, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  notificationService,
  type AdminNotificationRecord,
  type CreateNotificationInput,
  type NotificationTargetAudience,
  type UpdateNotificationInput,
} from "../../services/notification.service";
import type { Permission, TableColumn } from "../../types";
import { hasPermission } from "../../utils/permissions";

const TARGET_AUDIENCES: NotificationTargetAudience[] = ["All Users", "Customers", "Brokers", "Selected Users"];

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleString() : "-");

type ModalState = { kind: "create" } | { kind: "edit"; row: AdminNotificationRecord } | { kind: "delete"; row: AdminNotificationRecord };

export function NotificationManagementPage() {
  const authUser = useAppSelector((state) => state.auth.user);
  const permissions = useMemo(() => authUser?.permissions ?? [], [authUser]);
  const can = useCallback((permission: Permission) => hasPermission(permissions, permission), [permissions]);

  const [rows, setRows] = useState<AdminNotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: "success" | "error" } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    notificationService
      .getNotifications({ limit: 100, page: 1 })
      .then((response) => setRows(response.data.items))
      .catch(() => setError("Unable to load notifications from the server."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => [row.id, row.title, row.body, row.targetAudience, row.module].filter(Boolean).join(" ").toLowerCase().includes(search.toLowerCase())),
    [rows, search],
  );

  const replaceRow = (updated: AdminNotificationRecord) => setRows((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  const closeModal = () => setModal(null);

  const handleSend = async (row: AdminNotificationRecord) => {
    setSubmitting(true);
    try {
      const response = await notificationService.sendNotification(row.id);
      setToast({ message: `Sent to ${response.data.recipients} recipient(s).`, severity: "success" });
      load();
    } catch {
      setToast({ message: "Send failed. Please try again.", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const columns: TableColumn<AdminNotificationRecord>[] = [
    { key: "id", header: "ID", render: (row) => row.id },
    { key: "title", header: "Title", render: (row) => <Typography variant="body2">{row.title}</Typography> },
    { key: "audience", header: "Audience", render: (row) => row.targetAudience ?? "-" },
    { key: "type", header: "Type", render: (row) => row.type?.name ?? "-" },
    { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> },
    { key: "sentAt", header: "Sent At", render: (row) => formatDate(row.sentAt) },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <Stack direction="row" spacing={0.25}>
          {can("NOTIFICATION_EDIT") && row.status !== "SENT" ? (
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => setModal({ kind: "edit", row })}>
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {can("NOTIFICATION_SEND") && row.status !== "SENT" ? (
            <Tooltip title="Send Now">
              <IconButton size="small" color="success" onClick={() => handleSend(row)} disabled={submitting}>
                <SendRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {can("NOTIFICATION_DELETE") ? (
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => setModal({ kind: "delete", row })}>
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
        </Stack>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Notification Management"
        subtitle="Broadcast creation, targeting, and send workflow, sourced live from the admin API."
        actions={
          authUser && can("NOTIFICATION_CREATE") ? (
            <AppButton startIcon={<AddRoundedIcon />} onClick={() => setModal({ kind: "create" })}>
              Add Notification
            </AppButton>
          ) : undefined
        }
      />

      {loading ? (
        <Loader />
      ) : error ? (
        <Stack spacing={2}>
          <EmptyState title="Unable to load notifications" description={error} />
          <AppButton onClick={load} sx={{ alignSelf: "flex-start" }}>
            Retry
          </AppButton>
        </Stack>
      ) : (
        <Stack spacing={2}>
          <AppCard title="Filters" subtitle="Search across title, message, module, and audience.">
            <SearchFilter value={search} onChange={setSearch} placeholder="Search notifications" />
          </AppCard>
          {filteredRows.length ? <AppTable columns={columns} rows={filteredRows} /> : <EmptyState title="No notifications found" description="Try a different search term." />}
        </Stack>
      )}

      {modal?.kind === "create" || modal?.kind === "edit" ? (
        <NotificationFormModal
          mode={modal.kind}
          row={modal.kind === "edit" ? modal.row : undefined}
          submitting={submitting}
          onClose={closeModal}
          onSubmit={async (input) => {
            setSubmitting(true);
            try {
              if (modal.kind === "edit") {
                const response = await notificationService.updateNotification(modal.row.id, input);
                replaceRow(response.data);
                setToast({ message: `${response.data.title} updated.`, severity: "success" });
              } else {
                const response = await notificationService.createNotification(input as CreateNotificationInput);
                setRows((current) => [response.data, ...current]);
                setToast({ message: `${response.data.title} created as ${response.data.status.toLowerCase()}.`, severity: "success" });
              }
              closeModal();
            } catch {
              setToast({ message: "Save failed. Please check the fields and try again.", severity: "error" });
            } finally {
              setSubmitting(false);
            }
          }}
        />
      ) : null}

      <ConfirmDialog
        open={modal?.kind === "delete"}
        title="Delete Notification"
        description={modal?.kind === "delete" ? `This permanently deletes "${modal.row.title}".` : ""}
        confirmText="Delete"
        onClose={closeModal}
        onConfirm={async () => {
          if (modal?.kind !== "delete") return;
          try {
            await notificationService.deleteNotification(modal.row.id);
            setRows((current) => current.filter((item) => item.id !== modal.row.id));
            setToast({ message: "Notification deleted.", severity: "success" });
          } catch {
            setToast({ message: "Delete failed. Please try again.", severity: "error" });
          } finally {
            closeModal();
          }
        }}
      />

      <ToastNotification open={Boolean(toast)} message={toast?.message ?? ""} severity={toast?.severity} onClose={() => setToast(null)} />
    </>
  );
}

function NotificationFormModal({
  mode,
  row,
  submitting,
  onClose,
  onSubmit,
}: {
  mode: "create" | "edit";
  row?: AdminNotificationRecord;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (input: CreateNotificationInput | UpdateNotificationInput) => void;
}) {
  const [title, setTitle] = useState(row?.title ?? "");
  const [message, setMessage] = useState(row?.body ?? "");
  const [targetAudience, setTargetAudience] = useState<NotificationTargetAudience>(row?.targetAudience ?? "All Users");
  const [selectedUserIds, setSelectedUserIds] = useState("");
  const [module, setModule] = useState(row?.module ?? "");
  const [scheduledAt, setScheduledAt] = useState(row?.scheduledAt ? row.scheduledAt.slice(0, 16) : "");
  const [status, setStatus] = useState<"draft" | "scheduled">(row?.status === "PENDING" && row.scheduledAt ? "scheduled" : "draft");

  const canSubmit = title.trim() && message.trim() && (targetAudience !== "Selected Users" || selectedUserIds.trim());

  return (
    <AppModal open onClose={onClose} title={mode === "edit" ? `Edit Notification — ${row?.title}` : "Add Notification"}>
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Creating here only saves a draft/scheduled definition. Use the Send action on the list to actually deliver it to the target audience.
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <AppInput label="Title *" value={title} onChange={(event) => setTitle(event.target.value)} disabled={submitting} />
          </Grid>
          <Grid item xs={12}>
            <AppInput label="Message *" multiline minRows={3} value={message} onChange={(event) => setMessage(event.target.value)} disabled={submitting} />
          </Grid>
          <Grid item xs={12} md={6}>
            <AppInput select label="Target Audience *" value={targetAudience} onChange={(event) => setTargetAudience(event.target.value as NotificationTargetAudience)} disabled={submitting}>
              {TARGET_AUDIENCES.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </AppInput>
          </Grid>
          <Grid item xs={12} md={6}>
            <AppInput
              select
              label="Status"
              value={status}
              onChange={(event) => setStatus(event.target.value as "draft" | "scheduled")}
              disabled={submitting}
            >
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
            </AppInput>
          </Grid>
          {targetAudience === "Selected Users" ? (
            <Grid item xs={12}>
              <AppInput
                label="Selected User IDs *"
                value={selectedUserIds}
                onChange={(event) => setSelectedUserIds(event.target.value)}
                disabled={submitting}
                helperText="Comma-separated numeric user ids. There is no user picker wired to this form yet."
              />
            </Grid>
          ) : null}
          {status === "scheduled" ? (
            <Grid item xs={12} md={6}>
              <AppInput
                label="Scheduled At"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
                disabled={submitting}
              />
            </Grid>
          ) : null}
          <Grid item xs={12} md={6}>
            <AppInput
              label="Module / Type Slug"
              value={module}
              onChange={(event) => setModule(event.target.value)}
              disabled={submitting}
              helperText='Matched against a configured notification type slug; falls back to "system" if not found.'
            />
          </Grid>
        </Grid>
        <DialogActions>
          <AppButton variant="text" onClick={onClose} disabled={submitting}>
            Cancel
          </AppButton>
          <AppButton
            disabled={submitting || !canSubmit}
            onClick={() =>
              onSubmit({
                title: title.trim(),
                message: message.trim(),
                targetAudience,
                selectedUserIds: targetAudience === "Selected Users" ? selectedUserIds.split(",").map((id) => Number(id.trim())).filter((id) => Number.isFinite(id) && id > 0) : undefined,
                module: module.trim() || undefined,
                scheduledAt: status === "scheduled" && scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
                status,
              })
            }
          >
            {mode === "edit" ? "Save Changes" : "Create Notification"}
          </AppButton>
        </DialogActions>
      </Stack>
    </AppModal>
  );
}
