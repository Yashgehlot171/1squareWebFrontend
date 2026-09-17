import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { IconButton, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { AppButton } from "../../components/common/AppButton";
import { AppTable } from "../../components/common/AppTable";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { EmptyState } from "../../components/common/EmptyState";
import { Loader } from "../../components/common/Loader";
import { PageHeader } from "../../components/common/PageHeader";
import { PermissionGuard } from "../../components/common/PermissionGuard";
import { SearchFilter } from "../../components/common/SearchFilter";
import { StatusBadge } from "../../components/common/StatusBadge";
import { ToastNotification } from "../../components/common/ToastNotification";
import { userService } from "../../services/user.service";
import type { TableColumn, UserRecord } from "../../types";
import { hasPermission } from "../../utils/permissions";

export function UsersPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [rows, setRows] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    userService.getUsers().then((response) => {
      setRows(response.data.items);
      setLoading(false);
    });
  }, []);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) =>
        [row.name, row.email, row.mobile, row.roleLabel].some((field) =>
          field.toLowerCase().includes(search.toLowerCase()),
        ),
      ),
    [rows, search],
  );

  const columns: TableColumn<UserRecord>[] = [
    { key: "id", header: "User ID", render: (row) => row.id },
    { key: "name", header: "Name", render: (row) => <Typography variant="body2">{row.name}</Typography> },
    { key: "email", header: "Email", render: (row) => row.email },
    { key: "mobile", header: "Mobile", render: (row) => row.mobile },
    { key: "role", header: "Role", render: (row) => row.roleLabel },
    { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> },
    { key: "created", header: "Created Date", render: (row) => row.createdDate },
    { key: "lastLogin", header: "Last Login", render: (row) => row.lastLogin },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton component={RouterLink} to={`/users/${row.id}`} size="small">
            <VisibilityRoundedIcon fontSize="small" />
          </IconButton>
          {user && hasPermission(user.permissions, "users.edit") ? (
            <IconButton component={RouterLink} to={`/users/${row.id}/edit`} size="small">
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          ) : null}
          {user && hasPermission(user.permissions, "users.delete") ? (
            <IconButton size="small" color="error" onClick={() => setSelectedUserId(row.id)}>
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          ) : null}
        </Stack>
      ),
    },
  ];

  const handleDelete = async () => {
    if (!selectedUserId) {
      return;
    }
    await userService.deleteUser(selectedUserId);
    setRows((current) => current.filter((row) => row.id !== selectedUserId));
    setSelectedUserId(null);
    setToast("User deleted from mock data view.");
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <PageHeader
        title="User Management"
        subtitle="User list, role assignment visibility, and permission-based actions."
        actions={
          <PermissionGuard permission="users.create">
            <AppButton component={RouterLink} to="/users/new" startIcon={<AddRoundedIcon />}>
              Add User
            </AppButton>
          </PermissionGuard>
        }
      />
      <Stack spacing={2}>
        <SearchFilter value={search} onChange={setSearch} placeholder="Search users by name, email, mobile, or role" />
        {filteredRows.length ? <AppTable columns={columns} rows={filteredRows} /> : <EmptyState title="No users found" description="Try a different search term." />}
      </Stack>
      <ConfirmDialog
        open={Boolean(selectedUserId)}
        title="Delete User"
        description="This action only updates the current mock view and keeps the service architecture intact."
        confirmText="Delete"
        onClose={() => setSelectedUserId(null)}
        onConfirm={handleDelete}
      />
      <ToastNotification open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </>
  );
}
