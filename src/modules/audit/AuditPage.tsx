import { Grid, MenuItem, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { AppInput } from "../../components/common/AppInput";
import { AppTable } from "../../components/common/AppTable";
import { DateRangeFilter } from "../../components/common/DateRangeFilter";
import { EmptyState } from "../../components/common/EmptyState";
import { Loader } from "../../components/common/Loader";
import { PageHeader } from "../../components/common/PageHeader";
import { SearchFilter } from "../../components/common/SearchFilter";
import { auditService, type AuditLogRecord } from "../../services/audit.service";
import type { TableColumn } from "../../types";

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleString() : "-");

/**
 * Synonym groups `auditActionFilter()` in
 * 1SqrPropertyBackend/src/repositories/system.repository.ts recognizes for
 * the `action` filter — anything else is matched as a literal substring
 * instead, so this list is offered as convenient presets, not a closed
 * enum (the free-text search box below covers everything else).
 */
const ACTION_PRESETS = ["login", "logout", "create", "update", "delete", "approve", "reject", "block", "assign", "upload", "download", "export"];

const summarizeJson = (value: unknown) => {
  if (value === null || value === undefined) return "-";
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > 80 ? `${text.slice(0, 80)}…` : text;
};

export function AuditPage() {
  const [rows, setRows] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    auditService
      .getAuditLogs({
        limit: 100,
        page: 1,
        search: search || undefined,
        action: action === "All" ? undefined : action,
        dateFrom: from || undefined,
        dateTo: to || undefined,
      })
      .then((response) => setRows(response.data.items))
      .catch(() => setError("Unable to load audit logs from the server."))
      .finally(() => setLoading(false));
  }, [search, action, from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: TableColumn<AuditLogRecord>[] = [
    { key: "id", header: "Log ID", render: (row) => row.id },
    { key: "user", header: "User", render: (row) => row.user?.fullName ?? (row.userId ? `#${row.userId}` : "System") },
    { key: "action", header: "Action", render: (row) => row.action },
    { key: "entityName", header: "Module", render: (row) => row.entityName },
    { key: "entityId", header: "Entity ID", render: (row) => row.entityId ?? "-" },
    { key: "oldValues", header: "Old Value", render: (row) => <Typography variant="body2">{summarizeJson(row.oldValues)}</Typography> },
    { key: "newValues", header: "New Value", render: (row) => <Typography variant="body2">{summarizeJson(row.newValues)}</Typography> },
    { key: "ipAddress", header: "IP Address", render: (row) => row.ipAddress ?? "-" },
    { key: "createdAt", header: "Date Time", render: (row) => formatDate(row.createdAt) },
  ];

  return (
    <>
      <PageHeader title="Audit Logs" subtitle="Login, logout, create, update, delete, approve, reject, block, status change, and lead assignment history, sourced live from the admin API." />
      <Stack spacing={2}>
        <AppCard title="Filters" subtitle="Search, action, and date range filters.">
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <SearchFilter value={search} onChange={setSearch} placeholder="Search by action, module, entity id, or request id" />
              </Grid>
              <Grid item xs={12} md={6}>
                <AppInput select label="Action" value={action} onChange={(event) => setAction(event.target.value)}>
                  <MenuItem value="All">All</MenuItem>
                  {ACTION_PRESETS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </AppInput>
              </Grid>
            </Grid>
            <DateRangeFilter from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
          </Stack>
        </AppCard>
        {loading ? (
          <Loader />
        ) : error ? (
          <Stack spacing={2}>
            <EmptyState title="Unable to load audit logs" description={error} />
            <AppButton onClick={load} sx={{ alignSelf: "flex-start" }}>
              Retry
            </AppButton>
          </Stack>
        ) : rows.length ? (
          <AppTable columns={columns} rows={rows} />
        ) : (
          <EmptyState title="No audit logs found" description="Try changing the search, action, or date range." />
        )}
      </Stack>
    </>
  );
}
