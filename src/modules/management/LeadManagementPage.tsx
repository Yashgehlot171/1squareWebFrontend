import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AssignmentIndRoundedIcon from "@mui/icons-material/AssignmentIndRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import EventRoundedIcon from "@mui/icons-material/EventRounded";
import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";
import RateReviewRoundedIcon from "@mui/icons-material/RateReviewRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import UpdateRoundedIcon from "@mui/icons-material/UpdateRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { Chip, DialogActions, Divider, Grid, IconButton, MenuItem, Stack, TextField, Tooltip, Typography } from "@mui/material";
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
  LEAD_ASSIGNMENT_TEAMS,
  LEAD_PRIORITIES,
  LEAD_STATUS_SLUGS,
  leadService,
  type AdminLeadRecord,
  type AssignLeadInput,
  type CreateLeadInput,
  type LeadAnalytics,
  type LeadAssignmentTeam,
  type LeadPriority,
  type LeadStatusSlug,
  type MasterListItem,
} from "../../services/lead.service";
import type { Permission, TableColumn } from "../../types";
import { hasPermission } from "../../utils/permissions";

const titleCase = (slug: string) => slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleString() : "-");

const formatCurrency = (value?: number | null) => (value === null || value === undefined ? "-" : `INR ${Number(value).toLocaleString("en-IN")}`);

type ModalState =
  | { kind: "create" }
  | { kind: "edit"; row: AdminLeadRecord }
  | { kind: "view"; row: AdminLeadRecord }
  | { kind: "assign"; row: AdminLeadRecord; mode: "assign" | "reassign" }
  | { kind: "status"; row: AdminLeadRecord }
  | { kind: "remark"; row: AdminLeadRecord }
  | { kind: "followup"; row: AdminLeadRecord }
  | { kind: "terminal"; row: AdminLeadRecord; action: "convert" | "close" };

const priorityColor: Record<string, "default" | "success" | "warning" | "error"> = {
  low: "success",
  medium: "default",
  high: "warning",
  urgent: "error",
};

