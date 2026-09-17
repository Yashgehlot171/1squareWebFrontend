import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Alert, Grid, MenuItem, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { PageHeader } from "../../components/common/PageHeader";
import { SearchFilter } from "../../components/common/SearchFilter";
import { ToastNotification } from "../../components/common/ToastNotification";
import { MasterDataTable } from "../masters/components/MasterDataTable";
import { MasterFormDialog } from "../masters/components/MasterFormDialog";
import { initialMasterRecords, masterConfigs } from "../masters/config/masterConfigs";
import type { MasterConfig, MasterRecord } from "../masters/types";

const createEmptyRecord = (config: MasterConfig): MasterRecord =>
  config.fields.reduce<MasterRecord>(
    (record, field) => {
      record[field.key] = field.type === "status" ? "Active" : field.type === "number" ? 0 : "";
      return record;
    },
    { id: `${config.key.toUpperCase()}-${Date.now()}`, status: "Active", createdDate: new Date().toISOString().slice(0, 10) },
  );

const recordValue = (record: MasterRecord, key: string) => (record[key] === null || record[key] === undefined ? "" : String(record[key]));

export function MasterManagementPage() {
  const navigate = useNavigate();
  const [activeMasterKey, setActiveMasterKey] = useState(masterConfigs[0].key);
  const [recordsByMaster, setRecordsByMaster] = useState<Record<string, MasterRecord[]>>(initialMasterRecords);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MasterRecord | null>(null);
  const [formRecord, setFormRecord] = useState<MasterRecord>({ id: "" });
  const [deleteRecord, setDeleteRecord] = useState<MasterRecord | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const activeConfig = masterConfigs.find((config) => config.key === activeMasterKey) ?? masterConfigs[0];
  const activeRecords = recordsByMaster[activeConfig.key] ?? [];

  const filteredRecords = useMemo(
    () =>
      activeRecords.filter((record) => {
        const matchesSearch =
          !search ||
          activeConfig.searchKeys.some((key) =>
            recordValue(record, key)
              .toLowerCase()
              .includes(search.toLowerCase()),
          );
        const matchesFilters = (activeConfig.filters ?? []).every((filter) => !filters[filter.key] || recordValue(record, filter.key) === filters[filter.key]);
        return matchesSearch && matchesFilters;
      }),
    [activeConfig, activeRecords, filters, search],
  );

  const updateActiveRecords = (updater: (rows: MasterRecord[]) => MasterRecord[]) => {
    setRecordsByMaster((current) => ({
      ...current,
      [activeConfig.key]: updater(current[activeConfig.key] ?? []),
    }));
  };

  const openCreate = () => {
    if (activeConfig.fullPageCreatePath) {
      navigate(activeConfig.fullPageCreatePath);
      return;
    }
    setError("");
    setEditingRecord(null);
    setFormRecord(createEmptyRecord(activeConfig));
    setDialogOpen(true);
  };

  const openEdit = (record: MasterRecord) => {
    if (activeConfig.fullPageCreatePath) {
      navigate(`/masters/construction-plans/${record.id}/edit`);
      return;
    }
    setError("");
    setEditingRecord(record);
    setFormRecord(record);
    setDialogOpen(true);
  };

  const saveRecord = () => {
    const missingField = activeConfig.fields.find((field) => field.required && !recordValue(formRecord, field.key));
    if (missingField) {
      setError(`${missingField.label} is required.`);
      return;
    }

    if (editingRecord) {
      updateActiveRecords((rows) => rows.map((row) => (row.id === editingRecord.id ? formRecord : row)));
      setToast(`${activeConfig.title} updated.`);
    } else {
      updateActiveRecords((rows) => [formRecord, ...rows]);
      setToast(`${activeConfig.title} created.`);
    }
    setDialogOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteRecord) {
      return;
    }
    updateActiveRecords((rows) => rows.filter((row) => row.id !== deleteRecord.id));
    setDeleteRecord(null);
    setToast(`${activeConfig.title} deleted.`);
  };

  const filterOptions = (filter: NonNullable<MasterConfig["filters"]>[number]) => (typeof filter.options === "function" ? filter.options(recordsByMaster) : filter.options);

  return (
    <>
      <PageHeader title="Masters" subtitle="Centralized configuration for location, property, finance, banners, construction plans, and future master data." />

      <Stack spacing={2}>
        {error ? <Alert severity="error" onClose={() => setError("")}>{error}</Alert> : null}

        <AppCard title="Master Directory" subtitle="Add a new master by adding one config entry. Tables, dialogs, search, filters, sorting, and pagination are reused.">
          <Tabs
            value={activeMasterKey}
            onChange={(_, value: string) => {
              setActiveMasterKey(value);
              setSearch("");
              setFilters({});
            }}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            {masterConfigs.map((config) => (
              <Tab key={config.key} value={config.key} label={config.title} />
            ))}
          </Tabs>
        </AppCard>

        <AppCard title={`${activeConfig.title} Master`} subtitle="Search, filter, create, edit, delete, sort, paginate, and manage active status from one reusable screen.">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={activeConfig.filters?.length ? 6 : 9}>
              <SearchFilter value={search} onChange={setSearch} placeholder={`Search ${activeConfig.title.toLowerCase()}`} />
            </Grid>
            {(activeConfig.filters ?? []).map((filter) => (
              <Grid item xs={12} md={3} key={filter.key}>
                <TextField select fullWidth size="small" label={filter.label} value={filters[filter.key] ?? ""} onChange={(event) => setFilters((current) => ({ ...current, [filter.key]: event.target.value }))}>
                  <MenuItem value="">All</MenuItem>
                  {filterOptions(filter).map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            ))}
            <Grid item xs={12} md={3}>
              <Stack direction="row" justifyContent="flex-end">
                <AppButton startIcon={<AddRoundedIcon />} onClick={openCreate}>
                  Add New
                </AppButton>
              </Stack>
            </Grid>
          </Grid>
        </AppCard>

        <MasterDataTable
          rows={filteredRecords}
          columns={activeConfig.columns}
          onEdit={openEdit}
          onDelete={setDeleteRecord}
          onToggleStatus={(record, status) => updateActiveRecords((rows) => rows.map((row) => (row.id === record.id ? { ...row, status } : row)))}
        />

        {!activeRecords.length ? (
          <Typography variant="caption" color="text.secondary">
            No data exists for this master yet.
          </Typography>
        ) : null}
      </Stack>

      <MasterFormDialog
        open={dialogOpen}
        mode={editingRecord ? "edit" : "create"}
        config={activeConfig}
        value={formRecord}
        recordsByMaster={recordsByMaster}
        onChange={setFormRecord}
        onClose={() => setDialogOpen(false)}
        onSubmit={saveRecord}
      />

      <ConfirmDialog
        open={Boolean(deleteRecord)}
        title="Delete master record"
        description="This action will remove the selected master record from the current admin view."
        confirmText="Delete"
        onClose={() => setDeleteRecord(null)}
        onConfirm={confirmDelete}
      />
      <ToastNotification open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </>
  );
}
