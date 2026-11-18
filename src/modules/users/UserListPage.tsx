import AddRoundedIcon from "@mui/icons-material/AddRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PauseCircleOutlineRoundedIcon from "@mui/icons-material/PauseCircleOutlineRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { Button, Chip, DialogActions, Grid, IconButton, MenuItem, Stack, Tooltip, Typography } from "@mui/material";
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
  userService,
  type AdminRoleOption,
  type AdminUserRecord,
  type AdminUserStatus,
  type CreateAdminUserInput,
  type UpdateAdminUserInput,
} from "../../services/user.service";
import type { Permission, TableColumn } from "../../types";
import { hasPermission } from "../../utils/permissions";

type ModalState =
  | { kind: "create" }
  | { kind: "edit"; row: AdminUserRecord }
  | { kind: "view"; row: AdminUserRecord }
  | { kind: "role"; row: AdminUserRecord };

const STATUS_ACTIONS: { status: AdminUserStatus; label: string; icon: typeof CheckCircleOutlineRoundedIcon; color: "success" | "warning" | "error" }[] = [
  { status: "active", label: "Activate", icon: CheckCircleOutlineRoundedIcon, color: "success" },
  { status: "inactive", label: "Deactivate", icon: PauseCircleOutlineRoundedIcon, color: "warning" },
  { status: "blocked", label: "Block", icon: BlockRoundedIcon, color: "error" },
];

export interface UserListPageProps {
  title: string;
  subtitle: string;
  /**
   * undefined = no role filter (all users). A single slug maps directly to
   * one `?role=` request. An array fires one request per slug and merges
   * client-side (see userService.getUsersByRoles doc comment for the
   * pagination caveat that comes with that).
   */
  roleFilter?: string | readonly string[];
  /**
   * Restricts which roles this screen's create / change-role pickers offer.
   * undefined = offer every role returned by GET /admin/roles.
   */
  assignableRoleSlugs?: readonly string[];
  viewPermission?: Permission;
  createPermission?: Permission;
  editPermission?: Permission;
  emptyTitle?: string;
}

