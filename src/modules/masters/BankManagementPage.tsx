import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Alert, CircularProgress, Grid, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { PageHeader } from "../../components/common/PageHeader";
import { SearchFilter } from "../../components/common/SearchFilter";
import { ToastNotification } from "../../components/common/ToastNotification";
import { bankService, type BankApiItem, type BankMutationInput } from "../../services/bank.service";
import { MasterDataTable } from "./components/MasterDataTable";
import { MasterFormDialog } from "./components/MasterFormDialog";
import type { MasterColumnConfig, MasterConfig, MasterFieldConfig, MasterRecord } from "./types";

// Dedicated CRUD page for the real `/admin/loans/banks` resource. Deliberately
// NOT registered in `masterConfigs.ts` / rendered by `MasterManagementPage` —
// Banks' contract (boolean `isActive`, BANK_* permissions, a plain-array list
// response) does not match the generic `MasterApiConfig` shape that the
// shared master-directory tabs assume. This page reuses the same presentation
// primitives (`MasterDataTable`, `MasterFormDialog`, `StatusToggle` inside
// it) with a locally-scoped `MasterConfig`-shaped object that is never added
// to the shared `masterConfigs` array.

const toDateOnly = (iso: string) => (iso ? iso.slice(0, 10) : "");
const fieldToText = (value: MasterRecord[string]) => (value === null || value === undefined ? "" : String(value)).trim();
const toApiActive = (status?: string) => status !== "Inactive";
const toDisplayStatus = (isActive: boolean) => (isActive ? "Active" : "Inactive");

const bankItemToRecord = (item: BankApiItem): MasterRecord => ({
  id: item.id,
  bankName: item.name,
  logoFileId: item.logoFileId ?? "",
  interestRate: item.interestRate === null || item.interestRate === undefined ? "" : Number(item.interestRate),
  processingFee: item.processingFee === null || item.processingFee === undefined ? "" : Number(item.processingFee),
  status: toDisplayStatus(item.isActive),
  createdDate: toDateOnly(item.createdAt),
});

const buildMutation = (formValues: MasterRecord): BankMutationInput => {
  const interestRateText = fieldToText(formValues.interestRate);
  const processingFeeText = fieldToText(formValues.processingFee);
  const logoFileId = fieldToText(formValues.logoFileId);
  return {
    name: fieldToText(formValues.bankName),
    logoFileId: logoFileId || undefined,
    interestRate: interestRateText ? Number(interestRateText) : undefined,
    processingFee: processingFeeText ? Number(processingFeeText) : undefined,
    isActive: toApiActive(String(formValues.status ?? "Active")),
  };
};

const fields: MasterFieldConfig[] = [
  { key: "bankName", label: "Bank Name", required: true },
  // Bank logo uploads use the "loan" upload module — verified against
  // 1SqrPropertyBackend/src/validators/upload.validator.ts's `uploadModules`
  // enum, which has no "bank" entry; "loan" is the closest real module and
  // matches how bank logos are stored elsewhere in the domain (LoanBank).
  { key: "logoFileId", label: "Bank Logo", type: "image", uploadKind: "image", uploadModule: "loan" },
  { key: "interestRate", label: "Interest Rate (%)", type: "number" },
  { key: "processingFee", label: "Processing Fee", type: "number" },
  { key: "status", label: "Status", type: "status" },
];

const columns: MasterColumnConfig[] = [
  { key: "bankName", label: "Bank Name", sortable: true },
  { key: "interestRate", label: "Interest Rate (%)" },
  { key: "processingFee", label: "Processing Fee" },
  { key: "status", label: "Status", sortable: true },
  { key: "createdDate", label: "Created Date", sortable: true },
];

const bankConfig: MasterConfig = {
  key: "banks",
  title: "Bank",
  searchKeys: ["bankName"],
  fields,
  columns,
  initialRows: [],
};

const createEmptyRecord = (): MasterRecord => ({ id: "", bankName: "", logoFileId: "", interestRate: "", processingFee: "", status: "Active" });

