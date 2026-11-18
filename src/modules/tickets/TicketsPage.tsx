import AssignmentIndRoundedIcon from "@mui/icons-material/AssignmentIndRounded";
import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import ReplyRoundedIcon from "@mui/icons-material/ReplyRounded";
import UpdateRoundedIcon from "@mui/icons-material/UpdateRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { Chip, DialogActions, Divider, Grid, IconButton, MenuItem, Stack, Tooltip, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppSelector } from "../../app/hooks";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { AppInput } from "../../components/common/AppInput";
import { AppModal } from "../../components/common/AppModal";
import { AppTable } from "../../components/common/AppTable";
import { EmptyState } from "../../components/common/EmptyState";
import { Loader } from "../../components/common/Loader";
import { PageHeader } from "../../components/common/PageHeader";
import { SearchFilter } from "../../components/common/SearchFilter";
import { StatusBadge } from "../../components/common/StatusBadge";
import { ToastNotification } from "../../components/common/ToastNotification";
import {
  TICKET_STATUS_CHANGE_VALUES,
  ticketService,
  type AdminSupportTicketRecord,
  type AssignTicketInput,
  type TicketStatusChangeValue,
} from "../../services/ticket.service";
import type { Permission, TableColumn } from "../../types";
import { hasPermission } from "../../utils/permissions";

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleString() : "-");
const titleCase = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const priorityColor: Record<string, "default" | "success" | "warning" | "error"> = {
  LOW: "success",
  MEDIUM: "default",
  HIGH: "warning",
  URGENT: "error",
};

type ModalState =
  | { kind: "view"; row: AdminSupportTicketRecord }
  | { kind: "assign"; row: AdminSupportTicketRecord }
  | { kind: "reply"; row: AdminSupportTicketRecord }
  | { kind: "remark"; row: AdminSupportTicketRecord }
  | { kind: "status"; row: AdminSupportTicketRecord }
  | { kind: "close"; row: AdminSupportTicketRecord };

