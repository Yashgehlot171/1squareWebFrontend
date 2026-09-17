import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { Alert, Box, Button, CardContent, Chip, Divider, Grid, LinearProgress, Stack, Step, StepButton, Stepper, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { AppInput } from "../../components/common/AppInput";
import { PageHeader } from "../../components/common/PageHeader";
import { ToastNotification } from "../../components/common/ToastNotification";
import { constructionPlanWizardSteps } from "./config/constructionPlanWizardConfig";
import { MasterUploadField } from "./components/MasterUploadField";
import { StatusToggle } from "./components/StatusToggle";
import type { MasterRecord, MasterRecordValue, WizardFieldConfig } from "./types";

const previewStep = { key: "preview", label: "Preview", fields: [] };
const allSteps = [...constructionPlanWizardSteps, previewStep];

const valueToString = (value: MasterRecordValue) => (Array.isArray(value) ? value.join(", ") : value === null || value === undefined ? "" : String(value));

const createInitialPlan = (id?: string): MasterRecord => ({
  id: id ?? `CP-${Date.now()}`,
  status: "Draft",
  planName: "",
  planCode: "",
  pricePerSqFt: 0,
  shortDescription: "",
  description: "",
});

function WizardField({ field, value, onChange }: { field: WizardFieldConfig; value: MasterRecordValue; onChange: (value: MasterRecordValue) => void }) {
  if (field.type === "status") {
    return <StatusToggle value={valueToString(value) || "Draft"} onChange={onChange} />;
  }

  if (field.type === "image" || field.type === "file") {
    return <MasterUploadField label={field.label} value={valueToString(value)} accept={field.type === "image" ? "image/*" : undefined} onChange={onChange} />;
  }

  if (field.type === "multifile") {
    return (
      <MasterUploadField
        label={field.label}
        value={valueToString(value)}
        accept="image/*"
        onChange={(fileId) => {
          const existing = Array.isArray(value) ? value : valueToString(value) ? valueToString(value).split(",").map((item) => item.trim()) : [];
          onChange([...existing, fileId]);
        }}
      />
    );
  }

  return (
    <AppInput
      label={`${field.label}${field.required ? " *" : ""}`}
      type={field.type === "number" ? "number" : field.type === "url" ? "url" : "text"}
      multiline={field.type === "textarea"}
      minRows={field.type === "textarea" ? 3 : undefined}
      value={valueToString(value)}
      onChange={(event) => onChange(field.type === "number" ? Number(event.target.value) : event.target.value)}
    />
  );
}

export function ConstructionPlanWizardPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeStep, setActiveStep] = useState(0);
  const [plan, setPlan] = useState<MasterRecord>(createInitialPlan(id));
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const currentStep = allSteps[activeStep];
  const isPreview = currentStep.key === "preview";
  const progress = useMemo(() => Math.round(((activeStep + 1) / allSteps.length) * 100), [activeStep]);

  const updateField = (key: string, value: MasterRecordValue) => {
    setPlan((current) => ({ ...current, [key]: value }));
  };

  const validateStep = () => {
    const missing = currentStep.fields.find((field) => field.required && !valueToString(plan[field.key]));
    if (missing) {
      setError(`${missing.label} is required.`);
      return false;
    }
    setError("");
    return true;
  };

  const goNext = () => {
    if (!validateStep()) {
      return;
    }
    setActiveStep((step) => Math.min(step + 1, allSteps.length - 1));
  };

  const publish = () => {
    const firstStep = constructionPlanWizardSteps[0];
    const missing = firstStep.fields.find((field) => field.required && !valueToString(plan[field.key]));
    if (missing) {
      setError(`${missing.label} is required before publishing.`);
      setActiveStep(0);
      return;
    }
    setPlan((current) => ({ ...current, status: "Published" }));
    setToast("Construction plan published.");
    setTimeout(() => navigate("/masters", { replace: true }), 500);
  };

  return (
    <>
      <PageHeader
        title={id ? "Edit Construction Plan" : "Create Construction Plan"}
        subtitle="Premium step-by-step workflow for construction plan specifications, documents, gallery, and publishing."
        actions={
          <AppButton variant="outlined" startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/masters")}>
            Back to Masters
          </AppButton>
        }
      />

      <Stack spacing={2}>
        {error ? <Alert severity="error" onClose={() => setError("")}>{error}</Alert> : null}

        <AppCard title={valueToString(plan.planName) || "New Construction Plan"} subtitle="Complete each section, review the plan, then publish. Upload fields store file IDs returned by the Upload API.">
          <CardContent sx={{ pt: 0 }}>
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }} justifyContent="space-between">
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label={`Step ${activeStep + 1} of ${allSteps.length}`} color="primary" variant="outlined" />
                  <Chip label={`${progress}% Complete`} color="secondary" variant="outlined" />
                  <Chip label={valueToString(plan.status) || "Draft"} color={valueToString(plan.status) === "Published" ? "success" : "default"} />
                </Stack>
                <Box sx={{ minWidth: { xs: "100%", md: 260 } }}>
                  <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 999, height: 8 }} />
                </Box>
              </Stack>

              <Stepper nonLinear activeStep={activeStep} alternativeLabel sx={{ overflowX: "auto", pb: 1 }}>
                {allSteps.map((step, index) => (
                  <Step key={step.key} completed={index < activeStep}>
                    <StepButton onClick={() => setActiveStep(index)}>{step.label}</StepButton>
                  </Step>
                ))}
              </Stepper>
            </Stack>
          </CardContent>
        </AppCard>

        {!isPreview ? (
          <AppCard title={currentStep.label} subtitle="Fields in this section are generated from the construction plan wizard configuration.">
            <CardContent>
              <Grid container spacing={2}>
                {currentStep.fields.map((field) => (
                  <Grid item xs={12} md={field.type === "textarea" ? 12 : 4} key={field.key}>
                    <WizardField field={field} value={plan[field.key]} onChange={(value) => updateField(field.key, value)} />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </AppCard>
        ) : (
          <AppCard title="Preview Construction Plan" subtitle="Review all sections before publishing. Use Edit on any section to jump back.">
            <CardContent>
              <Stack spacing={2}>
                {constructionPlanWizardSteps.map((step, index) => (
                  <Box key={step.key}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight={800}>
                        {step.label}
                      </Typography>
                      <Button size="small" onClick={() => setActiveStep(index)}>
                        Edit
                      </Button>
                    </Stack>
                    <Grid container spacing={1.5}>
                      {step.fields.map((field) => (
                        <Grid item xs={12} md={4} key={field.key}>
                          <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            {field.label}
                          </Typography>
                          <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                            {valueToString(plan[field.key]) || "-"}
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>
                    <Divider sx={{ mt: 2 }} />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </AppCard>
        )}

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <AppButton variant="outlined" disabled={activeStep === 0} onClick={() => setActiveStep((step) => Math.max(step - 1, 0))}>
            Previous
          </AppButton>
          {isPreview ? (
            <AppButton startIcon={<CheckCircleRoundedIcon />} onClick={publish}>
              Publish Construction Plan
            </AppButton>
          ) : (
            <AppButton onClick={goNext}>Next</AppButton>
          )}
        </Stack>
      </Stack>

      <ToastNotification open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </>
  );
}
