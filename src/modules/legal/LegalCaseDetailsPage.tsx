import { Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppCard } from "../../components/common/AppCard";
import { Loader } from "../../components/common/Loader";
import { PageHeader } from "../../components/common/PageHeader";
import { RequestUpdatePanel } from "../../components/common/RequestUpdatePanel";
import { StatusBadge } from "../../components/common/StatusBadge";
import { ToastNotification } from "../../components/common/ToastNotification";
import { legalService } from "../../services/legal.service";
import type { LegalCaseRecord } from "../../types";

export function LegalCaseDetailsPage() {
  const { id = "" } = useParams();
  const [record, setRecord] = useState<LegalCaseRecord | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    legalService.getLegalCaseById(id).then((response) => setRecord(response.data));
  }, [id]);

  if (!record) {
    return <Loader />;
  }

  return (
    <>
      <PageHeader title="Legal Case Details" subtitle="Document review detail page for the legal team." />
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <AppCard title={record.id} subtitle={record.propertyId}>
            <Typography>Owner: {record.owner}</Typography>
            <Typography>Document Type: {record.documentType}</Typography>
            <Typography>Assigned To: {record.assignedTo}</Typography>
            <Typography>Remarks: {record.remarks}</Typography>
            <StatusBadge value={record.status} />
          </AppCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <RequestUpdatePanel
            initialStatus={record.status}
            initialRemark={record.remarks}
            statusOptions={[
              { label: "Pending", value: "Pending" },
              { label: "Approved", value: "Approved" },
              { label: "Rejected", value: "Rejected" },
              { label: "Need More Documents", value: "Need More Documents" },
            ]}
            submitLabel="Update Legal Request"
            onSubmit={async (payload) => {
              await legalService.updateLegalRequest(record.id, payload);
              setRecord((current) =>
                current
                  ? {
                      ...current,
                      status: payload.status as LegalCaseRecord["status"],
                      remarks: payload.remark,
                    }
                  : current,
              );
              setToast("Legal request updated.");
            }}
          />
        </Grid>
      </Grid>
      <ToastNotification open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </>
  );
}
