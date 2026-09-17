import AddRoundedIcon from "@mui/icons-material/AddRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { DialogActions, Grid, IconButton, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useAppSelector } from "../../app/hooks";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { AppInput } from "../../components/common/AppInput";
import { AppModal } from "../../components/common/AppModal";
import { AppTable } from "../../components/common/AppTable";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { PageHeader } from "../../components/common/PageHeader";
import { PermissionGuard } from "../../components/common/PermissionGuard";
import { SearchFilter } from "../../components/common/SearchFilter";
import { StatusBadge } from "../../components/common/StatusBadge";
import { ToastNotification } from "../../components/common/ToastNotification";
import type { Permission, TableColumn } from "../../types";
import { hasPermission } from "../../utils/permissions";

interface ManagementRecord {
  id: string;
  name: string;
  owner: string;
  status: string;
  category: string;
  updatedAt: string;
}

interface ManagementPageProps {
  title: string;
  subtitle: string;
  moduleKey: string;
  viewPermission: Permission;
  createPermission: Permission;
  editPermission: Permission;
  approvePermission?: Permission;
  blockPermission?: Permission;
  records: ManagementRecord[];
}

const statusOptions = ["Active", "Pending", "Approved", "Blocked", "In Progress"];

export function ManagementPage({
  title,
  subtitle,
  moduleKey,
  createPermission,
  editPermission,
  approvePermission,
  blockPermission,
  records,
}: ManagementPageProps) {
  const user = useAppSelector((state) => state.auth.user);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view" | null>(null);
  const [confirmAction, setConfirmAction] = useState<string>("");
  const [toast, setToast] = useState("");

  const filteredRows = useMemo(
    () =>
      records.filter((row) => {
        const matchesSearch = [row.id, row.name, row.owner, row.category].some((field) => field.toLowerCase().includes(search.toLowerCase()));
        const matchesStatus = status === "All" || row.status === status;
        return matchesSearch && matchesStatus;
      }),
    [records, search, status],
  );

  const handleConfirm = () => {
    setToast(`${confirmAction} completed in mock service.`);
    setConfirmAction("");
  };

  const columns: TableColumn<ManagementRecord>[] = [
    { key: "id", header: "ID", render: (row) => row.id },
    { key: "name", header: "Name", render: (row) => <Typography variant="body2">{row.name}</Typography> },
    { key: "owner", header: "Owner", render: (row) => row.owner },
    { key: "category", header: "Category", render: (row) => row.category },
    { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> },
    { key: "updatedAt", header: "Updated", render: (row) => row.updatedAt },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => setModalMode("view")}>
            <VisibilityRoundedIcon fontSize="small" />
          </IconButton>
          {user && hasPermission(user.permissions, editPermission) ? (
            <IconButton size="small" onClick={() => setModalMode("edit")}>
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          ) : null}
          {approvePermission && user && hasPermission(user.permissions, approvePermission) ? (
            <IconButton size="small" color="success" onClick={() => setConfirmAction(`Approve ${row.id}`)}>
              <CheckCircleOutlineRoundedIcon fontSize="small" />
            </IconButton>
          ) : null}
          {blockPermission && user && hasPermission(user.permissions, blockPermission) ? (
            <IconButton size="small" color="error" onClick={() => setConfirmAction(`Block ${row.id}`)}>
              <BlockRoundedIcon fontSize="small" />
            </IconButton>
          ) : null}
        </Stack>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <PermissionGuard permission={createPermission}>
            <AppButton startIcon={<AddRoundedIcon />} onClick={() => setModalMode("add")}>
              Add
            </AppButton>
          </PermissionGuard>
        }
      />
      <Stack spacing={2}>
        <AppCard title="Filters" subtitle="Search, status filtering, pagination, and backend-ready mock data.">
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <SearchFilter value={search} onChange={setSearch} placeholder={`Search ${title.toLowerCase()}`} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth size="small" label="Status" value={status} onChange={(event) => setStatus(event.target.value)}>
                {["All", ...statusOptions].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </AppCard>
        <AppTable columns={columns} rows={filteredRows} />
      </Stack>
      <AppModal open={Boolean(modalMode)} onClose={() => setModalMode(null)} title={`${modalMode === "add" ? "Add" : modalMode === "edit" ? "Edit" : "View"} ${title}`}>
        <Stack spacing={2}>
          <AppInput label="Name *" disabled={modalMode === "view"} defaultValue={`${moduleKey} record`} />
          <AppInput label="Owner *" disabled={modalMode === "view"} defaultValue="1Square Operations" />
          <TextField select fullWidth size="small" label="Status *" defaultValue="Active" disabled={modalMode === "view"}>
            {statusOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          {modalMode !== "view" ? (
            <DialogActions>
              <AppButton variant="text" onClick={() => setModalMode(null)}>
                Cancel
              </AppButton>
              <AppButton onClick={() => {
                setToast(`${title} saved in mock service.`);
                setModalMode(null);
              }}>
                Save
              </AppButton>
            </DialogActions>
          ) : null}
        </Stack>
      </AppModal>
      <ConfirmDialog
        open={Boolean(confirmAction)}
        title="Confirm sensitive action"
        description="This action is permission-controlled and will be sent to the backend service when integrated."
        onClose={() => setConfirmAction("")}
        onConfirm={handleConfirm}
      />
      <ToastNotification open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </>
  );
}
