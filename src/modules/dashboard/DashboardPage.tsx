import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { Avatar, Grid, List, ListItem, ListItemText, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { useAppSelector } from "../../app/hooks";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { EmptyState } from "../../components/common/EmptyState";
import { Loader } from "../../components/common/Loader";
import { PageHeader } from "../../components/common/PageHeader";
import { dashboardService, type DashboardSummary } from "../../services/dashboard.service";
import { leadService, type MasterListItem } from "../../services/lead.service";

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleString() : "-");

const titleCase = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <Grid item xs={12} sm={6} md={4} lg={2.4}>
      <AppCard title={String(value)} subtitle={label}>
        <Stack direction="row" alignItems="center" justifyContent="flex-end">
          <Avatar sx={{ bgcolor: "primary.light", color: "primary.main" }}>
            <TrendingUpRoundedIcon />
          </Avatar>
        </Stack>
      </AppCard>
    </Grid>
  );
}

function statusBreakdown(map: Record<string, number>, resolveLabel?: (key: string) => string) {
  return Object.entries(map).map(([key, value]) => ({ label: resolveLabel ? resolveLabel(key) : titleCase(key), value }));
}

export function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [leadStatusMasters, setLeadStatusMasters] = useState<MasterListItem[]>([]);
  const [legalStatusMasters, setLegalStatusMasters] = useState<MasterListItem[]>([]);
  const [loanStatusMasters, setLoanStatusMasters] = useState<MasterListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    dashboardService
      .getSummary()
      .then((response) => setSummary(response.data))
      .catch(() => setError("Unable to load the dashboard from the server."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    // Best-effort id -> name lookups for the leads/legal/loan count maps,
    // which the backend keys by numeric master id rather than slug/name
    // (see dashboard.service.ts's DashboardSummary doc comment). Failures
    // here fall back to raw numeric ids rather than blocking the page.
    leadService.getLeadStatuses().then((response) => setLeadStatusMasters(response.data.items)).catch(() => undefined);
    dashboardService.getStatusMasters("legal-statuses").then((response) => setLegalStatusMasters(response.data.items)).catch(() => undefined);
    dashboardService.getStatusMasters("loan-statuses").then((response) => setLoanStatusMasters(response.data.items)).catch(() => undefined);
  }, []);

  const resolveMasterLabel = (masters: MasterListItem[], id: string) => masters.find((item) => String(item.id) === id)?.name ?? `#${id}`;

  if (loading) {
    return <Loader />;
  }

  if (error || !summary) {
    return (
      <Stack spacing={2}>
        <EmptyState title="Unable to load dashboard" description={error || "No data returned."} />
        <AppButton onClick={load} sx={{ alignSelf: "flex-start" }}>
          Retry
        </AppButton>
      </Stack>
    );
  }

  const sections: [string, { id: string; primary: string; secondary: string }[]][] = [
    [
      "Recent Leads",
      summary.recentLeads.map((row) => ({ id: row.id, primary: `${row.name} — ${row.leadNo}`, secondary: row.leadStatus?.name ?? "" })),
    ],
    [
      "Recent Properties",
      summary.recentProperties.map((row) => ({ id: row.id, primary: row.title, secondary: titleCase(row.status) })),
    ],
    [
      "Pending Property Approvals",
      summary.pendingApprovals.map((row) => ({ id: row.id, primary: row.title, secondary: titleCase(row.status) })),
    ],
    [
      "Today's Follow-ups",
      summary.todaysFollowUps.map((row) => ({ id: row.id, primary: row.nextAction ?? `Lead ${row.leadId}`, secondary: formatDate(row.followUpAt) })),
    ],
    [
      "Recent Audit Activities",
      summary.recentActivities.map((row) => ({ id: row.id, primary: `${row.action} — ${row.entityName}`, secondary: formatDate(row.createdAt) })),
    ],
  ];

  return (
    <>
      <PageHeader title={`${user?.roleLabel ?? "Admin"} Dashboard`} subtitle="Live 1Square Property operational dashboard, sourced from the admin API." />
      <Grid container spacing={2}>
        <StatTile label="Total Customers" value={summary.customers.total} />
        <StatTile label="Active Customers" value={summary.customers.active} />
        <StatTile label="Blocked Customers" value={summary.customers.blocked} />
        <StatTile label="Total Brokers" value={summary.brokers.total} />
        <StatTile label="Verified Brokers" value={summary.brokers.verified} />
        <StatTile label="Pending Brokers" value={summary.brokers.pending} />
        <StatTile label="Material Suppliers" value={summary.materialSuppliers} />
        <StatTile label="Service Providers" value={summary.serviceProviders} />
        <StatTile label="Notifications" value={summary.notifications} />
      </Grid>

      <Grid container spacing={2} mt={0.5}>
        <Grid item xs={12} md={6} xl={4}>
          <AppCard title="Properties by Status" subtitle="Live counts from the admin API">
            <Stack spacing={1}>
              {statusBreakdown(summary.properties).map((row) => (
                <Stack key={row.label} direction="row" justifyContent="space-between">
                  <Typography variant="body2">{row.label}</Typography>
                  <Typography variant="body2" fontWeight={700}>{row.value}</Typography>
                </Stack>
              ))}
            </Stack>
          </AppCard>
        </Grid>
        <Grid item xs={12} md={6} xl={4}>
          <AppCard title="Leads by Status" subtitle="Live counts from the admin API">
            <Stack spacing={1}>
              {statusBreakdown(summary.leads, (id) => resolveMasterLabel(leadStatusMasters, id)).map((row) => (
                <Stack key={row.label} direction="row" justifyContent="space-between">
                  <Typography variant="body2">{row.label}</Typography>
                  <Typography variant="body2" fontWeight={700}>{row.value}</Typography>
                </Stack>
              ))}
            </Stack>
          </AppCard>
        </Grid>
        <Grid item xs={12} md={6} xl={4}>
          <AppCard title="Construction Requests by Status" subtitle="Live counts from the admin API">
            <Stack spacing={1}>
              {statusBreakdown(summary.construction).map((row) => (
                <Stack key={row.label} direction="row" justifyContent="space-between">
                  <Typography variant="body2">{row.label}</Typography>
                  <Typography variant="body2" fontWeight={700}>{row.value}</Typography>
                </Stack>
              ))}
            </Stack>
          </AppCard>
        </Grid>
        <Grid item xs={12} md={6} xl={4}>
          <AppCard title="Support Tickets by Status" subtitle="Live counts from the admin API">
            <Stack spacing={1}>
              {statusBreakdown(summary.supportTickets).map((row) => (
                <Stack key={row.label} direction="row" justifyContent="space-between">
                  <Typography variant="body2">{row.label}</Typography>
                  <Typography variant="body2" fontWeight={700}>{row.value}</Typography>
                </Stack>
              ))}
            </Stack>
          </AppCard>
        </Grid>
        <Grid item xs={12} md={6} xl={4}>
          <AppCard title="Legal Requests by Status" subtitle="Live counts from the admin API">
            <Stack spacing={1}>
              {statusBreakdown(summary.legalRequests, (id) => resolveMasterLabel(legalStatusMasters, id)).map((row) => (
                <Stack key={row.label} direction="row" justifyContent="space-between">
                  <Typography variant="body2">{row.label}</Typography>
                  <Typography variant="body2" fontWeight={700}>{row.value}</Typography>
                </Stack>
              ))}
            </Stack>
          </AppCard>
        </Grid>
        <Grid item xs={12} md={6} xl={4}>
          <AppCard title="Loan Requests by Status" subtitle="Live counts from the admin API">
            <Stack spacing={1}>
              {statusBreakdown(summary.loanRequests, (id) => resolveMasterLabel(loanStatusMasters, id)).map((row) => (
                <Stack key={row.label} direction="row" justifyContent="space-between">
                  <Typography variant="body2">{row.label}</Typography>
                  <Typography variant="body2" fontWeight={700}>{row.value}</Typography>
                </Stack>
              ))}
            </Stack>
          </AppCard>
        </Grid>
      </Grid>

      <Grid container spacing={2} mt={0.5}>
        {sections.map(([title, rows]) => (
          <Grid item xs={12} md={6} xl={4} key={title}>
            <AppCard title={title} subtitle="Latest business activity">
              {rows.length ? (
                <List dense disablePadding>
                  {rows.map((row) => (
                    <ListItem key={row.id} disableGutters>
                      <ListItemText primary={row.primary} secondary={row.secondary} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nothing to show.
                </Typography>
              )}
            </AppCard>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