export function UserListPage({
  title,
  subtitle,
  roleFilter,
  assignableRoleSlugs,
  viewPermission = "USER_VIEW",
  createPermission = "USER_CREATE",
  editPermission = "USER_EDIT",
  emptyTitle = "No users found",
}: UserListPageProps) {
  const authUser = useAppSelector((state) => state.auth.user);
  const permissions = useMemo(() => authUser?.permissions ?? [], [authUser]);
  const can = useCallback((permission: Permission) => hasPermission(permissions, permission), [permissions]);

  const [rows, setRows] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleOptions, setRoleOptions] = useState<AdminRoleOption[]>([]);

  const [modal, setModal] = useState<ModalState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: "success" | "error" } | null>(null);
  const [verificationTarget, setVerificationTarget] = useState<{ row: AdminUserRecord; status: "APPROVED" | "REJECTED" } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    const request = Array.isArray(roleFilter)
      ? userService.getUsersByRoles(roleFilter, { limit: 100, page: 1 })
      : userService.getUsers({ limit: 100, page: 1, role: roleFilter as string | undefined });
    request
      .then((response) => setRows(response.data.items))
      .catch(() => setError("Unable to load users from the server."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(roleFilter)]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    // Best-effort: only needed for the create/change-role pickers. Failures
    // here don't block the list itself, same pattern as
    // LeadManagementPage.tsx's status/source master fetches.
    userService
      .getAssignableRoles()
      .then((response) => {
        const options = assignableRoleSlugs ? response.data.filter((role) => assignableRoleSlugs.includes(role.slug)) : response.data;
        setRoleOptions(options);
      })
      .catch(() => undefined);
  }, [assignableRoleSlugs]);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const haystack = [row.id, row.name, row.email, row.mobile, row.selectedRole, ...row.roles.map((role) => role.name), ...row.roles.map((role) => role.slug)]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(search.toLowerCase());
      }),
    [rows, search],
  );

  const replaceRow = (updated: AdminUserRecord) => {
    setRows((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  };

  const closeModal = () => setModal(null);

  const handleStatusChange = async (row: AdminUserRecord, status: AdminUserStatus) => {
    setSubmitting(true);
    try {
      const response = await userService.updateUserStatus(row.id, status);
      replaceRow(response.data);
      setToast({ message: `${response.data.name ?? "User"} is now ${status}.`, severity: "success" });
    } catch {
      setToast({ message: "Status update failed. Please try again.", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBrokerVerification = async () => {
    if (!verificationTarget) return;
    setSubmitting(true);
    try {
      const response = await userService.updateBrokerVerification(verificationTarget.row.id, verificationTarget.status);
      replaceRow(response.data);
      setToast({ message: `${response.data.name ?? "Broker"} ${verificationTarget.status.toLowerCase()}.`, severity: "success" });
      setVerificationTarget(null);
    } catch {
      setToast({ message: "Broker verification update failed. Please try again.", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          authUser && can(createPermission) ? (
            <AppButton startIcon={<AddRoundedIcon />} onClick={() => setModal({ kind: "create" })}>
              Add User
            </AppButton>
          ) : undefined
        }
      />

      {loading ? (
        <Loader />
      ) : error ? (
        <Stack spacing={2}>
          <EmptyState title="Unable to load users" description={error} />
          <AppButton onClick={load} sx={{ alignSelf: "flex-start" }}>
            Retry
          </AppButton>
        </Stack>
      ) : (
        <Stack spacing={2}>
          <AppCard title="Filters" subtitle="Search across name, email, mobile, and role.">
            <SearchFilter value={search} onChange={setSearch} placeholder={`Search ${title.toLowerCase()}`} />
          </AppCard>

          {filteredRows.length ? (
            <AppTable
              columns={buildColumns({ can, viewPermission, editPermission, brokerList: roleFilter === "broker", onVerify: (row, status) => setVerificationTarget({ row, status }), onView: (row) => setModal({ kind: "view", row }), onEdit: (row) => setModal({ kind: "edit", row }), onRole: (row) => setModal({ kind: "role", row }), onStatus: handleStatusChange })}
              rows={filteredRows}
            />
          ) : (
            <EmptyState title={emptyTitle} description="Try a different search term." />
          )}
        </Stack>
      )}

      {modal?.kind === "create" ? (
        <UserFormModal
          mode="create"
          roleOptions={roleOptions}
          submitting={submitting}
          onClose={closeModal}
          onSubmit={async (input) => {
            setSubmitting(true);
            try {
              const response = await userService.createUser(input as CreateAdminUserInput);
              setRows((current) => [response.data, ...current]);
              setToast({ message: `${response.data.name ?? "User"} created.`, severity: "success" });
              closeModal();
            } catch {
              setToast({ message: "Create failed. Please check the fields and try again.", severity: "error" });
            } finally {
              setSubmitting(false);
            }
          }}
        />
      ) : null}

      {modal?.kind === "edit" ? (
        <UserFormModal
          mode="edit"
          row={modal.row}
          roleOptions={roleOptions}
          submitting={submitting}
          onClose={closeModal}
          onSubmit={async (input) => {
            setSubmitting(true);
            try {
              const response = await userService.updateUser(modal.row.id, input as UpdateAdminUserInput);
              replaceRow(response.data);
              setToast({ message: `${response.data.name ?? "User"} updated.`, severity: "success" });
              closeModal();
            } catch {
              setToast({ message: "Update failed. Please check the fields and try again.", severity: "error" });
            } finally {
              setSubmitting(false);
            }
          }}
        />
      ) : null}

      {modal?.kind === "role" ? (
        <RoleModal
          row={modal.row}
          roleOptions={roleOptions}
          submitting={submitting}
          onClose={closeModal}
          onSubmit={async (roleId) => {
            setSubmitting(true);
            try {
              const response = await userService.updateUserRole(modal.row.id, roleId);
              replaceRow(response.data);
              setToast({ message: `Role updated for ${response.data.name ?? "user"}.`, severity: "success" });
              closeModal();
            } catch {
              setToast({ message: "Role update failed. Please try again.", severity: "error" });
            } finally {
              setSubmitting(false);
            }
          }}
        />
      ) : null}

      {modal?.kind === "view" ? <UserDetailModal row={modal.row} onClose={closeModal} /> : null}

      {verificationTarget ? (
        <AppModal open onClose={() => setVerificationTarget(null)} title={verificationTarget.status === "APPROVED" ? "Approve Broker?" : "Reject Broker?"} maxWidth="xs">
          <Stack spacing={2}>
            <Typography>This will {verificationTarget.status === "APPROVED" ? "verify" : "reject"} this Broker account.</Typography>
            <DialogActions>
              <AppButton variant="text" onClick={() => setVerificationTarget(null)} disabled={submitting}>Cancel</AppButton>
              <AppButton color={verificationTarget.status === "APPROVED" ? "primary" : "error"} onClick={handleBrokerVerification} disabled={submitting}>
                {verificationTarget.status === "APPROVED" ? "Approve" : "Reject"}
              </AppButton>
            </DialogActions>
          </Stack>
        </AppModal>
      ) : null}

      <ToastNotification open={Boolean(toast)} message={toast?.message ?? ""} severity={toast?.severity} onClose={() => setToast(null)} />
    </>
  );
}

function buildColumns({
  can,
  viewPermission,
  editPermission,
  onView,
  onEdit,
  onRole,
  onStatus,
  brokerList,
  onVerify,
}: {
  can: (permission: Permission) => boolean;
  viewPermission: Permission;
  editPermission: Permission;
  onView: (row: AdminUserRecord) => void;
  onEdit: (row: AdminUserRecord) => void;
  onRole: (row: AdminUserRecord) => void;
  onStatus: (row: AdminUserRecord, status: AdminUserStatus) => void;
  brokerList: boolean;
  onVerify: (row: AdminUserRecord, status: "APPROVED" | "REJECTED") => void;
}): TableColumn<AdminUserRecord>[] {
  return [
    { key: "id", header: "User ID", render: (row) => row.id },
    { key: "name", header: "Name", render: (row) => <Typography variant="body2">{row.name ?? "-"}</Typography> },
    { key: "email", header: "Email", render: (row) => row.email ?? "-" },
    { key: "mobile", header: "Mobile", render: (row) => row.mobile ?? "-" },
    { key: "roles", header: "Role", render: (row) => (row.roles.length ? row.roles.map((role) => role.name).join(", ") : row.selectedRole ?? "-") },
    { key: "status", header: brokerList ? "Account Status" : "Status", render: (row) => <StatusBadge value={statusLabel(row.status)} /> },
    ...(brokerList ? [{
      key: "brokerVerification",
      header: "Broker Verification",
      render: (row: AdminUserRecord) => {
        const status = row.brokerProfile?.verificationStatus;
        const color = status === "APPROVED" ? "success" : status === "REJECTED" ? "error" : status === "PENDING" ? "warning" : "default";
        return <Chip size="small" label={status ? statusLabel(status) : "Unavailable"} color={color} sx={{ borderRadius: 999, fontWeight: 800 }} />;
      },
    }] : []),
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <Stack direction="row" spacing={0.25}>
          {brokerList && row.brokerProfile && row.brokerProfile.verificationStatus !== "APPROVED" && can(editPermission) ? (
            <>
              <Button size="small" onClick={() => onVerify(row, "APPROVED")}>Approve</Button>
              {row.brokerProfile.verificationStatus !== "REJECTED" ? <Button size="small" color="error" onClick={() => onVerify(row, "REJECTED")}>Reject</Button> : null}
            </>
          ) : null}
          {can(viewPermission) ? (
            <Tooltip title="View">
              <IconButton size="small" onClick={() => onView(row)}>
                <VisibilityRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {can(editPermission) ? (
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => onEdit(row)}>
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {can(editPermission) ? (
            <Tooltip title="Change Role">
              <IconButton size="small" onClick={() => onRole(row)}>
                <SwapHorizRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
          {can(editPermission)
            ? STATUS_ACTIONS.filter((action) => action.status !== row.status).map((action) => (
                <Tooltip key={action.status} title={action.label}>
                  <IconButton size="small" color={action.color} onClick={() => onStatus(row, action.status)}>
                    <action.icon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ))
            : null}
        </Stack>
      ),
    },
  ];
}

function statusLabel(value: string) {
  return value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function UserFormModal({
  mode,
  row,
  roleOptions,
  submitting,
  onClose,
  onSubmit,
}: {
  mode: "create" | "edit";
  row?: AdminUserRecord;
  roleOptions: AdminRoleOption[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: (input: CreateAdminUserInput | UpdateAdminUserInput) => void;
}) {
  const [name, setName] = useState(row?.name ?? "");
  const [email, setEmail] = useState(row?.email ?? "");
  const [mobile, setMobile] = useState(row?.mobile ?? "");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState<number | "">(roleOptions[0]?.id ?? "");
  const [cityId, setCityId] = useState(row?.cityId ? String(row.cityId) : "");

  const canSubmit = mode === "edit" ? Boolean(name.trim() || email.trim() || mobile.trim() || cityId.trim()) : Boolean(name.trim() && mobile.trim() && password.trim() && roleId);

  return (
    <AppModal open onClose={onClose} title={mode === "edit" ? `Edit User — ${row?.name ?? row?.id}` : "Add User"}>
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          There is no city picker wired to this form yet — enter a numeric city id directly.
        </Typography>
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
            <AppInput label="City ID" value={cityId} onChange={(event) => setCityId(event.target.value)} disabled={submitting} />
          </Grid>
          {mode === "create" ? (
            <>
              <Grid item xs={12} md={6}>
                <AppInput label="Password *" type="password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={submitting} />
              </Grid>
              <Grid item xs={12} md={6}>
                <AppInput
                  select
                  label="Role *"
                  value={roleId}
                  onChange={(event) => setRoleId(Number(event.target.value))}
                  disabled={submitting}
                  helperText={roleOptions.length ? undefined : "Loading roles from /admin/roles…"}
                >
                  {roleOptions.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name}
                    </MenuItem>
                  ))}
                </AppInput>
              </Grid>
            </>
          ) : null}
        </Grid>
        <DialogActions>
          <AppButton variant="text" onClick={onClose} disabled={submitting}>
            Cancel
          </AppButton>
          <AppButton
            disabled={submitting || !canSubmit}
            onClick={() =>
              mode === "create"
                ? onSubmit({
                    name: name.trim(),
                    mobile: mobile.trim(),
                    email: email.trim() || undefined,
                    password,
                    roleId: Number(roleId),
                    cityId: cityId.trim() ? Number(cityId) : undefined,
                  })
                : onSubmit({
                    name: name.trim() || undefined,
                    mobile: mobile.trim() || undefined,
                    email: email.trim() || undefined,
                    cityId: cityId.trim() ? Number(cityId) : undefined,
                  })
            }
          >
            {mode === "edit" ? "Save Changes" : "Create User"}
          </AppButton>
        </DialogActions>
      </Stack>
    </AppModal>
  );
}

function RoleModal({
  row,
  roleOptions,
  submitting,
  onClose,
  onSubmit,
}: {
  row: AdminUserRecord;
  roleOptions: AdminRoleOption[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: (roleId: number) => void;
}) {
  const [roleId, setRoleId] = useState<number | "">(row.roles[0]?.id ?? roleOptions[0]?.id ?? "");

  return (
    <AppModal open onClose={onClose} title={`Change Role — ${row.name ?? row.id}`}>
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          This replaces the user&apos;s current role entirely; it does not add a second role alongside it.
        </Typography>
        <AppInput select label="Role" value={roleId} onChange={(event) => setRoleId(Number(event.target.value))} disabled={submitting}>
          {roleOptions.map((role) => (
            <MenuItem key={role.id} value={role.id}>
              {role.name}
            </MenuItem>
          ))}
        </AppInput>
        <DialogActions>
          <AppButton variant="text" onClick={onClose} disabled={submitting}>
            Cancel
          </AppButton>
          <AppButton disabled={submitting || !roleId} onClick={() => onSubmit(Number(roleId))}>
            Update Role
          </AppButton>
        </DialogActions>
      </Stack>
    </AppModal>
  );
}

function UserDetailModal({ row, onClose }: { row: AdminUserRecord; onClose: () => void }) {
  return (
    <AppModal open onClose={onClose} title={row.name ?? row.id}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2">Contact</Typography>
          <Typography variant="body2">{row.email ?? "-"}</Typography>
          <Typography variant="body2" color="text.secondary">
            {row.mobile ?? "-"}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2">Status</Typography>
          <StatusBadge value={row.status} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2">RBAC Roles</Typography>
          <Typography variant="body2">{row.roles.length ? row.roles.map((role) => role.name).join(", ") : "None"}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2">Selected Role (mobile onboarding)</Typography>
          <Typography variant="body2">{row.selectedRole ?? "-"}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2">City ID</Typography>
          <Typography variant="body2">{row.cityId ?? "-"}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2">Profile Completed</Typography>
          <Typography variant="body2">{row.isProfileCompleted ? "Yes" : "No"}</Typography>
        </Grid>
        {row.brokerProfile ? (
          <Grid item xs={12}>
            <Typography variant="subtitle2">Broker Profile</Typography>
            <Typography variant="body2">
              {row.brokerProfile.companyName ?? "-"} · RERA: {row.brokerProfile.reraRegistrationNo ?? "-"} · GST: {row.brokerProfile.gstNumber ?? "-"} · Verification: {row.brokerProfile.verificationStatus}
            </Typography>
          </Grid>
        ) : null}
      </Grid>
      <DialogActions>
        <AppButton variant="text" onClick={onClose}>
          Close
        </AppButton>
      </DialogActions>
    </AppModal>
  );
}
