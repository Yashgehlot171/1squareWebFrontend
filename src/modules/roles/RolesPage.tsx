import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import GridViewRoundedIcon from "@mui/icons-material/GridViewRounded";
import { IconButton, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { AppButton } from "../../components/common/AppButton";
import { AppTable } from "../../components/common/AppTable";
import { Loader } from "../../components/common/Loader";
import { PageHeader } from "../../components/common/PageHeader";
import { PermissionGuard } from "../../components/common/PermissionGuard";
import { StatusBadge } from "../../components/common/StatusBadge";
import { roleService } from "../../services/role.service";
import type { RoleDefinition, TableColumn } from "../../types";

export function RolesPage() {
  const [rows, setRows] = useState<RoleDefinition[]>([]);

  useEffect(() => {
    roleService.getRoles().then((response) => setRows(response.data.items));
  }, []);

  if (!rows.length) {
    return <Loader />;
  }

  const columns: TableColumn<RoleDefinition>[] = [
    { key: "name", header: "Role Name", render: (row) => row.name },
    { key: "description", header: "Description", render: (row) => row.description },
    { key: "permissions", header: "Permissions", render: (row) => row.permissions.length },
    { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <Stack direction="row" spacing={0.5}>
          <PermissionGuard permission="roles.edit">
            <IconButton component={RouterLink} to={`/roles/${row.id}/edit`} size="small">
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </PermissionGuard>
          <IconButton component={RouterLink} to="/roles/matrix" size="small">
            <GridViewRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Role Management"
        subtitle="Role list, create/edit routes, and permission visibility."
        actions={
          <PermissionGuard permission="roles.create">
            <AppButton component={RouterLink} to="/roles/new" startIcon={<AddRoundedIcon />}>
              Create Role
            </AppButton>
          </PermissionGuard>
        }
      />
      <AppTable columns={columns} rows={rows} />
    </>
  );
}
