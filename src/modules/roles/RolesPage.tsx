import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { Alert, CircularProgress, IconButton, Stack, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { AppButton } from "../../components/common/AppButton";
import { AppTable } from "../../components/common/AppTable";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { PageHeader } from "../../components/common/PageHeader";
import { PermissionGuard } from "../../components/common/PermissionGuard";
import { StatusBadge } from "../../components/common/StatusBadge";
import { ToastNotification } from "../../components/common/ToastNotification";
import { roleService, SUPER_ADMIN_ROLE_SLUG, type RoleApiItem } from "../../services/role.service";
import type { TableColumn } from "../../types";

export function RolesPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<RoleApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [deleteRole, setDeleteRole] = useState<RoleApiItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadRoles = () => {
    setLoading(true);
    setError("");
    return roleService
      .list()
      .then(setRows)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load roles."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const confirmDelete = async () => {
    if (!deleteRole) return;
    setDeleting(true);
    setError("");
    try {
      await roleService.remove(deleteRole.id);
      setRows((prev) => prev.filter((role) => role.id !== deleteRole.id));
      setToast("Role deleted.");
      setDeleteRole(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete role.");
    } finally {
      setDeleting(false);
    }
  };

  const columns: TableColumn<RoleApiItem>[] = [
    {
      key: "name",
      header: "Role Name",
      render: (row) =>
        row.slug === SUPER_ADMIN_ROLE_SLUG ? (
          <Stack direction="row" spacing={0.75} alignItems="center">
            <LockRoundedIcon fontSize="inherit" color="disabled" />
            <span>{row.name}</span>
          </Stack>
        ) : (
          row.name
        ),
    },
    { key: "description", header: "Description", render: (row) => row.description ?? "—" },
    { key: "permissions", header: "Permissions", render: (row) => row.permissions.length },
    { key: "status", header: "Status", render: (row) => <StatusBadge value={row.isActive ? "Active" : "Inactive"} /> },
    {
      key: "actions",
      header: "Actions",
      render: (row) => {
        const isSuperAdmin = row.slug === SUPER_ADMIN_ROLE_SLUG || row.isSystem;
        return (
          <Stack direction="row" spacing={0.5}>
            <PermissionGuard permission="ROLE_EDIT">
              <Tooltip title={isSuperAdmin ? "Protected system role — view only" : "Edit role"}>
                <span>
                  <IconButton component={RouterLink} to={`/roles/${row.id}/edit`} size="small">
                    <EditRoundedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </PermissionGuard>
            <PermissionGuard permission="PERMISSION_VIEW">
              <Tooltip title="Permission matrix">
                <IconButton component={RouterLink} to="/roles/matrix" size="small">
                  <GridViewRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </PermissionGuard>
            <PermissionGuard permission="ROLE_DELETE">
              <Tooltip title={isSuperAdmin ? "Super Admin cannot be deleted" : "Delete role"}>
                <span>
                  <IconButton size="small" disabled={isSuperAdmin} onClick={() => setDeleteRole(row)}>
                    <DeleteRoundedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </PermissionGuard>
          </Stack>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Role Management"
        subtitle="Role list, create/edit routes, and permission visibility. Live-wired to /admin/roles."
        actions={
          <PermissionGuard permission="ROLE_CREATE">
            <AppButton onClick={() => navigate("/roles/new")} startIcon={<AddRoundedIcon />}>
              Create Role
            </AppButton>
          </PermissionGuard>
        }
      />

      {error ? (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      {loading && !rows.length ? (
        <Stack alignItems="center" py={4}>
          <CircularProgress size={28} />
        </Stack>
      ) : (
        <AppTable columns={columns} rows={rows} />
      )}

      <ConfirmDialog
        open={Boolean(deleteRole)}
        title="Delete role"
        description={`This will permanently remove the "${deleteRole?.name ?? ""}" role. This action cannot be undone.`}
        confirmText={deleting ? "Deleting…" : "Delete"}
        onClose={() => setDeleteRole(null)}
        onConfirm={confirmDelete}
      />
      <ToastNotification open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </>
  );
}
