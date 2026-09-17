import type { DashboardConfig, InvoiceRecord, RefundRecord, RevenueRecord, TransactionRecord } from "../types";

export const financeDashboardMock: DashboardConfig = {
  metrics: [
    { label: "Total Revenue", value: "INR 4.86Cr" },
    { label: "Monthly Revenue", value: "INR 68.4L" },
    { label: "Refund Requests", value: "18" },
    { label: "Pending Invoices", value: "42" },
  ],
  recentActivities: ["Invoice inv_5004 generated for Silver plan", "Refund ref_7002 processed", "Subscription revenue synced for May"],
};

export const transactionsMock: TransactionRecord[] = [
  { id: "txn_4001", user: "Ritu Shah", amount: 25999, paymentMethod: "UPI", status: "Success", date: "2026-06-08" },
  { id: "txn_4002", user: "Kabir Jain", amount: 12999, paymentMethod: "Credit Card", status: "Pending", date: "2026-06-07" },
  { id: "txn_4003", user: "Sowmya Rao", amount: 49999, paymentMethod: "Net Banking", status: "Success", date: "2026-06-06" },
];

export const invoicesMock: InvoiceRecord[] = [
  { id: "inv_5001", user: "Ritu Shah", amount: 25999, gst: 4680, status: "Paid", downloadUrl: "/mock/invoice/5001" },
  { id: "inv_5002", user: "Kabir Jain", amount: 12999, gst: 2340, status: "Pending", downloadUrl: "/mock/invoice/5002" },
  { id: "inv_5003", user: "Sowmya Rao", amount: 49999, gst: 9000, status: "Overdue", downloadUrl: "/mock/invoice/5003" },
];

export const refundsMock: RefundRecord[] = [
  { id: "ref_7001", user: "Kabir Jain", amount: 2000, reason: "Duplicate payment", status: "Requested" },
  { id: "ref_7002", user: "Global Retail LLP", amount: 12000, reason: "Plan downgrade adjustment", status: "Processed" },
];

export const revenueMock: RevenueRecord[] = [
  { plan: "Free", subscribers: 1480, revenue: 0 },
  { plan: "Silver", subscribers: 420, revenue: 5455800 },
  { plan: "Gold", subscribers: 185, revenue: 9248150 },
  { plan: "Enterprise", subscribers: 18, revenue: 18800000 },
];
