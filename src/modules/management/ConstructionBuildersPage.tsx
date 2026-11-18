import {ArrowBackRounded, OpenInNewRounded, SearchRounded} from "@mui/icons-material";
import {Alert, Autocomplete, Box, Button, Card, CardContent, Chip, CircularProgress, DialogActions, FormControl, Grid, IconButton, InputLabel, MenuItem, Paper, Select, Snackbar, Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField, Typography} from "@mui/material";
import {useCallback, useEffect, useState} from "react";
import {Link, useLocation, useNavigate, useParams} from "react-router-dom";
import {AppButton} from "../../components/common/AppButton";
import {AppModal} from "../../components/common/AppModal";
import {ConfirmDialog} from "../../components/common/ConfirmDialog";
import {PageHeader} from "../../components/common/PageHeader";
import {StatusBadge} from "../../components/common/StatusBadge";
import {adminConstructionService, type AdminBuilder, type BuilderProviderInput, type ConstructionCapabilityStatus} from "../../services/adminConstruction.service";
import {propertyService, type PropertyMasterOption} from "../../services/property.service";

const asText = (value: unknown) => value == null || value === "" ? "—" : String(value);
const dateText = (value?: string | null) => value ? new Date(value).toLocaleDateString() : "—";
const capabilityLabel = (status: ConstructionCapabilityStatus) => status === "NOT_ENABLED" ? "Not Enabled" : status === "SUSPENDED" ? "Suspended" : "Active";
const capabilityColor = (status: ConstructionCapabilityStatus) => status === "ACTIVE" ? "success" : status === "SUSPENDED" ? "error" : "warning";

export function ConstructionBuildersPage() {
  const {userId} = useParams();
  return userId ? <BuilderDetail userId={userId}/> : <BuilderList/>;
}