export function BankManagementPage() {
  const [records, setRecords] = useState<MasterRecord[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MasterRecord | null>(null);
  const [formRecord, setFormRecord] = useState<MasterRecord>(createEmptyRecord());
  const [deleteRecord, setDeleteRecord] = useState<MasterRecord | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

  const loadRecords = () => {
    setLoading(true);
    setError("");
    return bankService
      .list()
      .then((items) => setRecords(items.map(bankItemToRecord)))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load banks."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const filteredRecords = useMemo(
    () => records.filter((record) => !search || fieldToText(record.bankName).toLowerCase().includes(search.toLowerCase())),
    [records, search],
  );

  const openCreate = () => {
    setError("");
    setEditingRecord(null);
    setFormRecord(createEmptyRecord());
    setDialogOpen(true);
  };

  const openEdit = (record: MasterRecord) => {
    setError("");
    setEditingRecord(record);
    setFormRecord(record);
    setDialogOpen(true);
  };

  const saveRecord = async () => {
    if (!fieldToText(formRecord.bankName)) {
      setError("Bank Name is required.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const input = buildMutation(formRecord);
      if (editingRecord) {
        const updated = await bankService.update(editingRecord.id, input);
        setRecords((rows) => rows.map((row) => (row.id === updated.id ? bankItemToRecord(updated) : row)));
        setToast("Bank updated.");
      } else {
        const created = await bankService.create(input);
        setRecords((rows) => [bankItemToRecord(created), ...rows]);
        setToast("Bank created.");
      }
      setDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save bank.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteRecord) return;
    setError("");
    setLoading(true);
    try {
      await bankService.remove(deleteRecord.id);
      setRecords((rows) => rows.filter((row) => row.id !== deleteRecord.id));
      setToast("Bank deleted.");
      setDeleteRecord(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete bank.");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (record: MasterRecord, status: string) => {
    setError("");
    try {
      const updated = await bankService.updateStatus(record.id, toApiActive(status));
      setRecords((rows) => rows.map((row) => (row.id === updated.id ? bankItemToRecord(updated) : row)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update bank status.");
    }
  };

  return (
    <>
      <PageHeader title="Bank Management" subtitle="Loan banks shown to buyers during the finance/loan journey. Live-wired to /admin/loans/banks." />

      <Stack spacing={2}>
        {error ? <Alert severity="error" onClose={() => setError("")}>{error}</Alert> : null}

        <AppCard title="Banks" subtitle="Create, edit, delete, and manage active status for loan banks.">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={9}>
              <SearchFilter value={search} onChange={setSearch} placeholder="Search banks" />
            </Grid>
            <Grid item xs={12} md={3}>
              <Stack direction="row" justifyContent="flex-end">
                <AppButton startIcon={<AddRoundedIcon />} onClick={openCreate} disabled={loading}>
                  Add New
                </AppButton>
              </Stack>
            </Grid>
          </Grid>
        </AppCard>

        {loading && !records.length ? (
          <Stack alignItems="center" py={4}>
            <CircularProgress size={28} />
          </Stack>
        ) : (
          <MasterDataTable rows={filteredRecords} columns={columns} onEdit={openEdit} onDelete={setDeleteRecord} onToggleStatus={toggleStatus} />
        )}

        {!loading && !records.length ? (
          <Typography variant="caption" color="text.secondary">
            No banks exist yet.
          </Typography>
        ) : null}
      </Stack>

      <MasterFormDialog
        open={dialogOpen}
        mode={editingRecord ? "edit" : "create"}
        config={bankConfig}
        value={formRecord}
        recordsByMaster={{}}
        onChange={setFormRecord}
        onClose={() => setDialogOpen(false)}
        onSubmit={saveRecord}
      />

      <ConfirmDialog
        open={Boolean(deleteRecord)}
        title="Delete bank"
        description="This will remove the selected bank record."
        confirmText="Delete"
        onClose={() => setDeleteRecord(null)}
        onConfirm={confirmDelete}
      />
      <ToastNotification open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </>
  );
}
