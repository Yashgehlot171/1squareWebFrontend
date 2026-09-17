import { Stack } from "@mui/material";
import { AppTable } from "../../components/common/AppTable";
import { PageHeader } from "../../components/common/PageHeader";
import { SearchFilter } from "../../components/common/SearchFilter";
import { auditLogData } from "../../mock/auditLogData";
import type { TableColumn } from "../../types";
import { useMemo, useState } from "react";

export function AuditPage() {
  const [search, setSearch] = useState("");
  const rows = useMemo(
    () => auditLogData.filter((row) => [row.id, row.userName, row.role, row.module, row.action, row.ipAddress].some((field) => field.toLowerCase().includes(search.toLowerCase()))),
    [search],
  );

  const columns: TableColumn<(typeof auditLogData)[number]>[] = [
    { key: "id", header: "Log ID", render: (row) => row.id },
    { key: "userName", header: "User Name", render: (row) => row.userName },
    { key: "role", header: "Role", render: (row) => row.role },
    { key: "module", header: "Module", render: (row) => row.module },
    { key: "action", header: "Action", render: (row) => row.action },
    { key: "oldValue", header: "Old Value", render: (row) => row.oldValue },
    { key: "newValue", header: "New Value", render: (row) => row.newValue },
    { key: "ipAddress", header: "IP Address", render: (row) => row.ipAddress },
    { key: "dateTime", header: "Date Time", render: (row) => row.dateTime },
  ];

  return (
    <>
      <PageHeader title="Audit Logs" subtitle="Login, logout, create, update, delete, approve, reject, block, status change, and lead assignment history." />
      <Stack spacing={2}>
        <SearchFilter value={search} onChange={setSearch} placeholder="Search audit logs" />
        <AppTable columns={columns} rows={rows} />
      </Stack>
    </>
  );
}
