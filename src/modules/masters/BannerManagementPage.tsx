import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Alert, CircularProgress, Grid, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { PageHeader } from "../../components/common/PageHeader";
import { SearchFilter } from "../../components/common/SearchFilter";
import { ToastNotification } from "../../components/common/ToastNotification";
import { apiEndpoints } from "../../services/api/endpoints";
import { apiRequest } from "../../services/api/request";
import { bannerService, type BannerApiItem, type BannerMutationInput } from "../../services/banner.service";
import { ImageThumbnail } from "./components/ImageThumbnail";
import { MasterDataTable } from "./components/MasterDataTable";
import { MasterFormDialog } from "./components/MasterFormDialog";
import type { MasterColumnConfig, MasterConfig, MasterFieldConfig, MasterRecord } from "./types";

// Dedicated CRUD page for the real `/admin/banners` resource. Deliberately
// NOT registered in `masterConfigs.ts` / rendered by `MasterManagementPage` —
// Banner's contract (a dedicated `/:bannerId/status` toggle endpoint, a real
// GET-by-id, BANNER_* permissions) does not match the generic
// `MasterApiConfig` shape the shared master-directory tabs assume. This page
// reuses the same presentation primitives (`MasterDataTable`,
// `MasterFormDialog`, `StatusToggle` inside it) with a locally-scoped
// `MasterConfig`-shaped object that is never added to the shared
// `masterConfigs` array.

interface BannerTypeItem {
  id: number;
  name: string;
}

const toDateOnly = (iso: string) => (iso ? iso.slice(0, 10) : "");
const fieldToText = (value: MasterRecord[string]) => (value === null || value === undefined ? "" : String(value)).trim();
const toApiStatus = (status?: string): "active" | "inactive" => (status === "Inactive" ? "inactive" : "active");
const toDisplayStatus = (status: "active" | "inactive") => (status === "active" ? "Active" : "Inactive");

const bannerItemToRecord = (item: BannerApiItem): MasterRecord => ({
  id: item.id,
  bannerImageFileId: item.imageFileId ?? "",
  // Backend `present()` already resolves this to a real, publicly-fetchable
  // URL (`banner.imageFile?.fileUrl`) — not something the frontend needs to
  // construct. Dropped previously because nothing mapped it into the
  // record; used by both the list thumbnail column and the edit-mode form
  // preview (see `previewUrlKey` below).
  bannerImageUrl: item.imageUrl ?? "",
  bannerTitle: item.title,
  subtitle: item.subtitle ?? "",
  bannerTypeId: item.bannerTypeId != null ? String(item.bannerTypeId) : "",
  bannerTypeName: item.bannerType?.name ?? "",
  redirectUrl: item.redirectUrl ?? "",
  redirectType: item.redirectType ?? "",
  redirectValue: item.redirectValue ?? "",
  sortOrder: item.sortOrder ?? 0,
  status: toDisplayStatus(item.status),
  createdDate: toDateOnly(item.createdAt),
});

const buildMutation = (formValues: MasterRecord): BannerMutationInput => {
  const bannerTypeId = fieldToText(formValues.bannerTypeId);
  const imageFileId = fieldToText(formValues.bannerImageFileId);
  const redirectUrl = fieldToText(formValues.redirectUrl);
  const redirectType = fieldToText(formValues.redirectType);
  const redirectValue = fieldToText(formValues.redirectValue);
  return {
    title: fieldToText(formValues.bannerTitle),
    subtitle: fieldToText(formValues.subtitle) || undefined,
    bannerTypeId: bannerTypeId ? Number(bannerTypeId) : undefined,
    imageFileId: imageFileId || undefined,
    redirectUrl: redirectUrl || undefined,
    redirectType: redirectType || undefined,
    redirectValue: redirectValue || undefined,
    sortOrder: Number(fieldToText(formValues.sortOrder)) || 0,
    status: toApiStatus(String(formValues.status ?? "Active")),
  };
};

const columns: MasterColumnConfig[] = [
  { key: "bannerImageUrl", label: "Image", render: (record) => <ImageThumbnail src={fieldToText(record.bannerImageUrl) || null} alt={fieldToText(record.bannerTitle)} size={48} /> },
  { key: "bannerTitle", label: "Title", sortable: true },
  { key: "bannerTypeName", label: "Type" },
  { key: "sortOrder", label: "Order", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "createdDate", label: "Created Date", sortable: true },
];

