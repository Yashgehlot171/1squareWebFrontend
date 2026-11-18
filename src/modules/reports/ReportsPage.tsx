import { Grid, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { AppTable } from "../../components/common/AppTable";
import { DateRangeFilter } from "../../components/common/DateRangeFilter";
import { EmptyState } from "../../components/common/EmptyState";
import { Loader } from "../../components/common/Loader";
import { PageHeader } from "../../components/common/PageHeader";
import { ToastNotification } from "../../components/common/ToastNotification";
import { REPORT_TYPES, downloadBlob, reportService, type ReportRow, type ReportType } from "../../services/report.service";
import type { TableColumn } from "../../types";

const titleCase = (value: string) => value.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

/**
 * Column sets mirror `reportRepository.report()`'s per-type `select`/
 * `include` in 1SqrPropertyBackend/src/repositories/report.repository.ts —
 * each report `type` genuinely returns different fields, so this maps
 * type -> the columns that actually exist on that type's rows rather than
 * guessing one shared shape.
 */
const REPORT_COLUMNS: Record<ReportType, { key: string; label: string; render?: (row: ReportRow) => string }[]> = {
  customers: [
    { key: "id", label: "ID" },
    { key: "fullName", label: "Name" },
    { key: "mobile", label: "Mobile" },
    { key: "email", label: "Email" },
    { key: "selectedRole", label: "Role" },
    { key: "status", label: "Status" },
    { key: "createdAt", label: "Created", render: (row) => String(row.createdAt ?? "-") },
  ],
  brokers: [
    { key: "id", label: "ID" },
    { key: "fullName", label: "Name" },
    { key: "mobile", label: "Mobile" },
    { key: "email", label: "Email" },
    { key: "status", label: "Status" },
    { key: "createdAt", label: "Created" },
  ],
  properties: [
    { key: "id", label: "ID" },
    { key: "title", label: "Title" },
    { key: "status", label: "Status" },
    { key: "price", label: "Price" },
    { key: "ownerId", label: "Owner ID" },
    { key: "assignedAgentId", label: "Agent ID" },
    { key: "createdAt", label: "Created" },
  ],
  leads: [
    { key: "id", label: "ID" },
    { key: "leadNo", label: "Lead No" },
    { key: "name", label: "Name" },
    { key: "mobile", label: "Mobile" },
    { key: "leadStatus", label: "Status", render: (row) => String((row.leadStatus as { name?: string } | null)?.name ?? "-") },
    { key: "leadSource", label: "Source", render: (row) => String((row.leadSource as { name?: string } | null)?.name ?? "-") },
    { key: "createdAt", label: "Created" },
  ],
  construction: [
    { key: "id", label: "ID" },
    { key: "status", label: "Status" },
    { key: "package", label: "Package", render: (row) => String((row.package as { name?: string } | null)?.name ?? "-") },
    { key: "createdAt", label: "Created" },
  ],
  support: [
    { key: "id", label: "ID" },
    { key: "status", label: "Status" },
    { key: "category", label: "Category", render: (row) => String((row.category as { name?: string } | null)?.name ?? "-") },
    { key: "createdAt", label: "Created" },
  ],
  legal: [
    { key: "id", label: "ID" },
    { key: "legalStatus", label: "Status", render: (row) => String((row.legalStatus as { name?: string } | null)?.name ?? "-") },
    { key: "createdAt", label: "Created" },
  ],
  loan: [
    { key: "id", label: "ID" },
    { key: "loanStatus", label: "Status", render: (row) => String((row.loanStatus as { name?: string } | null)?.name ?? "-") },
    { key: "bank", label: "Bank", render: (row) => String((row.bank as { name?: string } | null)?.name ?? "-") },
    { key: "createdAt", label: "Created" },
  ],
  suppliers: [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "createdAt", label: "Created" },
  ],
  providers: [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "createdAt", label: "Created" },
  ],
};

export function ReportsPage() {
  const [type, setType] = useState<ReportType>("customers");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: "success" | "error" } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    reportService
      .getReport(type, { limit: 100, page: 1, dateFrom: from || undefined, dateTo: to || undefined })
      .then((response) => setRows(response.data.items))
      .catch(() => setError("Unable to load this report from the server."))
      .finally(() => setLoading(false));
  }, [type, from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: TableColumn<ReportRow>[] = useMemo(
    () =>
      REPORT_COLUMNS[type].map((column) => ({
        key: column.key,
        header: column.label,
        render: (row) => (column.render ? column.render(row) : String(row[column.key] ?? "-")),
      })),
    [type],
  );

  const handleExport = async (format: "csv" | "pdf") => {
    setExporting(true);
    try {
      const { blob, filename } = await reportService.exportReport(type, format, { dateFrom: from || undefined, dateTo: to || undefined });
      downloadBlob(blob, filename);
    } catch {
      setToast({ message: "Export failed. Please try again.", severity: "error" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Customer, broker, property, lead, construction, supplier, service provider, legal, loan, and support ticket reports."
        actions={
          <Stack direction="row" spacing={1}>
            <AppButton onClick={() => handleExport("csv")} disabled={exporting}>
              Export CSV
            </AppButton>
            <AppButton variant="outlined" onClick={() => handleExport("pdf")} disabled={exporting}>
              Export PDF
            </AppButton>
          </Stack>
        }
      />
      <Stack spacing={2}>
        <AppCard title="Report Filters" subtitle="Report type and date range.">
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField select fullWidth size="small" label="Report Type" value={type} onChange={(event) => setType(event.target.value as ReportType)}>
                  {REPORT_TYPES.map((option) => (
                    <MenuItem key={option} value={option}>
                      {titleCase(option)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={8}>
                <DateRangeFilter from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
              </Grid>
            </Grid>
          </Stack>
        </AppCard>
        {loading ? (
          <Loader />
        ) : error ? (
          <Stack spacing={2}>
            <EmptyState title="Unable to load report" description={error} />
            <AppButton onClick={load} sx={{ alignSelf: "flex-start" }}>
              Retry
            </AppButton>
          </Stack>
        ) : rows.length ? (
          <AppTable columns={columns} rows={rows} />
        ) : (
          <EmptyState title="No records found" description="Try a different date range." />
        )}
        <Typography variant="caption" color="text.secondary">
          Showing up to 100 most recent rows for this filter. Use Export for a larger result set (up to 5000 rows).
        </Typography>
      </Stack>
      <ToastNotification open={Boolean(toast)} message={toast?.message ?? ""} severity={toast?.severity} onClose={() => setToast(null)} />
    </>
  );
}
