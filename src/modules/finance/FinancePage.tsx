import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { Grid, IconButton, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { AppCard } from "../../components/common/AppCard";
import { AppTable } from "../../components/common/AppTable";
import { Loader } from "../../components/common/Loader";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { financeService } from "../../services/finance.service";
import type { DashboardConfig, InvoiceRecord, RefundRecord, RevenueRecord, TableColumn, TransactionRecord } from "../../types";

export function FinancePage() {
  const [dashboard, setDashboard] = useState<DashboardConfig | null>(null);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [refunds, setRefunds] = useState<RefundRecord[]>([]);
  const [revenue, setRevenue] = useState<RevenueRecord[]>([]);

  useEffect(() => {
    financeService.getFinanceDashboard().then((response) => setDashboard(response.data));
    financeService.getTransactions().then((response) => setTransactions(response.data.items));
    financeService.getInvoices().then((response) => setInvoices(response.data.items));
    financeService.getRefunds().then((response) => setRefunds(response.data.items));
    financeService.getSubscriptionRevenue().then((response) => setRevenue(response.data.items));
  }, []);

  if (!dashboard) {
    return <Loader />;
  }

  const transactionColumns: TableColumn<TransactionRecord>[] = [
    { key: "id", header: "Transaction ID", render: (row) => row.id },
    { key: "user", header: "User", render: (row) => row.user },
    { key: "amount", header: "Amount", render: (row) => `INR ${row.amount.toLocaleString("en-IN")}` },
    { key: "method", header: "Payment Method", render: (row) => row.paymentMethod },
    { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> },
    { key: "date", header: "Date", render: (row) => row.date },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <IconButton component={RouterLink} to={`/finance/transaction/${row.id}`} size="small">
          <VisibilityRoundedIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const invoiceColumns: TableColumn<InvoiceRecord>[] = [
    { key: "id", header: "Invoice ID", render: (row) => row.id },
    { key: "user", header: "User", render: (row) => row.user },
    { key: "amount", header: "Amount", render: (row) => `INR ${row.amount.toLocaleString("en-IN")}` },
    { key: "gst", header: "GST", render: (row) => `INR ${row.gst.toLocaleString("en-IN")}` },
    { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> },
    { key: "download", header: "Download", render: () => <Typography color="primary.main">Download</Typography> },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <IconButton component={RouterLink} to={`/finance/invoice/${row.id}`} size="small">
          <VisibilityRoundedIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const refundColumns: TableColumn<RefundRecord>[] = [
    { key: "id", header: "Refund ID", render: (row) => row.id },
    { key: "user", header: "User", render: (row) => row.user },
    { key: "amount", header: "Amount", render: (row) => `INR ${row.amount.toLocaleString("en-IN")}` },
    { key: "reason", header: "Reason", render: (row) => row.reason },
    { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <IconButton component={RouterLink} to={`/finance/refund/${row.id}`} size="small">
          <VisibilityRoundedIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const revenueColumns: TableColumn<RevenueRecord>[] = [
    { key: "plan", header: "Plan", render: (row) => row.plan },
    { key: "subscribers", header: "Subscribers", render: (row) => row.subscribers },
    { key: "revenue", header: "Revenue", render: (row) => `INR ${row.revenue.toLocaleString("en-IN")}` },
  ];

  return (
    <>
      <PageHeader title="Finance Management" subtitle="Payments, transactions, invoices, refunds, and subscription revenue." />
      <Grid container spacing={2} mb={2}>
        {dashboard.metrics.map((metric) => (
          <Grid item xs={12} sm={6} lg={3} key={metric.label}>
            <AppCard title={metric.value} subtitle={metric.label} />
          </Grid>
        ))}
      </Grid>
      <Stack spacing={2}>
        <AppCard title="Transactions" subtitle="Payment records">
          <AppTable columns={transactionColumns} rows={transactions} />
        </AppCard>
        <AppCard title="Invoices" subtitle="Invoice generation and status">
          <AppTable columns={invoiceColumns} rows={invoices} />
        </AppCard>
        <AppCard title="Refunds" subtitle="Refund processing queue">
          <AppTable columns={refundColumns} rows={refunds} />
        </AppCard>
        <AppCard title="Subscription Revenue" subtitle="Plan-wise revenue summary">
          <AppTable columns={revenueColumns} rows={revenue} />
        </AppCard>
      </Stack>
    </>
  );
}