export function BannerManagementPage() {
  const [records, setRecords] = useState<MasterRecord[]>([]);
  const [bannerTypes, setBannerTypes] = useState<BannerTypeItem[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MasterRecord | null>(null);
  const [formRecord, setFormRecord] = useState<MasterRecord>({ id: "", bannerImageFileId: "", bannerImageUrl: "", bannerTitle: "", subtitle: "", bannerTypeId: "", redirectUrl: "", redirectType: "", redirectValue: "", sortOrder: 0, status: "Active" });
  const [deleteRecord, setDeleteRecord] = useState<MasterRecord | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

  const fields: MasterFieldConfig[] = useMemo(
    () => [
      { key: "bannerImageFileId", label: "Banner Image", type: "image", uploadKind: "image", uploadModule: "banner", previewUrlKey: "bannerImageUrl" },
      { key: "bannerTitle", label: "Banner Title", required: true },
      { key: "subtitle", label: "Subtitle" },
      {
        key: "bannerTypeId",
        label: "Banner Type",
        type: "select",
        options: () => bannerTypes.map((type) => ({ value: String(type.id), label: type.name })),
      },
      { key: "redirectUrl", label: "Redirect URL" },
      { key: "redirectType", label: "Redirect Type" },
      { key: "redirectValue", label: "Redirect Value" },
      { key: "sortOrder", label: "Sort Order", type: "number" },
      { key: "status", label: "Status", type: "status" },
    ],
    [bannerTypes],
  );

  const bannerConfig: MasterConfig = useMemo(
    () => ({ key: "banner", title: "Banner", searchKeys: ["bannerTitle", "subtitle"], fields, columns, initialRows: [] }),
    [fields],
  );

  const loadBannerTypes = () =>
    // Public master lookup, same established pattern as
    // property.service.ts/lead.service.ts (`apiEndpoints.masters.byType`),
    // verified live against `/masters/banner-types` on 2026-09-18.
    apiRequest<{ items: BannerTypeItem[] }>({ url: apiEndpoints.masters.byType("banner-types"), method: "GET", params: { limit: 100 } })
      .then((response) => setBannerTypes(response.data.items))
      .catch(() => setBannerTypes([]));

  const loadRecords = () => {
    setLoading(true);
    setError("");
    return bannerService
      .list()
      .then((items) => setRecords(items.map(bannerItemToRecord)))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load banners."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBannerTypes();
    loadRecords();
  }, []);

  const filteredRecords = useMemo(
    () =>
      records.filter(
        (record) =>
          !search ||
          fieldToText(record.bannerTitle).toLowerCase().includes(search.toLowerCase()) ||
          fieldToText(record.subtitle).toLowerCase().includes(search.toLowerCase()),
      ),
    [records, search],
  );

  const openCreate = () => {
    setError("");
    setEditingRecord(null);
    setFormRecord({ id: "", bannerImageFileId: "", bannerImageUrl: "", bannerTitle: "", subtitle: "", bannerTypeId: "", redirectUrl: "", redirectType: "", redirectValue: "", sortOrder: 0, status: "Active" });
    setDialogOpen(true);
  };

  const openEdit = (record: MasterRecord) => {
    setError("");
    setEditingRecord(record);
    setFormRecord(record);
    setDialogOpen(true);
  };

  const saveRecord = async () => {
    if (!fieldToText(formRecord.bannerTitle)) {
      setError("Banner Title is required.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const input = buildMutation(formRecord);
      if (editingRecord) {
        const updated = await bannerService.update(editingRecord.id, input);
        setRecords((rows) => rows.map((row) => (row.id === updated.id ? bannerItemToRecord(updated) : row)));
        setToast("Banner updated.");
      } else {
        const created = await bannerService.create(input);
        setRecords((rows) => [bannerItemToRecord(created), ...rows]);
        setToast("Banner created.");
      }
      setDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save banner.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteRecord) return;
    setError("");
    setLoading(true);
    try {
      await bannerService.remove(deleteRecord.id);
      setRecords((rows) => rows.filter((row) => row.id !== deleteRecord.id));
      setToast("Banner deleted.");
      setDeleteRecord(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete banner.");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (record: MasterRecord, status: string) => {
    setError("");
    try {
      const updated = await bannerService.updateStatus(record.id, toApiStatus(status));
      setRecords((rows) => rows.map((row) => (row.id === updated.id ? bannerItemToRecord(updated) : row)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update banner status.");
    }
  };

  return (
    <>
      <PageHeader title="Banner Management" subtitle="Home/property/marketing banners shown across the buyer app. Live-wired to /admin/banners." />

      <Stack spacing={2}>
        {error ? <Alert severity="error" onClose={() => setError("")}>{error}</Alert> : null}

        <AppCard title="Banners" subtitle="Create, edit, delete, and manage active status for banners.">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={9}>
              <SearchFilter value={search} onChange={setSearch} placeholder="Search banners" />
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
            No banners exist yet.
          </Typography>
        ) : null}
      </Stack>

      <MasterFormDialog
        open={dialogOpen}
        mode={editingRecord ? "edit" : "create"}
        config={bannerConfig}
        value={formRecord}
        recordsByMaster={{}}
        onChange={setFormRecord}
        onClose={() => setDialogOpen(false)}
        onSubmit={saveRecord}
      />

      <ConfirmDialog
        open={Boolean(deleteRecord)}
        title="Delete banner"
        description="This will remove the selected banner record."
        confirmText="Delete"
        onClose={() => setDeleteRecord(null)}
        onConfirm={confirmDelete}
      />
      <ToastNotification open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </>
  );
}