export function LeadManagementPage() {
  const user = useAppSelector((state) => state.auth.user);
  const permissions = useMemo(() => user?.permissions ?? [], [user]);

  const [rows, setRows] = useState<AdminLeadRecord[]>([]);
  const [analytics, setAnalytics] = useState<LeadAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | LeadStatusSlug>("All");
  const [priorityFilter, setPriorityFilter] = useState<"All" | LeadPriority>("All");

  const [statusMasters, setStatusMasters] = useState<MasterListItem[]>([]);
  const [sourceMasters, setSourceMasters] = useState<MasterListItem[]>([]);

  const [modal, setModal] = useState<ModalState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: "success" | "error" } | null>(null);

  // Populated on demand when the View modal opens, since the list response
  // does not include assignments/activities/statusHistory (see
  // lead.service.ts's AdminLeadRecord doc comment).
  const [detail, setDetail] = useState<AdminLeadRecord | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadLeads = useCallback(() => {
    setLoading(true);
    setError("");
    leadService
      .getLeads({ limit: 100, page: 1 })
      .then((response) => {
        setRows(response.data.items);
        setAnalytics(response.data.analytics);
      })
      .catch(() => setError("Unable to load leads from the server."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  useEffect(() => {
    // Best-effort: live master-data display names for status/source. If this
    // fails the page still works using the fixed LEAD_STATUS_SLUGS enum and
    // raw slugs from lead rows, so failures here are swallowed rather than
    // surfaced as page-level errors.
    leadService
      .getLeadStatuses()
      .then((response) => setStatusMasters(response.data.items))
      .catch(() => undefined);
    leadService
      .getLeadSources()
      .then((response) => setSourceMasters(response.data.items))
      .catch(() => undefined);
  }, []);

  const statusLabel = useCallback(
    (slug: string) => statusMasters.find((item) => item.code === slug)?.name ?? titleCase(slug),
    [statusMasters],
  );

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const haystack = [row.leadNo, row.name, row.mobile, row.email, row.status?.name, row.source?.name, row.assignedTo?.fullName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const matchesSearch = haystack.includes(search.toLowerCase());
        const matchesStatus = statusFilter === "All" || row.status?.slug === statusFilter;
        const matchesPriority = priorityFilter === "All" || row.priority === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
      }),
    [rows, search, statusFilter, priorityFilter],
  );

  const replaceRow = (updated: AdminLeadRecord) => {
    setRows((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  };

  const closeModal = () => {
    setModal(null);
    setDetail(null);
  };

  const openView = (row: AdminLeadRecord) => {
    setModal({ kind: "view", row });
    setDetail(null);
    setDetailLoading(true);
    leadService
      .getLeadById(row.id)
      .then((response) => setDetail(response.data))
      .catch(() => setToast({ message: "Unable to load lead detail.", severity: "error" }))
      .finally(() => setDetailLoading(false));
  };

  return (
    <>
      <PageHeader
        title="Lead / Inquiry Dashboard"
        subtitle="Live lead pipeline, assignment, status, remark, follow-up and conversion workflow from the admin API."
        actions={
          user && hasPermission(permissions, "LEAD_CREATE") ? (
            <AppButton startIcon={<AddRoundedIcon />} onClick={() => setModal({ kind: "create" })}>
              Add Lead
            </AppButton>
          ) : undefined
        }
      />

      {loading ? (
        <Loader />
      ) : error ? (
        <Stack spacing={2}>
          <EmptyState title="Unable to load leads" description={error} />
          <AppButton onClick={loadLeads} sx={{ alignSelf: "flex-start" }}>
            Retry
          </AppButton>
        </Stack>
      ) : (
        <Stack spacing={2}>
          {analytics ? (
            <Grid container spacing={2}>
              {[
                { label: "Total Leads", value: analytics.leadCount },
                { label: "Calls", value: analytics.callCount },
                { label: "WhatsApp", value: analytics.whatsAppCount },
                { label: "Interested", value: analytics.interestedCount },
                { label: "Converted", value: analytics.convertedCount },
                { label: "Lost", value: analytics.lostCount },
                { label: "Avg Response (min)", value: analytics.averageResponseTimeMinutes },
              ].map((tile) => (
                <Grid item xs={6} md={3} lg={12 / 7} key={tile.label}>
                  <AppCard title={String(tile.value)} subtitle={tile.label} />
                </Grid>
              ))}
            </Grid>
          ) : null}

          <AppCard title="Filters" subtitle="Search and filter over the loaded lead list.">
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <SearchFilter value={search} onChange={setSearch} placeholder="Search by lead no, name, mobile, email, or assignee" />
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField select fullWidth size="small" label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
                  <MenuItem value="All">All</MenuItem>
                  {LEAD_STATUS_SLUGS.map((slug) => (
                    <MenuItem key={slug} value={slug}>
                      {statusLabel(slug)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6} md={3}>
                <TextField select fullWidth size="small" label="Priority" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as typeof priorityFilter)}>
                  <MenuItem value="All">All</MenuItem>
                  {LEAD_PRIORITIES.map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {titleCase(priority)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </AppCard>

          {filteredRows.length ? (
            <AppTable
              columns={buildColumns({ permissions, statusLabel, onView: openView, onAction: setModal })}
              rows={filteredRows}
            />
          ) : (
            <EmptyState title="No leads found" description="Try changing the search, status, or priority filter." />
          )}
        </Stack>
      )}

      {modal?.kind === "create" || modal?.kind === "edit" ? (
        <LeadFormModal
          mode={modal.kind}
          row={modal.kind === "edit" ? modal.row : undefined}
          sourceMasters={sourceMasters}
          submitting={submitting}
          onClose={closeModal}
          onSubmit={async (input) => {
            setSubmitting(true);
            try {
              if (modal.kind === "edit") {
                const response = await leadService.updateLead(modal.row.id, input);
                replaceRow(response.data);
                setToast({ message: `Lead ${response.data.leadNo} updated.`, severity: "success" });
              } else {
                const response = await leadService.createLead(input);
                setRows((current) => [response.data, ...current]);
                setToast({ message: `Lead ${response.data.leadNo} created.`, severity: "success" });
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

      {modal?.kind === "assign" ? (
        <AssignModal
          row={modal.row}
          mode={modal.mode}
          submitting={submitting}
          onClose={closeModal}
          onSubmit={async (input) => {
            setSubmitting(true);
            try {
              const response = modal.mode === "assign" ? await leadService.assignLead(modal.row.id, input) : await leadService.reassignLead(modal.row.id, input);
              replaceRow(response.data.lead);
              setToast({ message: `Lead ${response.data.lead.leadNo} ${modal.mode === "assign" ? "assigned" : "reassigned"}.`, severity: "success" });
              closeModal();
            } catch {
              setToast({ message: "Assignment failed. Please try again.", severity: "error" });
            } finally {
              setSubmitting(false);
            }
          }}
        />
      ) : null}

      {modal?.kind === "status" ? (
        <StatusModal
          row={modal.row}
          statusLabel={statusLabel}
          submitting={submitting}
          onClose={closeModal}
          onSubmit={async (input) => {
            setSubmitting(true);
            try {
              const response = await leadService.updateStatus(modal.row.id, input);
              replaceRow(response.data);
              setToast({ message: `Lead ${response.data.leadNo} status updated.`, severity: "success" });
              closeModal();
            } catch {
              setToast({ message: "Status update failed. Please try again.", severity: "error" });
            } finally {
              setSubmitting(false);
            }
          }}
        />
      ) : null}

      {modal?.kind === "remark" ? (
        <RemarkModal
          row={modal.row}
          submitting={submitting}
          onClose={closeModal}
          onSubmit={async (input) => {
            setSubmitting(true);
            try {
              await leadService.addRemark(modal.row.id, input);
              setToast({ message: `Remark added for ${modal.row.leadNo}.`, severity: "success" });
              closeModal();
            } catch {
              setToast({ message: "Failed to add remark. Please try again.", severity: "error" });
            } finally {
              setSubmitting(false);
            }
          }}
        />
      ) : null}

      {modal?.kind === "followup" ? (
        <FollowUpModal
          row={modal.row}
          submitting={submitting}
          onClose={closeModal}
          onSubmit={async (input) => {
            setSubmitting(true);
            try {
              await leadService.addFollowUp(modal.row.id, input);
              setToast({ message: `Follow-up scheduled for ${modal.row.leadNo}.`, severity: "success" });
              closeModal();
            } catch {
              setToast({ message: "Failed to schedule follow-up. Please try again.", severity: "error" });
            } finally {
              setSubmitting(false);
            }
          }}
        />
      ) : null}

      {modal?.kind === "terminal" ? (
        <TerminalActionModal
          row={modal.row}
          action={modal.action}
          submitting={submitting}
          onClose={closeModal}
          onSubmit={async (remark) => {
            setSubmitting(true);
            try {
              const response = modal.action === "convert" ? await leadService.convertLead(modal.row.id, remark) : await leadService.closeLead(modal.row.id, remark);
              replaceRow(response.data);
              setToast({ message: `Lead ${response.data.leadNo} ${modal.action === "convert" ? "converted" : "closed"}.`, severity: "success" });
              closeModal();
            } catch {
              setToast({ message: `${modal.action === "convert" ? "Conversion" : "Close"} failed. Please try again.`, severity: "error" });
            } finally {
              setSubmitting(false);
            }
          }}
        />
      ) : null}

      {modal?.kind === "view" ? <LeadDetailModal row={modal.row} detail={detail} loading={detailLoading} statusLabel={statusLabel} onClose={closeModal} /> : null}

      <ToastNotification open={Boolean(toast)} message={toast?.message ?? ""} severity={toast?.severity} onClose={() => setToast(null)} />
    </>
  );
}

function buildColumns({
  permissions,
  statusLabel,
  onView,
  onAction,
}: {
  permissions: Permission[];
  statusLabel: (slug: string) => string;
  onView: (row: AdminLeadRecord) => void;
  onAction: (state: ModalState) => void;
}): TableColumn<AdminLeadRecord>[] {
  const can = (permission: Permission) => hasPermission(permissions, permission);
  const isTerminal = (row: AdminLeadRecord) => ["closed", "lost", "converted"].includes(row.status?.slug ?? "");

  return [
    { key: "leadNo", header: "Lead No", render: (row) => <Typography variant="body2">{row.leadNo}</Typography> },
    { key: "name", header: "Name", render: (row) => row.name },
    { key: "mobile", header: "Mobile", render: (row) => row.mobile },
    { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status ? statusLabel(row.status.slug) : "Unknown"} /> },
    { key: "priority", header: "Priority", render: (row) => <Chip size="small" label={titleCase(row.priority ?? "medium")} color={priorityColor[row.priority ?? "medium"]} /> },
    { key: "source", header: "Source", render: (row) => row.source?.name ?? "-" },
    { key: "assignedTo", header: "Assigned To", render: (row) => row.assignedTo?.fullName ?? "Unassigned" },
    { key: "created", header: "Created", render: (row) => formatDate(row.createdAt) },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <Stack direction="row" spacing={0.25}>
          {can("LEAD_VIEW") ? (
            <Tooltip title="View">
              <IconButton size="small" onClick={() => onView(row)}>
                <VisibilityRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {can("LEAD_EDIT") ? (
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => onAction({ kind: "edit", row })}>
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {row.assignedTo ? (
            can("LEAD_REASSIGN") ? (
              <Tooltip title="Reassign">
                <IconButton size="small" onClick={() => onAction({ kind: "assign", row, mode: "reassign" })}>
                  <SwapHorizRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null
          ) : can("LEAD_ASSIGN") ? (
            <Tooltip title="Assign">
              <IconButton size="small" onClick={() => onAction({ kind: "assign", row, mode: "assign" })}>
                <AssignmentIndRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {can("LEAD_STATUS") && !isTerminal(row) ? (
            <Tooltip title="Update Status">
              <IconButton size="small" onClick={() => onAction({ kind: "status", row })}>
                <UpdateRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {can("LEAD_REMARK") ? (
            <Tooltip title="Add Remark">
              <IconButton size="small" onClick={() => onAction({ kind: "remark", row })}>
                <RateReviewRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {can("LEAD_EDIT") && !isTerminal(row) ? (
            <Tooltip title="Schedule Follow-up">
              <IconButton size="small" onClick={() => onAction({ kind: "followup", row })}>
                <EventRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {can("LEAD_STATUS") && !isTerminal(row) ? (
            <Tooltip title="Mark Converted">
              <IconButton size="small" color="success" onClick={() => onAction({ kind: "terminal", row, action: "convert" })}>
                <CheckCircleOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {can("LEAD_CLOSE") && !isTerminal(row) ? (
            <Tooltip title="Close Lead">
              <IconButton size="small" color="error" onClick={() => onAction({ kind: "terminal", row, action: "close" })}>
                <HighlightOffRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
        </Stack>
      ),
    },
  ];
}

function LeadFormModal({
  mode,
  row,
  sourceMasters,
  submitting,
  onClose,
  onSubmit,
}: {
  mode: "create" | "edit";
  row?: AdminLeadRecord;
  sourceMasters: MasterListItem[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: (input: CreateLeadInput) => void;
}) {
  const [name, setName] = useState(row?.name ?? "");
  const [mobile, setMobile] = useState(row?.mobile ?? "");
  const [email, setEmail] = useState(row?.email ?? "");
  const [message, setMessage] = useState(row?.message ?? "");
  const [leadSource, setLeadSource] = useState(row?.source?.slug ?? "manual-lead");
  const [budgetMin, setBudgetMin] = useState(row?.budgetMin?.toString() ?? "");
  const [budgetMax, setBudgetMax] = useState(row?.budgetMax?.toString() ?? "");
  const [priority, setPriority] = useState<LeadPriority>((row?.priority as LeadPriority) ?? "medium");
  const [nextAction, setNextAction] = useState(row?.nextAction ?? "");
  const [propertyId, setPropertyId] = useState(row?.property?.id ?? "");
  const [customerId, setCustomerId] = useState(row?.customer?.id ?? "");

  const canSubmit = name.trim() && mobile.trim();

  return (
    <AppModal open onClose={onClose} title={mode === "edit" ? `Edit Lead — ${row?.leadNo}` : "Add Lead"}>
      <Stack spacing={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <AppInput label="Name *" value={name} onChange={(event) => setName(event.target.value)} disabled={submitting} />
          </Grid>
          <Grid item xs={12} md={6}>
            <AppInput label="Mobile *" value={mobile} onChange={(event) => setMobile(event.target.value)} disabled={submitting} />
          </Grid>
          <Grid item xs={12} md={6}>
            <AppInput label="Email" value={email ?? ""} onChange={(event) => setEmail(event.target.value)} disabled={submitting} />
          </Grid>
          <Grid item xs={12} md={6}>
            <AppInput
              select
              label="Priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value as LeadPriority)}
              disabled={submitting}
            >
              {LEAD_PRIORITIES.map((option) => (
                <MenuItem key={option} value={option}>
                  {titleCase(option)}
                </MenuItem>
              ))}
            </AppInput>
          </Grid>
          <Grid item xs={12} md={6}>
            <AppInput
              label="Lead Source"
              value={leadSource}
              onChange={(event) => setLeadSource(event.target.value)}
              disabled={submitting}
              helperText={sourceMasters.length ? `Existing: ${sourceMasters.map((item) => item.code).join(", ")}. Free text auto-creates a new source.` : "Free text; backend auto-creates a new source if it doesn't exist."}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <AppInput label="Next Action" value={nextAction ?? ""} onChange={(event) => setNextAction(event.target.value)} disabled={submitting} />
          </Grid>
          <Grid item xs={6} md={3}>
            <AppInput label="Budget Min" type="number" value={budgetMin} onChange={(event) => setBudgetMin(event.target.value)} disabled={submitting} />
          </Grid>
          <Grid item xs={6} md={3}>
            <AppInput label="Budget Max" type="number" value={budgetMax} onChange={(event) => setBudgetMax(event.target.value)} disabled={submitting} />
          </Grid>
          <Grid item xs={6} md={3}>
            <AppInput
              label="Property ID"
              value={propertyId}
              onChange={(event) => setPropertyId(event.target.value)}
              disabled={submitting}
              helperText="Optional. Existing property id."
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <AppInput
              label="Customer ID"
              value={customerId}
              onChange={(event) => setCustomerId(event.target.value)}
              disabled={submitting}
              helperText="Optional. Existing user id."
            />
          </Grid>
          <Grid item xs={12}>
            <AppInput label="Message" multiline minRows={2} value={message ?? ""} onChange={(event) => setMessage(event.target.value)} disabled={submitting} />
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
                name: name.trim(),
                mobile: mobile.trim(),
                email: email.trim() || null,
                message: message.trim() || null,
                leadSource: leadSource.trim() || undefined,
                budgetMin: budgetMin ? Number(budgetMin) : null,
                budgetMax: budgetMax ? Number(budgetMax) : null,
                priority,
                nextAction: nextAction.trim() || null,
                propertyId: propertyId ? propertyId : null,
                customerId: customerId ? customerId : null,
              })
            }
          >
            {mode === "edit" ? "Save Changes" : "Create Lead"}
          </AppButton>
        </DialogActions>
      </Stack>
    </AppModal>
  );
}

function AssignModal({
  row,
  mode,
  submitting,
  onClose,
  onSubmit,
}: {
  row: AdminLeadRecord;
  mode: "assign" | "reassign";
  submitting: boolean;
  onClose: () => void;
  onSubmit: (input: AssignLeadInput) => void;
}) {
  const [assignedToId, setAssignedToId] = useState(row.assignedTo?.id ?? "");
  const [assignedTeam, setAssignedTeam] = useState<LeadAssignmentTeam | "">("");
  const [remarks, setRemarks] = useState("");

  const canSubmit = Boolean(assignedToId.trim() || assignedTeam);

  return (
    <AppModal open onClose={onClose} title={`${mode === "assign" ? "Assign" : "Reassign"} — ${row.leadNo}`}>
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Provide a user id, a team, or both. There is no user picker in this app yet — enter an existing user id directly.
        </Typography>
        <AppInput label="Assigned User ID" value={assignedToId} onChange={(event) => setAssignedToId(event.target.value)} disabled={submitting} />
        <AppInput select label="Assigned Team" value={assignedTeam} onChange={(event) => setAssignedTeam(event.target.value as LeadAssignmentTeam)} disabled={submitting}>
          <MenuItem value="">None</MenuItem>
          {LEAD_ASSIGNMENT_TEAMS.map((team) => (
            <MenuItem key={team} value={team}>
              {titleCase(team)}
            </MenuItem>
          ))}
        </AppInput>
        <AppInput label="Remarks" multiline minRows={2} value={remarks} onChange={(event) => setRemarks(event.target.value)} disabled={submitting} />
        <DialogActions>
          <AppButton variant="text" onClick={onClose} disabled={submitting}>
            Cancel
          </AppButton>
          <AppButton
            disabled={submitting || !canSubmit}
            onClick={() =>
              onSubmit({
                assignedToId: assignedToId.trim() || null,
                assignedTeam: assignedTeam || undefined,
                remarks: remarks.trim() || undefined,
              })
            }
          >
            {mode === "assign" ? "Assign" : "Reassign"}
          </AppButton>
        </DialogActions>
      </Stack>
    </AppModal>
  );
}

function StatusModal({
  row,
  statusLabel,
  submitting,
  onClose,
  onSubmit,
}: {
  row: AdminLeadRecord;
  statusLabel: (slug: string) => string;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (input: { status: LeadStatusSlug; remark?: string; visitDate?: string }) => void;
}) {
  const [status, setStatus] = useState<LeadStatusSlug>((row.status?.slug as LeadStatusSlug) ?? "new");
  const [remark, setRemark] = useState("");
  const [visitDate, setVisitDate] = useState("");

  const remarkRequired = ["closed", "lost", "converted"].includes(status);
  const visitDateRequired = status === "site-visit";
  const canSubmit = (!remarkRequired || remark.trim()) && (!visitDateRequired || visitDate);

  return (
    <AppModal open onClose={onClose} title={`Update Status — ${row.leadNo}`}>
      <Stack spacing={2}>
        <AppInput select label="Status" value={status} onChange={(event) => setStatus(event.target.value as LeadStatusSlug)} disabled={submitting}>
          {LEAD_STATUS_SLUGS.map((slug) => (
            <MenuItem key={slug} value={slug}>
              {statusLabel(slug)}
            </MenuItem>
          ))}
        </AppInput>
        {visitDateRequired ? (
          <AppInput
            label="Visit Date *"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={visitDate}
            onChange={(event) => setVisitDate(event.target.value)}
            disabled={submitting}
          />
        ) : null}
        <AppInput
          label={remarkRequired ? "Remark *" : "Remark"}
          multiline
          minRows={2}
          value={remark}
          onChange={(event) => setRemark(event.target.value)}
          disabled={submitting}
          helperText={remarkRequired ? "Required for Closed, Lost, and Converted." : undefined}
        />
        <DialogActions>
          <AppButton variant="text" onClick={onClose} disabled={submitting}>
            Cancel
          </AppButton>
          <AppButton
            disabled={submitting || !canSubmit}
            onClick={() =>
              onSubmit({
                status,
                remark: remark.trim() || undefined,
                visitDate: visitDate ? new Date(visitDate).toISOString() : undefined,
              })
            }
          >
            Update
          </AppButton>
        </DialogActions>
      </Stack>
    </AppModal>
  );
}

function RemarkModal({
  row,
  submitting,
  onClose,
  onSubmit,
}: {
  row: AdminLeadRecord;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (input: { remark: string; visibility?: "internal" | "public" }) => void;
}) {
  const [remark, setRemark] = useState("");
  const [visibility, setVisibility] = useState<"internal" | "public">("internal");

  return (
    <AppModal open onClose={onClose} title={`Add Remark — ${row.leadNo}`}>
      <Stack spacing={2}>
        <AppInput select label="Visibility" value={visibility} onChange={(event) => setVisibility(event.target.value as "internal" | "public")} disabled={submitting}>
          <MenuItem value="internal">Internal</MenuItem>
          <MenuItem value="public">Public</MenuItem>
        </AppInput>
        <AppInput label="Remark *" multiline minRows={3} value={remark} onChange={(event) => setRemark(event.target.value)} disabled={submitting} />
        <DialogActions>
          <AppButton variant="text" onClick={onClose} disabled={submitting}>
            Cancel
          </AppButton>
          <AppButton disabled={submitting || !remark.trim()} onClick={() => onSubmit({ remark: remark.trim(), visibility })}>
            Submit
          </AppButton>
        </DialogActions>
      </Stack>
    </AppModal>
  );
}

function FollowUpModal({
  row,
  submitting,
  onClose,
  onSubmit,
}: {
  row: AdminLeadRecord;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (input: { followUpAt: string; reminderAt?: string; priority?: LeadPriority; nextAction: string; notes?: string; assignedToId?: string }) => void;
}) {
  const [followUpAt, setFollowUpAt] = useState("");
  const [reminderAt, setReminderAt] = useState("");
  const [priority, setPriority] = useState<LeadPriority>((row.priority as LeadPriority) ?? "medium");
  const [nextAction, setNextAction] = useState(row.nextAction ?? "");
  const [notes, setNotes] = useState("");

  const canSubmit = followUpAt && nextAction.trim();

  return (
    <AppModal open onClose={onClose} title={`Schedule Follow-up — ${row.leadNo}`}>
      <Stack spacing={2}>
        <AppInput
          label="Follow-up At *"
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
          value={followUpAt}
          onChange={(event) => setFollowUpAt(event.target.value)}
          disabled={submitting}
        />
        <AppInput
          label="Reminder At"
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
          value={reminderAt}
          onChange={(event) => setReminderAt(event.target.value)}
          disabled={submitting}
        />
        <AppInput select label="Priority" value={priority} onChange={(event) => setPriority(event.target.value as LeadPriority)} disabled={submitting}>
          {LEAD_PRIORITIES.map((option) => (
            <MenuItem key={option} value={option}>
              {titleCase(option)}
            </MenuItem>
          ))}
        </AppInput>
        <AppInput label="Next Action *" value={nextAction} onChange={(event) => setNextAction(event.target.value)} disabled={submitting} />
        <AppInput label="Notes" multiline minRows={2} value={notes} onChange={(event) => setNotes(event.target.value)} disabled={submitting} />
        <DialogActions>
          <AppButton variant="text" onClick={onClose} disabled={submitting}>
            Cancel
          </AppButton>
          <AppButton
            disabled={submitting || !canSubmit}
            onClick={() =>
              onSubmit({
                followUpAt: new Date(followUpAt).toISOString(),
                reminderAt: reminderAt ? new Date(reminderAt).toISOString() : undefined,
                priority,
                nextAction: nextAction.trim(),
                notes: notes.trim() || undefined,
              })
            }
          >
            Schedule
          </AppButton>
        </DialogActions>
      </Stack>
    </AppModal>
  );
}

function TerminalActionModal({
  row,
  action,
  submitting,
  onClose,
  onSubmit,
}: {
  row: AdminLeadRecord;
  action: "convert" | "close";
  submitting: boolean;
  onClose: () => void;
  onSubmit: (remark: string) => void;
}) {
  const [remark, setRemark] = useState("");

  return (
    <AppModal open onClose={onClose} title={`${action === "convert" ? "Mark Converted" : "Close Lead"} — ${row.leadNo}`}>
      <Stack spacing={2}>
        <AppInput label="Remark *" multiline minRows={3} value={remark} onChange={(event) => setRemark(event.target.value)} disabled={submitting} />
        <DialogActions>
          <AppButton variant="text" onClick={onClose} disabled={submitting}>
            Cancel
          </AppButton>
          <AppButton color={action === "close" ? "error" : "primary"} disabled={submitting || !remark.trim()} onClick={() => onSubmit(remark.trim())}>
            Confirm
          </AppButton>
        </DialogActions>
      </Stack>
    </AppModal>
  );
}

function LeadDetailModal({
  row,
  detail,
  loading,
  statusLabel,
  onClose,
}: {
  row: AdminLeadRecord;
  detail: AdminLeadRecord | null;
  loading: boolean;
  statusLabel: (slug: string) => string;
  onClose: () => void;
}) {
  const record = detail ?? row;

  return (
    <AppModal open onClose={onClose} title={`Lead ${record.leadNo}`}>
      {loading && !detail ? (
        <Loader />
      ) : (
        <Stack spacing={2.5}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Contact</Typography>
              <Typography variant="body2">{record.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {record.mobile} {record.email ? `· ${record.email}` : ""}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Status / Priority</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <StatusBadge value={record.status ? statusLabel(record.status.slug) : "Unknown"} />
                <Chip size="small" label={titleCase(record.priority ?? "medium")} color={priorityColor[record.priority ?? "medium"]} />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Source</Typography>
              <Typography variant="body2">{record.source?.name ?? "-"}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Assigned To</Typography>
              <Typography variant="body2">{record.assignedTo?.fullName ?? "Unassigned"}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Budget</Typography>
              <Typography variant="body2">
                {formatCurrency(record.budgetMin)} — {formatCurrency(record.budgetMax)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Next Action</Typography>
              <Typography variant="body2">{record.nextAction ?? "-"}</Typography>
            </Grid>
            {record.property ? (
              <Grid item xs={12}>
                <Typography variant="subtitle2">Property</Typography>
                <Typography variant="body2">{record.property.title}</Typography>
              </Grid>
            ) : null}
            {record.message ? (
              <Grid item xs={12}>
                <Typography variant="subtitle2">Message</Typography>
                <Typography variant="body2">{record.message}</Typography>
              </Grid>
            ) : null}
          </Grid>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="subtitle2">Remarks (last 10)</Typography>
            {record.remarks.length ? (
              record.remarks.map((remark) => (
                <Typography key={remark.id} variant="body2" color="text.secondary">
                  {formatDate(remark.createdAt)} — [{remark.visibility}] {remark.remark}
                </Typography>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No remarks yet.
              </Typography>
            )}
          </Stack>

          <Stack spacing={1}>
            <Typography variant="subtitle2">Follow-ups (last 10)</Typography>
            {record.followUps.length ? (
              record.followUps.map((followUp) => (
                <Typography key={followUp.id} variant="body2" color="text.secondary">
                  {formatDate(followUp.followUpAt)} — {followUp.nextAction ?? "-"} ({followUp.status})
                </Typography>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No follow-ups scheduled.
              </Typography>
            )}
          </Stack>

          {detail?.statusHistory ? (
            <Stack spacing={1}>
              <Typography variant="subtitle2">Status History</Typography>
              {detail.statusHistory.length ? (
                detail.statusHistory.map((entry) => (
                  <Typography key={entry.id} variant="body2" color="text.secondary">
                    {formatDate(entry.createdAt)} — {entry.newStatus.name} {entry.remarks ? `(${entry.remarks})` : ""}
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No status changes recorded.
                </Typography>
              )}
            </Stack>
          ) : null}

          {detail?.assignments ? (
            <Stack spacing={1}>
              <Typography variant="subtitle2">Assignment History</Typography>
              {detail.assignments.length ? (
                detail.assignments.map((entry) => (
                  <Typography key={entry.id} variant="body2" color="text.secondary">
                    {formatDate(entry.assignedAt)} — {entry.assignedTeam ?? entry.assignedToId ?? "Unassigned"} ({entry.status})
                  </Typography>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No assignments recorded.
                </Typography>
              )}
            </Stack>
          ) : null}
        </Stack>
      )}
      <DialogActions>
        <AppButton variant="text" onClick={onClose}>
          Close
        </AppButton>
      </DialogActions>
    </AppModal>
  );
}