function BuilderList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<AdminBuilder[]>([]);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [enableTarget, setEnableTarget] = useState<AdminBuilder | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    adminConstructionService.listBuilders({page: page + 1, limit, search: search || undefined, status: status || undefined})
      .then(result => {if (mounted) {setRows(result.items); setTotal(result.pagination.total);}})
      .catch((reason: unknown) => {if (mounted) setError(reason instanceof Error ? reason.message : "Unable to load construction Builders.");})
      .finally(() => {if (mounted) setLoading(false);});
    return () => {mounted = false;};
  }, [page, limit, search, status, refreshKey]);

  const enable = async (provider: BuilderProviderInput) => {
    if (!enableTarget) return;
    setSaving(true);
    setError("");
    try {
      await adminConstructionService.setCapability(String(enableTarget.id), true, provider);
      setEnableTarget(null);
      setToast("Construction Builder capability enabled.");
      setRefreshKey(value => value + 1);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to enable Builder capability.");
    } finally {
      setSaving(false);
    }
  };

  return <Box>
    <PageHeader title="Construction Builders" subtitle="Approved Broker candidates and Brokers with construction Builder capability." actions={<Button component={Link} to="/construction" variant="outlined" startIcon={<ArrowBackRounded/>}>Construction overview</Button>}/>
    <Paper variant="outlined" sx={{p: 2, mb: 2, borderRadius: 3}}>
      <Stack direction={{xs: "column", sm: "row"}} spacing={1.5}>
        <TextField size="small" label="Search Broker, firm or provider" value={searchInput} onChange={event => setSearchInput(event.target.value)} onKeyDown={event => {if (event.key === "Enter") {setPage(0); setSearch(searchInput.trim());}}} sx={{minWidth: 280}}/>
        <FormControl size="small" sx={{minWidth: 190}}>
          <InputLabel id="builder-status-label">Capability status</InputLabel>
          <Select labelId="builder-status-label" label="Capability status" value={status} onChange={event => {setPage(0); setStatus(event.target.value);}}>
            <MenuItem value="">All statuses</MenuItem><MenuItem value="NOT_ENABLED">Not Enabled</MenuItem><MenuItem value="ACTIVE">Active</MenuItem><MenuItem value="SUSPENDED">Suspended</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" startIcon={<SearchRounded/>} onClick={() => {setPage(0); setSearch(searchInput.trim());}}>Search</Button>
      </Stack>
    </Paper>
    {error ? <Alert severity="error" sx={{mb: 2}}>{error}</Alert> : null}
    <Paper variant="outlined" sx={{borderRadius: 3, overflow: "hidden"}}>
      <Box sx={{overflowX: "auto"}}><Table size="small"><TableHead><TableRow>{["Broker / User", "Email", "Account Status", "Broker Verification", "Construction Capability", "Provider", "Provider verification", "Provider status", "City", "Experience", "Plans", ""].map(item => <TableCell key={item}>{item}</TableCell>)}</TableRow></TableHead>
        <TableBody>
          {loading ? <TableRow><TableCell colSpan={12} align="center" sx={{py: 6}}><CircularProgress size={26}/></TableCell></TableRow> : rows.length ? rows.map(builder => {
            const profile = builder.brokerProfile;
            const provider = builder.constructionProviderProfile;
            const canEnable = !provider && builder.status === "ACTIVE" && profile?.verificationStatus === "APPROVED";
            return <TableRow hover key={String(builder.id)}>
              <TableCell><Typography fontWeight={800}>{asText(builder.fullName)}</Typography><Typography variant="caption" color="text.secondary">ID {builder.id} · {asText(builder.mobile)}</Typography></TableCell>
              <TableCell>{asText(builder.email)}</TableCell>
              <TableCell><StatusBadge value={builder.status}/></TableCell>
              <TableCell><StatusBadge value={profile?.verificationStatus ?? "Unavailable"}/></TableCell>
              <TableCell><Chip size="small" label={capabilityLabel(builder.capabilityStatus)} color={capabilityColor(builder.capabilityStatus)}/></TableCell>
              <TableCell>{provider ? asText(provider.name) : "Not linked"}</TableCell>
              <TableCell>{provider ? <StatusBadge value={provider.isVerified ? "Verified" : "Unverified"}/> : "—"}</TableCell>
              <TableCell>{provider ? <StatusBadge value={provider.isActive ? "Active" : "Inactive"}/> : "—"}</TableCell>
              <TableCell>{asText(provider?.city?.name ?? profile?.officeCity?.name)}</TableCell>
              <TableCell>{provider?.experienceYears ?? profile?.experienceYears ?? "—"}</TableCell>
              <TableCell>{provider?.builderConstructionPlans.length ?? 0}</TableCell>
              <TableCell><Stack direction="row" spacing={0.5} alignItems="center">
                {canEnable ? <Button size="small" onClick={() => setEnableTarget(builder)}>Enable Builder</Button> : null}
                <IconButton aria-label="Open Builder details" onClick={() => navigate(`/construction/builders/${builder.id}`)}><OpenInNewRounded fontSize="small"/></IconButton>
              </Stack></TableCell>
            </TableRow>;
          }) : <TableRow><TableCell colSpan={12} align="center" sx={{py: 6}}><Typography color="text.secondary">No matching Broker or Builder records.</Typography></TableCell></TableRow>}
        </TableBody>
      </Table></Box>
      <TablePagination component="div" count={total} page={page} rowsPerPage={limit} rowsPerPageOptions={[10, 20, 50, 100]} onPageChange={(_, value) => setPage(value)} onRowsPerPageChange={event => {setLimit(Number(event.target.value)); setPage(0);}}/>
    </Paper>
    {enableTarget ? <BuilderEnableDialog builder={enableTarget} open saving={saving} onClose={() => setEnableTarget(null)} onSubmit={enable}/> : null}
    <Snackbar open={Boolean(toast)} autoHideDuration={3500} onClose={() => setToast("")}><Alert severity="success" variant="filled" onClose={() => setToast("")}>{toast}</Alert></Snackbar>
  </Box>;
}

