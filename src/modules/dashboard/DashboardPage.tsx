import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { Avatar, Grid, List, ListItem, ListItemText, Stack, Typography } from "@mui/material";
import { useAppSelector } from "../../app/hooks";
import { AppCard } from "../../components/common/AppCard";
import { PageHeader } from "../../components/common/PageHeader";
import { dashboardLists, dashboardStats } from "../../mock/dashboardData";

function listLabel(row: Record<string, unknown>) {
  return String(row.title ?? row.userName ?? row.name ?? row.brokerName ?? row.subject ?? row.action ?? row.id);
}

export function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const sections = [
    ["Recent Leads", dashboardLists.recentLeads],
    ["Recent Properties", dashboardLists.recentProperties],
    ["Pending Property Approvals", dashboardLists.pendingPropertyApprovals],
    ["Pending Broker Approvals", dashboardLists.pendingBrokerApprovals],
    ["Today Follow-ups", dashboardLists.todayFollowUps],
    ["Recent Support Tickets", dashboardLists.recentSupportTickets],
    ["Recent Audit Activities", dashboardLists.recentAuditActivities],
  ] as const;

  return (
    <>
      <PageHeader title={`${user?.roleLabel} Dashboard`} subtitle="Realistic 1Square Property operational dashboard for Madhya Pradesh business activity." />
      <Grid container spacing={2}>
        {dashboardStats.map((metric) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={metric.label}>
            <AppCard title={String(metric.value)} subtitle={metric.label}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Avatar sx={{ bgcolor: "primary.light", color: "primary.main" }}>
                  <TrendingUpRoundedIcon />
                </Avatar>
                <Stack alignItems="flex-end" spacing={0.25}>
                  <Typography variant="caption" color="success.main" fontWeight={900}>
                    +{(Number(metric.value) % 18) + 3}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    vs last month
                  </Typography>
                </Stack>
              </Stack>
            </AppCard>
          </Grid>
        ))}
        {sections.map(([title, rows]) => (
          <Grid item xs={12} md={6} xl={4} key={title}>
            <AppCard title={title} subtitle="Latest business activity">
              <List dense disablePadding>
                {rows.map((row) => (
                  <ListItem key={String(row.id)} disableGutters>
                    <ListItemText primary={listLabel(row)} secondary={String(row.city ?? row.status ?? row.dateTime ?? "")} />
                  </ListItem>
                ))}
              </List>
            </AppCard>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