export function TicketsPage() {
  const authUser = useAppSelector((state) => state.auth.user);
  const permissions = useMemo(() => authUser?.permissions ?? [], [authUser]);
  const can = useCallback((permission: Permission) => hasPermission(permissions, permission), [permissions]);

  const [rows, setRows] = useState<AdminSupportTicketRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | AdminSupportTicketRecord["status"]>("All");
  const [modal, setModal] = useState<ModalState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: "success" | "error" } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    ticketService
      .getTickets({ limit: 100, page: 1 })
      .then((response) => setRows(response.data.items))
      .catch(() => setError("Unable to load support tickets from the server."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const haystack = [row.ticketNo, row.subject, row.requester?.fullName, row.requester?.mobile, row.category?.name, row.assignedTo?.fullName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(search.toLowerCase()) && (statusFilter === "All" || row.status === statusFilter);
      }),
    [rows, search, statusFilter],
  );

  const replaceRow = (updated: AdminSupportTicketRecord) => setRows((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  const closeModal = () => setModal(null);
  const isTerminal = (row: AdminSupportTicketRecord) => row.status === "CLOSED";

  const columns: TableColumn<AdminSupportTicketRecord>[] = [
    { key: "ticketNo", header: "Ticket No", render: (row) => <Typography variant="body2">{row.ticketNo}</Typography> },
    { key: "subject", header: "Subject", render: (row) => row.subject },
    { key: "requester", header: "Requester", render: (row) => row.requester?.fullName ?? "-" },
    { key: "category", header: "Category", render: (row) => row.category?.name ?? "-" },
    { key: "priority", header: "Priority", render: (row) => <Chip size="small" label={titleCase(row.priority)} color={priorityColor[row.priority]} /> },
    { key: "status", header: "Status", render: (row) => <StatusBadge value={titleCase(row.status)} /> },
    { key: "assignedTo", header: "Assigned To", render: (row) => row.assignedTo?.fullName ?? "Unassigned" },
    { key: "createdAt", header: "Created", render: (row) => formatDate(row.createdAt) },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <Stack direction="row" spacing={0.25}>
          {can("SUPPORT_TICKET_VIEW") ? (
            <Tooltip title="View">
              <IconButton size="small" onClick={() => setModal({ kind: "view", row })}>
                <VisibilityRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {can("SUPPORT_TICKET_ASSIGN") && !isTerminal(row) ? (
            <Tooltip title="Assign">
              <IconButton size="small" onClick={() => setModal({ kind: "assign", row })}>
                <AssignmentIndRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {can("SUPPORT_TICKET_REPLY") && !isTerminal(row) ? (
            <Tooltip title="Reply">
              <IconButton size="small" onClick={() => setModal({ kind: "reply", row })}>
                <ReplyRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {can("SUPPORT_TICKET_REPLY") ? (
            <Tooltip title="Add Internal Remark">
              <IconButton size="small" onClick={() => setModal({ kind: "remark", row })}>
                <RateReviewRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {can("SUPPORT_TICKET_EDIT") && !isTerminal(row) ? (
            <Tooltip title="Update Status">
              <IconButton size="small" onClick={() => setModal({ kind: "status", row })}>
                <UpdateRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {can("SUPPORT_TICKET_CLOSE") && !isTerminal(row) ? (
            <Tooltip title="Close Ticket">
              <IconButton size="small" color="error" onClick={() => setModal({ kind: "close", row })}>
                <HighlightOffRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
        </Stack>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Support Ticket Management" subtitle="Assignment, reply, status, and close workflow, sourced live from the admin API." />

      {loading ? (
        <Loader />
      ) : error ? (
        <Stack spacing={2}>
          <EmptyState title="Unable to load tickets" description={error} />
          <AppButton onClick={load} sx={{ alignSelf: "flex-start" }}>
            Retry
          </AppButton>
        </Stack>
      ) : (
        <Stack spacing={2}>
          <AppCard title="Filters" subtitle="Search and filter over the loaded ticket list.">
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <SearchFilter value={search} onChange={setSearch} placeholder="Search by ticket no, subject, requester, or assignee" />
              </Grid>
              <Grid item xs={12} md={4}>
                <AppInput select label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
                  <MenuItem value="All">All</MenuItem>
                  {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REOPENED"].map((status) => (
                    <MenuItem key={status} value={status}>
                      {titleCase(status)}
                    </MenuItem>
                  ))}
                </AppInput>
              </Grid>
            </Grid>
          </AppCard>
          {filteredRows.length ? <AppTable columns={columns} rows={filteredRows} /> : <EmptyState title="No tickets found" description="Try changing the search or status filter." />}
        </Stack>
      )}

      {modal?.kind === "assign" ? (
        <AssignModal
          row={modal.row}
          submitting={submitting}
          onClose={closeModal}
          onSubmit={async (input) => {
            setSubmitting(true);
            try {
              const response = await ticketService.assignTicket(modal.row.id, input);
              replaceRow(response.data);
              setToast({ message: `Ticket ${response.data.ticketNo} assigned.`, severity: "success" });
              closeModal();
            } catch {
              setToast({ message: "Assignment failed. Please try again.", severity: "error" });
            } finally {
              setSubmitting(false);
            }
          }}
        />
      ) : null}

      {modal?.kind === "reply" || modal?.kind === "remark" ? (
        <RemarkModal
          row={modal.row}
          title={modal.kind === "reply" ? "Reply to Requester" : "Add Internal Remark"}
          submitting={submitting}
          onClose={closeModal}
          onSubmit={async (remark) => {
            setSubmitting(true);
            try {
              if (modal.kind === "reply") {
                await ticketService.replyToTicket(modal.row.id, { remark, visibility: "public" });
              } else {
                await ticketService.addRemark(modal.row.id, { remark, visibility: "internal" });
              }
              setToast({ message: "Saved.", severity: "success" });
              closeModal();
              load();
            } catch {
              setToast({ message: "Save failed. Please try again.", severity: "error" });
            } finally {
              setSubmitting(false);
            }
          }}
        />
      ) : null}

      {modal?.kind === "status" ? (
        <StatusModal
          row={modal.row}
          submitting={submitting}
          onClose={closeModal}
          onSubmit={async (input) => {
            setSubmitting(true);
            try {
              const response = await ticketService.updateStatus(modal.row.id, input);
              replaceRow(response.data);
              setToast({ message: `Ticket ${response.data.ticketNo} status updated.`, severity: "success" });
              closeModal();
            } catch {
              setToast({ message: "Status update failed. Please try again.", severity: "error" });
            } finally {
              setSubmitting(false);
            }
          }}
        />
      ) : null}

      {modal?.kind === "close" ? (
        <RemarkModal
          row={modal.row}
          title="Close Ticket"
          required
          submitting={submitting}
          onClose={closeModal}
          onSubmit={async (remark) => {
            setSubmitting(true);
            try {
              const response = await ticketService.closeTicket(modal.row.id, remark);
              replaceRow(response.data);
              setToast({ message: `Ticket ${response.data.ticketNo} closed.`, severity: "success" });
              closeModal();
            } catch {
              setToast({ message: "Close failed. Please try again.", severity: "error" });
            } finally {
              setSubmitting(false);
            }
          }}
        />
      ) : null}

      {modal?.kind === "view" ? <TicketDetailModal row={modal.row} onClose={closeModal} /> : null}

      <ToastNotification open={Boolean(toast)} message={toast?.message ?? ""} severity={toast?.severity} onClose={() => setToast(null)} />
    </>
  );
}

function AssignModal({ row, submitting, onClose, onSubmit }: { row: AdminSupportTicketRecord; submitting: boolean; onClose: () => void; onSubmit: (input: AssignTicketInput) => void }) {
  const [assignedToUserId, setAssignedToUserId] = useState(row.assignedTo?.id ?? "");
  const [remark, setRemark] = useState("");

  return (
    <AppModal open onClose={onClose} title={`Assign — ${row.ticketNo}`}>
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          There is no user picker in this app yet — enter an existing numeric user id directly.
        </Typography>
        <AppInput label="Assigned User ID *" value={assignedToUserId} onChange={(event) => setAssignedToUserId(event.target.value)} disabled={submitting} />
        <AppInput label="Remark" multiline minRows={2} value={remark} onChange={(event) => setRemark(event.target.value)} disabled={submitting} />
        <DialogActions>
          <AppButton variant="text" onClick={onClose} disabled={submitting}>
            Cancel
          </AppButton>
          <AppButton
            disabled={submitting || !assignedToUserId.trim()}
            onClick={() => onSubmit({ assignedToUserId: Number(assignedToUserId), remark: remark.trim() || undefined })}
          >
            Assign
          </AppButton>
        </DialogActions>
      </Stack>
    </AppModal>
  );
}

function RemarkModal({
  row,
  title,
  required = false,
  submitting,
  onClose,
  onSubmit,
}: {
  row: AdminSupportTicketRecord;
  title: string;
  required?: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (remark: string) => void;
}) {
  const [remark, setRemark] = useState("");

  return (
    <AppModal open onClose={onClose} title={`${title} — ${row.ticketNo}`}>
      <Stack spacing={2}>
        <AppInput label={required ? "Remark *" : "Remark"} multiline minRows={3} value={remark} onChange={(event) => setRemark(event.target.value)} disabled={submitting} />
        <DialogActions>
          <AppButton variant="text" onClick={onClose} disabled={submitting}>
            Cancel
          </AppButton>
          <AppButton color={title === "Close Ticket" ? "error" : "primary"} disabled={submitting || (required && !remark.trim())} onClick={() => onSubmit(remark.trim())}>
            Submit
          </AppButton>
        </DialogActions>
      </Stack>
    </AppModal>
  );
}

function StatusModal({
  row,
  submitting,
  onClose,
  onSubmit,
}: {
  row: AdminSupportTicketRecord;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (input: { status: TicketStatusChangeValue; remark?: string }) => void;
}) {
  const [status, setStatus] = useState<TicketStatusChangeValue>((row.status as TicketStatusChangeValue) ?? "OPEN");
  const [remark, setRemark] = useState("");
  const remarkRequired = status === "CLOSED";

  return (
    <AppModal open onClose={onClose} title={`Update Status — ${row.ticketNo}`}>
      <Stack spacing={2}>
        <AppInput select label="Status" value={status} onChange={(event) => setStatus(event.target.value as TicketStatusChangeValue)} disabled={submitting}>
          {TICKET_STATUS_CHANGE_VALUES.map((value) => (
            <MenuItem key={value} value={value}>
              {titleCase(value)}
            </MenuItem>
          ))}
        </AppInput>
        <AppInput
          label={remarkRequired ? "Remark *" : "Remark"}
          multiline
          minRows={2}
          value={remark}
          onChange={(event) => setRemark(event.target.value)}
          disabled={submitting}
          helperText={remarkRequired ? "Required when closing." : undefined}
        />
        <DialogActions>
          <AppButton variant="text" onClick={onClose} disabled={submitting}>
            Cancel
          </AppButton>
          <AppButton disabled={submitting || (remarkRequired && !remark.trim())} onClick={() => onSubmit({ status, remark: remark.trim() || undefined })}>
            Update
          </AppButton>
        </DialogActions>
      </Stack>
    </AppModal>
  );
}

function TicketDetailModal({ row, onClose }: { row: AdminSupportTicketRecord; onClose: () => void }) {
  return (
    <AppModal open onClose={onClose} title={`Ticket ${row.ticketNo}`}>
      <Stack spacing={2.5}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">Requester</Typography>
            <Typography variant="body2">{row.requester?.fullName ?? "-"}</Typography>
            <Typography variant="body2" color="text.secondary">
              {row.requester?.mobile ?? "-"} {row.requester?.email ? `· ${row.requester.email}` : ""}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">Status / Priority</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <StatusBadge value={titleCase(row.status)} />
              <Chip size="small" label={titleCase(row.priority)} color={priorityColor[row.priority]} />
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">Category</Typography>
            <Typography variant="body2">{row.category?.name ?? "-"}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2">Assigned To</Typography>
            <Typography variant="body2">{row.assignedTo?.fullName ?? "Unassigned"}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Description</Typography>
            <Typography variant="body2">{row.description ?? "-"}</Typography>
          </Grid>
        </Grid>
        <Divider />
        <Stack spacing={1}>
          <Typography variant="subtitle2">Remarks / Replies</Typography>
          {row.remarks.length ? (
            row.remarks.map((remark) => (
              <Typography key={remark.id} variant="body2" color="text.secondary">
                {formatDate(remark.createdAt)} — [{remark.isAdminReply ? "admin reply" : remark.visibility}] {remark.remark}
              </Typography>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No remarks yet.
            </Typography>
          )}
        </Stack>
        <Stack spacing={1}>
          <Typography variant="subtitle2">Status History</Typography>
          {row.statusHistory.length ? (
            row.statusHistory.map((entry) => (
              <Typography key={entry.id} variant="body2" color="text.secondary">
                {formatDate(entry.createdAt)} — {entry.oldStatus ?? "—"} → {entry.newStatus} {entry.remarks ? `(${entry.remarks})` : ""}
              </Typography>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No status changes recorded.
            </Typography>
          )}
        </Stack>
      </Stack>
      <DialogActions>
        <AppButton variant="text" onClick={onClose}>
          Close
        </AppButton>
      </DialogActions>
    </AppModal>
  );
}