function BuilderDetail({userId}: {userId: string}) {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as {from?: string} | null)?.from || "/construction/builders";
  const [builder, setBuilder] = useState<AdminBuilder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmAction, setConfirmAction] = useState<"suspend" | "reactivate" | null>(null);
  const [enableDialog, setEnableDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const load = useCallback(() => {setLoading(true); setError(""); adminConstructionService.getBuilder(userId).then(setBuilder).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load Builder details.")).finally(() => setLoading(false));}, [userId]);
  useEffect(() => {load();}, [load]);

  const toggle = async () => {
    if (!builder || !confirmAction) return;
    setSaving(true); setError("");
    try {
      const updated = await adminConstructionService.setCapability(userId, confirmAction === "reactivate");
      setBuilder(updated);
      setToast(confirmAction === "reactivate" ? "Builder capability reactivated." : "Builder capability suspended.");
      setConfirmAction(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update construction capability.");
    } finally {setSaving(false);}
  };
  const enable = async (providerInput: BuilderProviderInput) => {
    setSaving(true); setError("");
    try {
      setBuilder(await adminConstructionService.setCapability(userId, true, providerInput));
      setEnableDialog(false);
      setToast(provider ? "Builder service coverage updated." : "Construction Builder capability enabled.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to enable Builder capability.");
    } finally {setSaving(false);}
  };

  if (loading && !builder) return <Stack alignItems="center" py={10}><CircularProgress/></Stack>;
  if (!builder) return <Box><PageHeader title="Builder Detail" subtitle="Construction capability and Builder plan history."/><Alert severity="error">{error || "Builder not found."}</Alert><Button sx={{mt: 2}} onClick={() => navigate(returnTo)}>Back</Button></Box>;
  const provider = builder.constructionProviderProfile;
  const brokerApproved = builder.status === "ACTIVE" && builder.brokerProfile?.verificationStatus === "APPROVED";
  const canEnable = brokerApproved && !provider;
  const canReactivate = Boolean(brokerApproved && provider?.serviceType === "contractor" && provider.isVerified);
  const canSuspend = Boolean(provider?.serviceType === "contractor" && provider.isActive);

  return <Box>
    <PageHeader title={builder.brokerProfile?.companyName || builder.fullName || "Builder Detail"} subtitle="Broker profile, construction eligibility, and submitted plan history." actions={<Button onClick={() => navigate(returnTo)} startIcon={<ArrowBackRounded/>}>Back</Button>}/>
    {error ? <Alert severity="error" sx={{mb: 2}}>{error}</Alert> : null}
    <Stack direction={{xs: "column", md: "row"}} spacing={2} mb={2}>
      <Card variant="outlined" sx={{flex: 1, borderRadius: 3}}><CardContent><Typography variant="h6" fontWeight={800} mb={2}>Broker profile</Typography><Grid container spacing={1.5}><Detail label="Broker name" value={builder.fullName}/><Detail label="Firm name" value={builder.brokerProfile?.companyName}/><Detail label="Account status" value={builder.status}/><Detail label="Mobile" value={builder.mobile}/><Detail label="Email" value={builder.email}/><Detail label="Office address" value={builder.brokerProfile?.officeAddress}/><Detail label="Office city" value={builder.brokerProfile?.officeCity?.name}/><Detail label="Experience" value={builder.brokerProfile?.experienceYears != null ? `${builder.brokerProfile.experienceYears} years` : null}/><Detail label="RERA registration" value={builder.brokerProfile?.reraRegistrationNo}/><Detail label="GST number" value={builder.brokerProfile?.gstNumber}/><Detail label="Broker verification" value={builder.brokerProfile?.verificationStatus}/></Grid>{builder.brokerProfile?.documents?.length ? <Box mt={2}><Typography variant="subtitle2" fontWeight={800} mb={1}>Broker documents</Typography><Stack spacing={0.5}>{builder.brokerProfile.documents.map(document => <Typography key={String(document.id)} variant="body2">{document.label || document.file.originalName} · {document.file.fileType} · {document.file.status}</Typography>)}</Stack></Box> : null}</CardContent></Card>
      <Card variant="outlined" sx={{flex: 1, borderRadius: 3}}><CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}><Typography variant="h6" fontWeight={800}>Construction capability</Typography><Chip size="small" color={capabilityColor(builder.capabilityStatus)} label={capabilityLabel(builder.capabilityStatus)}/></Stack>
        <Grid container spacing={1.5}><Detail label="Linked provider" value={provider?.name}/><Detail label="Provider category" value={provider?.serviceType}/><Detail label="Provider city" value={provider?.city?.name}/><Detail label="Base / office locality" value={provider?.area?.name}/><Detail label="Service localities" value={provider?.serviceAreas?.map(({area}) => area.name).join(", ")}/><Detail label="Provider experience" value={provider?.experienceYears != null ? `${provider.experienceYears} years` : null}/><Detail label="Provider active" value={provider ? provider.isActive ? "Yes" : "No" : null}/><Detail label="Provider verified" value={provider ? provider.isVerified ? "Yes" : "No" : null}/><Detail label="Provider contact" value={provider?.mobile}/><Detail label="Provider email" value={provider?.email}/><Detail label="Provider address" value={provider?.address}/></Grid>
        {canEnable ? <Button sx={{mt: 2}} variant="contained" onClick={() => setEnableDialog(true)}>Enable Builder</Button> : null}
        {provider?.serviceType === "contractor" && provider.isActive ? <Button sx={{mt: 2}} variant="outlined" onClick={() => setEnableDialog(true)}>Edit service coverage</Button> : null}
        {canSuspend ? <Button sx={{mt: 2}} color="error" variant="contained" disabled={saving} onClick={() => setConfirmAction("suspend")}>Suspend Builder</Button> : null}
        {!canSuspend && provider?.serviceType === "contractor" && !provider.isActive ? <Button sx={{mt: 2}} variant="contained" disabled={!canReactivate || saving} onClick={() => setConfirmAction("reactivate")}>Reactivate Builder</Button> : null}
        {provider && !canReactivate && !provider.isActive ? <Typography variant="caption" display="block" mt={1} color="text.secondary">An active Broker account, Broker approval, and a verified contractor provider are required to reactivate.</Typography> : null}
        {!brokerApproved ? <Typography variant="caption" display="block" mt={1} color="text.secondary">Builder capability requires an active account and an approved Broker profile.</Typography> : null}
      </CardContent></Card>
    </Stack>
    <Typography variant="h5" fontWeight={900} mt={3} mb={1.5}>Construction Plans</Typography>
    {provider?.builderConstructionPlans.length ? <Stack spacing={2}>{provider.builderConstructionPlans.map(plan => <Card variant="outlined" sx={{borderRadius: 3}} key={String(plan.id)}><CardContent><Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}><Typography variant="h6" fontWeight={800}>{plan.name}</Typography><StatusBadge value={plan.status.replace(/_/g, " ")}/></Stack>{plan.versions.map(version => {const content = version.content; const price = content.pricingBasis === "PER_SQ_FT" && content.indicativeRatePerSqFt ? `₹${Number(content.indicativeRatePerSqFt).toLocaleString("en-IN")} / sq.ft.` : content.pricingBasis === "CUSTOM_ON_ASSESSMENT" ? "Custom / on assessment" : "—"; return <Paper key={String(version.id)} variant="outlined" sx={{p: 1.5, mt: 1.2, borderRadius: 2}}><Stack direction={{xs: "column", sm: "row"}} justifyContent="space-between" gap={1}><Typography fontWeight={800}>Version {version.version} · {version.status.replace(/_/g, " ")}</Typography><Typography variant="body2">{price}</Typography></Stack><Typography variant="caption" color="text.secondary">Submitted {dateText(version.submittedAt)} · Reviewed {dateText(version.reviewedAt)}</Typography>{version.reviewComment ? <Typography variant="body2" mt={0.5}>Review comment: {version.reviewComment}</Typography> : null}</Paper>;})}</CardContent></Card>)}</Stack> : <Paper variant="outlined" sx={{p: 3, borderRadius: 3}}><Typography color="text.secondary">This Broker has no construction plans.</Typography></Paper>}
    <Paper variant="outlined" sx={{p: 2, mt: 3, borderRadius: 3}}><Typography variant="h6" fontWeight={800} mb={1}>Public Builder Profile</Typography><Typography variant="body2" mb={1}>About: {builder.brokerProfile?.bio || "Not provided"}</Typography><Typography variant="body2">Instagram: {builder.brokerProfile?.instagramUrl || "Not provided"}</Typography><Typography variant="body2">YouTube: {builder.brokerProfile?.youtubeUrl || "Not provided"}</Typography></Paper>
    <Typography variant="h5" fontWeight={900} mt={3} mb={1.5}>Verified 1SQUARE Projects</Typography>
    {provider?.constructionProjects.filter(project => project.status === "COMPLETED" && project.handover?.status === "ACCEPTED").length ? <Stack spacing={1}>{provider.constructionProjects.filter(project => project.status === "COMPLETED" && project.handover?.status === "ACCEPTED").map(project => <Paper key={String(project.id)} variant="outlined" sx={{p: 2, borderRadius: 2}}><Typography fontWeight={800}>{project.projectNo} · Verified completion</Typography><Typography variant="body2" color="text.secondary">Customer showcase consent: {project.showcaseConsent?.enabled ? "Allowed" : "Off"}{project.showcaseConsent?.revokedAt ? " · revoked previously" : ""}</Typography><Typography variant="caption" color="text.secondary">Completed {dateText(project.handover?.completedAt)}</Typography></Paper>)}</Stack> : <Paper variant="outlined" sx={{p: 2}}><Typography color="text.secondary">No completed projects with accepted handover.</Typography></Paper>}
    <Typography variant="h5" fontWeight={900} mt={3} mb={1.5}>Builder Portfolio · Previous Work</Typography>
    {provider?.builderPortfolioItems.length ? <Stack spacing={1}>{provider.builderPortfolioItems.map(item => <Paper key={String(item.id)} variant="outlined" sx={{p: 2, borderRadius: 2}}><Typography fontWeight={800}>{item.title} · Builder Portfolio</Typography><Typography variant="body2" color="text.secondary">{[item.projectType, item.cityName, item.completedAt ? dateText(item.completedAt) : null].filter(Boolean).join(" · ")}</Typography><Typography variant="caption">{item.media.length} image(s)</Typography>{item.description ? <Typography variant="body2" mt={0.5}>{item.description}</Typography> : null}</Paper>)}</Stack> : <Paper variant="outlined" sx={{p: 2}}><Typography color="text.secondary">No manual portfolio items.</Typography></Paper>}
    <Typography variant="h5" fontWeight={900} mt={3} mb={1.5}>Verified Customer Reviews</Typography>
    <Paper variant="outlined" sx={{p: 2, borderRadius: 2}}><Typography fontWeight={800}>{builder.customerReviews?.verifiedReviewCount ? `${builder.customerReviews.averageRating?.toFixed(1)} / 5 · ${builder.customerReviews.verifiedReviewCount} verified reviews` : "No verified reviews yet"}</Typography>{builder.customerReviews?.reviews.map(review => <Typography key={review.id} variant="body2" sx={{mt: 1}}>{review.rating}/5 · {review.reviewText || "No written comment"} · {dateText(review.createdAt)}</Typography>)}</Paper>
    <ConfirmDialog open={Boolean(confirmAction)} title={confirmAction === "reactivate" ? "Reactivate Builder?" : "Suspend Builder?"} description={confirmAction === "reactivate" ? "This eligible Broker can use Builder features again after reactivation." : "This Builder will lose access to Builder-only operations. Existing plans, RFQs, quotations, and history will be preserved."} confirmText={saving ? "Saving…" : confirmAction === "reactivate" ? "Reactivate" : "Suspend"} onClose={() => setConfirmAction(null)} onConfirm={() => {void toggle();}}/>
    {enableDialog ? <BuilderEnableDialog builder={builder} open saving={saving} onClose={() => setEnableDialog(false)} onSubmit={enable}/> : null}
    <Snackbar open={Boolean(toast)} autoHideDuration={3500} onClose={() => setToast("")}><Alert severity="success" variant="filled" onClose={() => setToast("")}>{toast}</Alert></Snackbar>
  </Box>;
}

function BuilderEnableDialog({builder, open, saving, onClose, onSubmit}: {builder: AdminBuilder; open: boolean; saving: boolean; onClose: () => void; onSubmit: (input: BuilderProviderInput) => void}) {
  const provider = builder.constructionProviderProfile;
  const profile = builder.brokerProfile;
  const [name, setName] = useState(provider?.name ?? profile?.companyName ?? builder.fullName ?? "");
  const [mobile, setMobile] = useState(provider?.mobile ?? builder.mobile ?? "");
  const [email, setEmail] = useState(provider?.email ?? builder.email ?? "");
  const [address, setAddress] = useState(provider?.address ?? profile?.officeAddress ?? "");
  const [experienceYears, setExperienceYears] = useState(String(provider?.experienceYears ?? profile?.experienceYears ?? ""));
  const [stateId, setStateId] = useState(String(provider?.city?.stateId ?? profile?.officeCity?.stateId ?? ""));
  const [cityId, setCityId] = useState(String(provider?.cityId ?? profile?.officeCity?.id ?? ""));
  const [areaId, setAreaId] = useState(String(provider?.areaId ?? ""));
  const [serviceAreaIds, setServiceAreaIds] = useState<number[]>(provider?.serviceAreas?.map(({area}) => area.id) ?? []);
  const [states, setStates] = useState<PropertyMasterOption[]>([]);
  const [cities, setCities] = useState<PropertyMasterOption[]>([]);
  const [areas, setAreas] = useState<PropertyMasterOption[]>([]);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    let active = true;
    if (open) propertyService.getStates().then(result => {if (active) setStates(result.data.items);}).catch(() => {if (active) setLocationError("Unable to load location options.");});
    return () => {active = false;};
  }, [open]);
  useEffect(() => {
    let active = true;
    if (!open || !stateId) {setCities([]); return () => {active = false;};}
    setCities([]);
    propertyService.getCities(Number(stateId)).then(result => {if (active) setCities(result.data.items);}).catch(() => {if (active) setLocationError("Unable to load cities.");});
    return () => {active = false;};
  }, [open, stateId]);
  useEffect(() => {
    let active = true;
    if (!open || !cityId) {setAreas([]); return () => {active = false;};}
    setAreas([]);
    propertyService.getAreas(Number(cityId)).then(result => {if (active) setAreas(result.data.items);}).catch(() => {if (active) setLocationError("Unable to load areas.");});
    return () => {active = false;};
  }, [open, cityId]);

  const submit = () => {
    if (!name.trim() || !cityId) return;
    onSubmit({name: name.trim(), mobile: mobile.trim() || null, email: email.trim() || null, address: address.trim() || null, cityId: Number(cityId), areaId: areaId ? Number(areaId) : null, serviceAreaIds, experienceYears: experienceYears.trim() ? Number(experienceYears) : null});
  };
  return <AppModal open={open} onClose={onClose} title={provider ? "Edit Builder Coverage" : "Enable Builder"} maxWidth="sm">
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">This will enable Construction Builder capability for this approved Broker.</Typography>
      {locationError ? <Alert severity="error">{locationError}</Alert> : null}
      <Grid container spacing={1.5}>
        <Grid item xs={12} sm={6}><TextField fullWidth label="Provider / Business Name" required value={name} onChange={event => setName(event.target.value)} disabled={saving}/></Grid>
        <Grid item xs={12} sm={6}><TextField fullWidth label="Mobile" value={mobile} onChange={event => setMobile(event.target.value)} disabled={saving}/></Grid>
        <Grid item xs={12} sm={6}><TextField fullWidth label="Email" type="email" value={email} onChange={event => setEmail(event.target.value)} disabled={saving}/></Grid>
        <Grid item xs={12} sm={6}><TextField fullWidth label="Experience Years" type="number" inputProps={{min: 0, step: 1}} value={experienceYears} onChange={event => setExperienceYears(event.target.value)} disabled={saving}/></Grid>
        <Grid item xs={12}><TextField fullWidth label="Address" value={address} onChange={event => setAddress(event.target.value)} disabled={saving}/></Grid>
        <Grid item xs={12} sm={4}><FormControl fullWidth><InputLabel id="builder-state-label">State</InputLabel><Select labelId="builder-state-label" label="State" value={stateId} onChange={event => {setStateId(event.target.value); setCityId(""); setAreaId(""); setServiceAreaIds([]);}} disabled={saving}><MenuItem value="">Select state</MenuItem>{states.map(item => <MenuItem key={item.id} value={String(item.id)}>{item.name}</MenuItem>)}</Select></FormControl></Grid>
        <Grid item xs={12} sm={4}><FormControl fullWidth><InputLabel id="builder-city-label">City</InputLabel><Select labelId="builder-city-label" label="City" value={cityId} onChange={event => {setCityId(event.target.value); setAreaId(""); setServiceAreaIds([]);}} disabled={saving || !stateId}><MenuItem value="">Select city</MenuItem>{cities.map(item => <MenuItem key={item.id} value={String(item.id)}>{item.name}</MenuItem>)}</Select></FormControl></Grid>
        <Grid item xs={12} sm={4}><FormControl fullWidth><InputLabel id="builder-area-label">Area (optional)</InputLabel><Select labelId="builder-area-label" label="Area (optional)" value={areaId} onChange={event => setAreaId(event.target.value)} disabled={saving || !cityId}><MenuItem value="">No area</MenuItem>{areas.map(item => <MenuItem key={item.id} value={String(item.id)}>{item.name}</MenuItem>)}</Select></FormControl></Grid>
        <Grid item xs={12}><Autocomplete multiple options={areas} getOptionLabel={option => option.name} isOptionEqualToValue={(option, value) => option.id === value.id} value={areas.filter(area => serviceAreaIds.includes(area.id))} onChange={(_, values) => setServiceAreaIds(values.map(item => item.id))} disabled={saving || !cityId} renderInput={params => <TextField {...params} label="Service Localities" placeholder={serviceAreaIds.length ? "" : "Search and select localities"}/>} /></Grid>
      </Grid>
      <DialogActions><AppButton variant="text" onClick={onClose} disabled={saving}>Cancel</AppButton><AppButton onClick={submit} disabled={saving || !name.trim() || !cityId}>{provider ? "Save coverage" : "Enable Builder"}</AppButton></DialogActions>
    </Stack>
  </AppModal>;
}

function Detail({label, value}: {label: string; value: unknown}) {return <Grid item xs={12} sm={6}><Typography variant="caption" color="text.secondary">{label}</Typography><Typography variant="body2" fontWeight={600}>{asText(value)}</Typography></Grid>;}
