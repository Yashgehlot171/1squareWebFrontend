import {ArrowForwardRounded, EngineeringRounded, FactCheckRounded, LayersRounded, RequestQuoteRounded} from "@mui/icons-material";
import {Alert, Box, Button, Card, CardContent, CircularProgress, Grid, Stack, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {PageHeader} from "../../components/common/PageHeader";
import {adminConstructionService, type ConstructionDashboardSummary, type ConstructionRfqSummary} from "../../services/adminConstruction.service";

export function ConstructionManagementPage() {
  const [summary, setSummary] = useState<ConstructionDashboardSummary | null>(null);
  const [rfqSummary, setRfqSummary] = useState<ConstructionRfqSummary | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {Promise.all([adminConstructionService.getSummary(), adminConstructionService.getRfqSummary()]).then(([construction, rfqs]) => {setSummary(construction); setRfqSummary(rfqs);}).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load construction summary."));}, []);
  return <Box>
    <PageHeader title="Construction Management" subtitle="Manage construction capabilities and review Builder-submitted plans." />
    {error ? <Alert severity="error" sx={{mb: 2}}>{error}</Alert> : null}
    {!summary && !error ? <Stack alignItems="center" py={8}><CircularProgress/></Stack> : null}
    {summary ? <Grid container spacing={2.5} mb={3}>
      <Metric title="Approved Builders" value={summary.approvedBuilders} icon={<EngineeringRounded/>}/>
      <Metric title="Suspended Builders" value={summary.suspendedBuilders} icon={<EngineeringRounded/>}/>
      <Metric title="Pending Plan Approvals" value={summary.pendingPlanApprovals} icon={<FactCheckRounded/>}/>
      <Metric title="Approved Plan Versions" value={summary.approvedPlanVersions} icon={<LayersRounded/>}/>
      {rfqSummary ? <><Metric title="Total Construction RFQs" value={rfqSummary.totalRfqs} icon={<RequestQuoteRounded/>}/><Metric title="Open Construction RFQs" value={rfqSummary.openRfqs} icon={<RequestQuoteRounded/>}/><Metric title="RFQs with Builder Interest" value={rfqSummary.builderInterest} icon={<EngineeringRounded/>}/><Metric title="RFQs Awaiting Responses" value={rfqSummary.awaiting} icon={<FactCheckRounded/>}/><Metric title="RFQs with Clarifications" value={rfqSummary.withClarifications} icon={<FactCheckRounded/>}/><Metric title="RFQs with Site Visits" value={rfqSummary.withSiteVisits} icon={<RequestQuoteRounded/>}/></> : null}
    </Grid> : null}
    <Stack direction={{xs: "column", md: "row"}} spacing={2}>
      <ActionCard title="Construction Builders" description="Review Broker construction capability, provider status and Builder plan history." to="/construction/builders"/>
      <ActionCard title="Construction Plan Approvals" description="Review submitted plan versions and record an approval decision." to="/construction/plan-approvals"/>
      <ActionCard title="Construction RFQs" description="Monitor customer requirement snapshots, Builder invitations and recorded responses." to="/construction/rfqs"/>
    </Stack>
  </Box>;
}

function Metric({title, value, icon}: {title: string; value: number; icon: React.ReactNode}) {return <Grid item xs={12} sm={6} xl={3}><Card variant="outlined" sx={{height: "100%", borderRadius: 3}}><CardContent><Stack direction="row" spacing={1.5} alignItems="center"><Box sx={{p: 1, display: "grid", placeItems: "center", borderRadius: 2, color: "primary.main", bgcolor: "primary.light"}}>{icon}</Box><Box><Typography variant="h5" fontWeight={900}>{value}</Typography><Typography variant="body2" color="text.secondary">{title}</Typography></Box></Stack></CardContent></Card></Grid>}
function ActionCard({title, description, to}: {title: string; description: string; to: string}) {return <Card variant="outlined" sx={{flex: 1, borderRadius: 3}}><CardContent><Stack spacing={1.5}><Typography variant="h6" fontWeight={800}>{title}</Typography><Typography variant="body2" color="text.secondary">{description}</Typography><Button component={Link} to={to} endIcon={<ArrowForwardRounded/>} sx={{alignSelf: "flex-start"}}>Open</Button></Stack></CardContent></Card>}
