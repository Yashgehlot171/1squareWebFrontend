import { Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppCard } from "../../components/common/AppCard";
import { Loader } from "../../components/common/Loader";
import { PageHeader } from "../../components/common/PageHeader";
import { RequestUpdatePanel } from "../../components/common/RequestUpdatePanel";
import { StatusBadge } from "../../components/common/StatusBadge";
import { ToastNotification } from "../../components/common/ToastNotification";
import { ticketService } from "../../services/ticket.service";
import type { TicketRecord } from "../../types";

export function TicketDetailsPage() {
  const { id = "" } = useParams();
  const [record, setRecord] = useState<TicketRecord | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    ticketService.getTicketById(id).then((response) => setRecord(response.data));
  }, [id]);

  if (!record) {
    return <Loader />;
  }

  return (
    <>
      <PageHeader title="Ticket Details" subtitle="Support case details for action review." />
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <AppCard title={record.subject} subtitle={record.id}>
            <Typography>User: {record.user}</Typography>
            <Typography>Category: {record.category}</Typography>
            <Typography>Assigned To: {record.assignedTo}</Typography>
            <Typography>Created Date: {record.createdDate}</Typography>
            <StatusBadge value={record.priority} />
            <StatusBadge value={record.status} />
          </AppCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <RequestUpdatePanel
            initialStatus={record.status}
            initialRemark={`Follow-up on ${record.subject}`}
            statusOptions={[
              { label: "Open", value: "Open" },
              { label: "In Progress", value: "In Progress" },
              { label: "Escalated", value: "Escalated" },
              { label: "Closed", value: "Closed" },
            ]}
            submitLabel="Update Ticket"
            onSubmit={async (payload) => {
              await ticketService.updateTicketRequest(record.id, payload);
              setRecord((current) =>
                current
                  ? {
                      ...current,
                      status: payload.status as TicketRecord["status"],
                    }
                  : current,
              );
              setToast("Ticket update saved.");
            }}
          />
        </Grid>
      </Grid>
      <ToastNotification open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </>
  );
}
