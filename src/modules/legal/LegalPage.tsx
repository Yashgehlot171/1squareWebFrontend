import GavelRoundedIcon from "@mui/icons-material/GavelRounded";
import NoteAddRoundedIcon from "@mui/icons-material/NoteAddRounded";
import RequestPageRoundedIcon from "@mui/icons-material/RequestPageRounded";
import { IconButton, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { AppTable } from "../../components/common/AppTable";
import { Loader } from "../../components/common/Loader";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { ToastNotification } from "../../components/common/ToastNotification";
import { legalService } from "../../services/legal.service";
import type { LegalCaseRecord, TableColumn } from "../../types";

export function LegalPage() {
  const [rows, setRows] = useState<LegalCaseRecord[]>([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    legalService.getLegalQueue().then((response) => setRows(response.data.items));
  }, []);

  if (!rows.length) {
    return <Loader />;
  }

  const columns: TableColumn<LegalCaseRecord>[] = [
    { key: "id", header: "Case ID", render: (row) => row.id },
    { key: "propertyId", header: "Property ID", render: (row) => row.propertyId },
    { key: "owner", header: "Owner", render: (row) => row.owner },
    { key: "documentType", header: "Document Type", render: (row) => row.documentType },
    { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> },
    { key: "assigned", header: "Assigned To", render: (row) => row.assignedTo },
    { key: "remarks", header: "Remarks", render: (row) => row.remarks },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton component={RouterLink} to={`/legal/${row.id}`} size="small">
            <GavelRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="warning" onClick={() => setToast(`Requested more documents for ${row.id}`)}>
            <RequestPageRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => setToast(`Legal note added for ${row.id}`)}>
            <NoteAddRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Legal Verification" subtitle="Legal queue, document reviews, remarks, and case actions." />
      <AppTable columns={columns} rows={rows} />
      <ToastNotification open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </>
  );
}
