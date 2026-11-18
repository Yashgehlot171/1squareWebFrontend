import {Alert, Button, Stack, Typography} from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import {useCallback, useEffect, useMemo, useState} from "react";
import {AppButton} from "../../components/common/AppButton";
import {AppCard} from "../../components/common/AppCard";
import {AppTable} from "../../components/common/AppTable";
import {EmptyState} from "../../components/common/EmptyState";
import {Loader} from "../../components/common/Loader";
import {PageHeader} from "../../components/common/PageHeader";
import {StatusBadge} from "../../components/common/StatusBadge";
import {propertyLeadPurchaseAdminService, type AdminLeadPurchase} from "../../services/propertyLeadPurchase.service";
import type {TableColumn} from "../../types";

function snapshotSummary(snapshot: Record<string, unknown> | null) {
  if (!snapshot) return "Not captured until successful payment confirmation";
  const budget = snapshot.budget as {min?:unknown;max?:unknown} | undefined;
  const area = snapshot.area as {min?:unknown;max?:unknown;unit?:unknown} | undefined;
  const localities = Array.isArray(snapshot.localities) ? snapshot.localities.map(item => typeof item === "object" && item !== null && "name" in item ? String(item.name) : "").filter(Boolean).join(", ") : "";
  return [localities, budget?.min || budget?.max ? `Budget ${String(budget.min ?? "—")}–${String(budget.max ?? "—")}` : "", area?.min || area?.max ? `Area ${String(area.min ?? "—")}–${String(area.max ?? "—")} ${String(area.unit ?? "")}` : "", typeof snapshot.purchaseTimeline === "string" ? snapshot.purchaseTimeline.replace(/_/g," ") : ""].filter(Boolean).join(" · ") || "Snapshot stored";
}

export function BuyerLeadPurchasesPage() {
  const [rows, setRows] = useState<AdminLeadPurchase[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(() => {
    setLoading(true); setError("");
    propertyLeadPurchaseAdminService.getPurchases({page,limit:100})
      .then(result => {setRows(result.items);setTotal(result.pagination.total);})
      .catch(reason => setError(reason instanceof Error ? reason.message : "Unable to load Buyer Lead purchases."))
      .finally(() => setLoading(false));
  }, [page]);
  useEffect(() => {load();}, [load]);
  const columns = useMemo<TableColumn<AdminLeadPurchase>[]>(() => [
    {key:"requirement",header:"Requirement",render:row=><Stack><Typography fontWeight={700}>{row.requirement.propertyType ?? "Property"} · {row.requirement.city ?? "—"}</Typography><Typography variant="caption">ID {row.requirementId}</Typography></Stack>},
    {key:"broker",header:"Broker",render:row=><Stack><Typography>{row.broker.name}</Typography><Typography variant="caption">{row.broker.companyName ?? `Broker ID ${row.broker.id}`}</Typography></Stack>},
    {key:"snapshot",header:"Frozen Requirement Context",render:row=><Typography variant="body2">{snapshotSummary(row.requirement.snapshot)}</Typography>},
    {key:"price",header:"Platform Price",render:row=>`${row.currency} ${row.price}`},
    {key:"status",header:"Status",render:row=><StatusBadge value={row.status.toLowerCase()}/>},
    {key:"payment",header:"Payment Reference",render:row=><Stack><Typography variant="body2">{row.paymentReference ?? "Not received"}</Typography><Typography variant="caption">{row.gatewayProvider ?? "Gateway not connected"}</Typography></Stack>},
    {key:"created",header:"Intent Created",render:row=>new Date(row.createdAt).toLocaleString()},
    {key:"purchased",header:"Purchased",render:row=>row.purchasedAt ? new Date(row.purchasedAt).toLocaleString() : "—"},
  ],[]);
  if (loading && !rows.length) return <Loader/>;
  return <Stack spacing={2}>
    <PageHeader title="Buyer Lead Purchases" subtitle="Read-only platform purchase monitoring. Buyer contact details are intentionally excluded." actions={<AppButton startIcon={<RefreshRoundedIcon/>} onClick={load}>Refresh</AppButton>}/>
    {error ? <Alert severity="error" action={<Button onClick={load}>Retry</Button>}>{error}</Alert> : null}
    <AppCard title="Purchase intents and entitlements" subtitle={`${total} records · Pending intents do not reserve a Broker slot.`}>
      {rows.length ? <><AppTable columns={columns} rows={rows}/><Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={2} mt={1}><Typography variant="caption">Page {page} · {total} records</Typography><Button disabled={page<=1} onClick={()=>setPage(value=>value-1)}>Previous</Button><Button disabled={page*100>=total} onClick={()=>setPage(value=>value+1)}>Next</Button></Stack></> : error ? null : <EmptyState title="No Buyer Lead purchase records" description="Purchase intents will appear here when Brokers start the purchase flow."/>}
    </AppCard>
  </Stack>;
}
