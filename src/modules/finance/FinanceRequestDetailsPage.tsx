import { Grid, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { AppCard } from "../../components/common/AppCard";
import { Loader } from "../../components/common/Loader";
import { PageHeader } from "../../components/common/PageHeader";
import { RequestUpdatePanel } from "../../components/common/RequestUpdatePanel";
import { StatusBadge } from "../../components/common/StatusBadge";
import { ToastNotification } from "../../components/common/ToastNotification";
import { financeService } from "../../services/finance.service";
import type { InvoiceRecord, OptionItem, RefundRecord, TransactionRecord } from "../../types";

type FinanceDetailType = "transaction" | "invoice" | "refund";
type FinanceRecord = TransactionRecord | InvoiceRecord | RefundRecord;

function isFinanceDetailType(value: string | undefined): value is FinanceDetailType {
  return value === "transaction" || value === "invoice" || value === "refund";
}

export function FinanceRequestDetailsPage() {
  const { type, id = "" } = useParams();
  const [record, setRecord] = useState<FinanceRecord | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!isFinanceDetailType(type)) {
      return;
    }

    const loader =
      type === "transaction"
        ? financeService.getTransactionById(id)
        : type === "invoice"
          ? financeService.getInvoiceById(id)
          : financeService.getRefundById(id);

    loader.then((response) => setRecord(response.data));
  }, [id, type]);

  const statusOptions = useMemo<OptionItem[]>(() => {
    if (type === "transaction") {
      return [
        { label: "Success", value: "Success" },
        { label: "Pending", value: "Pending" },
        { label: "Failed", value: "Failed" },
      ];
    }

    if (type === "invoice") {
      return [
        { label: "Paid", value: "Paid" },
        { label: "Pending", value: "Pending" },
        { label: "Overdue", value: "Overdue" },
      ];
    }

    return [
      { label: "Requested", value: "Requested" },
      { label: "Processed", value: "Processed" },
      { label: "Rejected", value: "Rejected" },
    ];
  }, [type]);

  if (!isFinanceDetailType(type) || !record) {
    return <Loader />;
  }

  const title = type === "transaction" ? "Transaction Details" : type === "invoice" ? "Invoice Details" : "Refund Details";
  const currentStatus = record.status;
  const initialRemark = "Finance review in progress.";

  return (
    <>
      <PageHeader title={title} subtitle="Finance request details with remark and status controls." />
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <AppCard title={"id" in record ? record.id : id} subtitle={type}>
            {"user" in record ? <Typography>User: {record.user}</Typography> : null}
            {"amount" in record ? (
              <Typography>Amount: INR {record.amount.toLocaleString("en-IN")}</Typography>
            ) : null}
            {"paymentMethod" in record ? <Typography>Payment Method: {record.paymentMethod}</Typography> : null}
            {"gst" in record ? <Typography>GST: INR {record.gst.toLocaleString("en-IN")}</Typography> : null}
            {"reason" in record ? <Typography>Reason: {record.reason}</Typography> : null}
            {"date" in record ? <Typography>Date: {record.date}</Typography> : null}
            <StatusBadge value={currentStatus} />
          </AppCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <RequestUpdatePanel
            initialStatus={currentStatus}
            initialRemark={initialRemark}
            statusOptions={statusOptions}
            submitLabel="Update Finance Request"
            onSubmit={async (payload) => {
              await financeService.updateFinanceRequest(type, id, payload);
              setRecord((current) => (current ? { ...current, status: payload.status as FinanceRecord["status"] } : current));
              setToast("Finance request updated.");
            }}
          />
        </Grid>
      </Grid>
      <ToastNotification open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </>
  );
}
