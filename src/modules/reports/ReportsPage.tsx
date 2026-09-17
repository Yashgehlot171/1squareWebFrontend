import { Grid, MenuItem, Stack, TextField } from "@mui/material";
import { useMemo, useState } from "react";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { AppTable } from "../../components/common/AppTable";
import { DateRangeFilter } from "../../components/common/DateRangeFilter";
import { PageHeader } from "../../components/common/PageHeader";
import { SearchFilter } from "../../components/common/SearchFilter";
import { StatusBadge } from "../../components/common/StatusBadge";
import { reportData } from "../../mock/reportData";
import type { TableColumn } from "../../types";

export function ReportsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [city, setCity] = useState("All");
  const [from, setFrom] = useState("2026-06-01");
  const [to, setTo] = useState("2026-06-26");

  const rows = useMemo(
    () =>
      reportData.filter((row) => {
        const matchesSearch = [row.id, row.name, row.category].some((field) => field.toLowerCase().includes(search.toLowerCase()));
        return matchesSearch && (status === "All" || row.status === status) && (city === "All" || row.city === city);
      }),
    [city, search, status],
  );

  const columns: TableColumn<(typeof reportData)[number]>[] = [
    { key: "id", header: "Report ID", render: (row) => row.id },
    { key: "name", header: "Report", render: (row) => row.name },
    { key: "category", header: "Category", render: (row) => row.category },
    { key: "city", header: "City", render: (row) => row.city },
    { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> },
    { key: "recordCount", header: "Records", render: (row) => row.recordCount },
    { key: "updatedAt", header: "Updated At", render: (row) => row.updatedAt },
  ];

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Customer, broker, property, lead, construction, supplier, service provider, and support ticket reports."
        actions={
          <Stack direction="row" spacing={1}>
            <AppButton>Export Excel</AppButton>
            <AppButton variant="outlined">Export PDF</AppButton>
          </Stack>
        }
      />
      <Stack spacing={2}>
        <AppCard title="Report Filters" subtitle="Date range, status, city, and report search filters.">
          <Stack spacing={2}>
            <DateRangeFilter from={from} to={to} onFromChange={setFrom} onToChange={setTo} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <SearchFilter value={search} onChange={setSearch} placeholder="Search reports" />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField select fullWidth size="small" label="Status" value={status} onChange={(event) => setStatus(event.target.value)}>
                  {["All", "Ready"].map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField select fullWidth size="small" label="City" value={city} onChange={(event) => setCity(event.target.value)}>
                  {["All", "Indore", "Bhopal", "Ujjain", "Dewas", "Rau", "Pithampur"].map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>
          </Stack>
        </AppCard>
        <AppTable columns={columns} rows={rows} />
      </Stack>
    </>
  );
}
