import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { Alert, DialogActions, FormControlLabel, Grid, IconButton, MenuItem, Stack, Switch, TextField, Tooltip, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { AppInput } from "../../components/common/AppInput";
import { AppModal } from "../../components/common/AppModal";
import { AppTable } from "../../components/common/AppTable";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { EmptyState } from "../../components/common/EmptyState";
import { Loader } from "../../components/common/Loader";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { ToastNotification } from "../../components/common/ToastNotification";
import {
  settingsService,
  type AppSetting,
  type CreateTemplateInput,
  type MessageTemplate,
  type SettingValueType,
  type TemplateChannel,
  type UpdateTemplateInput,
  type UpsertSettingInput,
} from "../../services/settings.service";
import type { TableColumn } from "../../types";
import {propertyLeadPurchaseAdminService, type AdminPropertyLeadConfig} from "../../services/propertyLeadPurchase.service";
import {constructionCommissionAdminService, type ConstructionCommissionConfig, type ConstructionCommissionConfigHistory} from "../../services/constructionCommission.service";

const VALUE_TYPES: SettingValueType[] = ["string", "number", "boolean", "json", "secret"];
const CHANNELS: TemplateChannel[] = ["email", "sms", "push"];

const coerceValue = (raw: string, valueType: SettingValueType): unknown => {
  if (valueType === "number") return Number(raw);
  if (valueType === "boolean") return raw.trim().toLowerCase() === "true";
  if (valueType === "json") {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  return raw;
};

const displayValue = (value: unknown) => (typeof value === "string" ? value : JSON.stringify(value));

type SettingModalState = { kind: "create" } | { kind: "edit"; row: AppSetting };
type TemplateModalState = { kind: "create" } | { kind: "edit"; row: MessageTemplate } | { kind: "delete"; row: MessageTemplate };

export function SettingsPage() {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [settingModal, setSettingModal] = useState<SettingModalState | null>(null);
  const [templateModal, setTemplateModal] = useState<TemplateModalState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; severity: "success" | "error" } | null>(null);
  const [leadConfig, setLeadConfig] = useState<AdminPropertyLeadConfig>();
  const [leadPrice, setLeadPrice] = useState("");
  const [maxBrokers, setMaxBrokers] = useState("");
  const [leadConfigLoading, setLeadConfigLoading] = useState(true);
  const [leadConfigSaving, setLeadConfigSaving] = useState(false);
  const [leadConfigError, setLeadConfigError] = useState("");
  const [commissionConfig, setCommissionConfig] = useState<ConstructionCommissionConfig>();
  const [commissionRate, setCommissionRate] = useState("");
  const [commissionLoading, setCommissionLoading] = useState(true);
  const [commissionSaving, setCommissionSaving] = useState(false);
  const [commissionError, setCommissionError] = useState("");
  const [commissionHistory, setCommissionHistory] = useState<ConstructionCommissionConfigHistory[]>([]);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    Promise.all([settingsService.getSettings(), settingsService.getTemplates({ limit: 100, page: 1 })])
      .then(([settingsResponse, templatesResponse]) => {
        setSettings(settingsResponse.data.items.filter(item => item.key !== "construction_builder_commission_rate"));
        setTemplates(templatesResponse.data.items);
      })
      .catch(() => setError("Unable to load settings from the server."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    propertyLeadPurchaseAdminService.getConfig().then(config => {
      setLeadConfig(config);
      setLeadPrice(config.buyerLeadPrice ?? "");
      setMaxBrokers(config.maxBrokerPurchases?.toString() ?? "");
    }).catch(error => setLeadConfigError(error instanceof Error ? error.message : "Unable to load Buyer Lead configuration."))
      .finally(() => setLeadConfigLoading(false));
  }, []);

  useEffect(() => {
    constructionCommissionAdminService.getConfig().then(config => {setCommissionConfig(config); setCommissionRate(config.rate);})
      .catch(reason => setCommissionError(reason instanceof Error ? reason.message : "Unable to load construction commission configuration."))
      .finally(() => setCommissionLoading(false));
    constructionCommissionAdminService.getConfigHistory().then(setCommissionHistory).catch(() => undefined);
  }, []);

  const settingColumns: TableColumn<AppSetting>[] = useMemo(
    () => [
      { key: "category", header: "Category", render: (row) => row.category },
      { key: "key", header: "Key", render: (row) => <Typography variant="body2">{row.key}</Typography> },
      { key: "value", header: "Value", render: (row) => (row.isSecret ? "********" : displayValue(row.value)) },
      { key: "valueType", header: "Type", render: (row) => row.valueType },
      { key: "description", header: "Description", render: (row) => row.description ?? "-" },
      {
        key: "actions",
        header: "Actions",
        render: (row) => (
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => setSettingModal({ kind: "edit", row })}>
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [],
  );

  const templateColumns: TableColumn<MessageTemplate>[] = useMemo(
    () => [
      { key: "code", header: "Code", render: (row) => <Typography variant="body2">{row.code}</Typography> },
      { key: "name", header: "Name", render: (row) => row.name },
      { key: "channel", header: "Channel", render: (row) => row.channel },
      { key: "status", header: "Status", render: (row) => <StatusBadge value={row.isActive ? "active" : "inactive"} /> },
      {
        key: "actions",
        header: "Actions",
        render: (row) => (
          <Stack direction="row" spacing={0.25}>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => setTemplateModal({ kind: "edit", row })}>
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => setTemplateModal({ kind: "delete", row })}>
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [],
  );

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Stack spacing={2}>
        <EmptyState title="Unable to load settings" description={error} />
        <AppButton onClick={load} sx={{ alignSelf: "flex-start" }}>
          Retry
        </AppButton>
      </Stack>
    );
  }

  return (
    <>
      <PageHeader title="Settings" subtitle="Application settings and message templates, sourced live from the admin API." />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <AppCard title="Construction Builder Commission" subtitle="Prospective platform commission on fully accepted Builder agreements. Existing project snapshots are never recalculated.">
            {commissionLoading ? <Typography>Loading construction commission settings…</Typography> : <Stack spacing={2}>
              {commissionError ? <Alert severity="error">{commissionError}</Alert> : null}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Commission Rate (%)" value={commissionRate} onChange={event => setCommissionRate(event.target.value)} inputProps={{inputMode:"decimal"}} helperText={`0 to ${commissionConfig?.maximumRate ?? "10.00"}%, up to two decimal places.`}/></Grid>
                <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={commissionConfig?.enabled ?? false} onChange={event => setCommissionConfig(current => current ? {...current, enabled:event.target.checked} : current)} />} label="Enable commission for future accepted agreements" /></Grid>
              </Grid>
              {commissionConfig?.updatedAt ? <Typography variant="caption" color="text.secondary">Updated {new Date(commissionConfig.updatedAt).toLocaleString()}</Typography> : null}
              <AppButton disabled={commissionSaving || !commissionConfig || !/^(?:0|[1-9]\d?)(?:\.\d{1,2})?$/.test(commissionRate) || Number(commissionRate) > Number(commissionConfig?.maximumRate ?? 10)} onClick={async () => {
                if (!commissionConfig) return;
                setCommissionSaving(true);
                try {const next = await constructionCommissionAdminService.updateConfig({enabled:commissionConfig.enabled, rate:commissionRate}); setCommissionConfig(next); setCommissionRate(next.rate); setCommissionError(""); constructionCommissionAdminService.getConfigHistory().then(setCommissionHistory).catch(() => undefined); setToast({message:"Construction commission configuration saved and audited.",severity:"success"});}
                catch (reason) {setToast({message:reason instanceof Error ? reason.message : "Configuration save failed.",severity:"error"});}
                finally {setCommissionSaving(false);}
              }}>{commissionSaving ? "Saving…" : "Save Construction Commission"}</AppButton>
              <Typography variant="subtitle2" fontWeight={800}>Recent rate changes</Typography>
              {!commissionHistory.length ? <Typography variant="body2" color="text.secondary">No configuration changes recorded yet.</Typography> : commissionHistory.slice(0, 5).map(item => <Typography variant="body2" key={item.id}>{new Date(item.changedAt).toLocaleString()} · {item.changedBy} · {item.oldEnabled ? "On" : "Off"} {item.oldRate}% → {item.newEnabled ? "On" : "Off"} {item.newRate}%</Typography>)}
            </Stack>}
          </AppCard>
        </Grid>
        <Grid item xs={12}>
          <AppCard title="Buyer Lead Purchases" subtitle="Configure the platform price and maximum successful Broker purchases per published Buyer requirement.">
            {leadConfigLoading ? <Typography>Loading Buyer Lead configuration…</Typography> : <Stack spacing={2}>
              {leadConfigError ? <Alert severity="error">{leadConfigError}</Alert> : null}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><TextField fullWidth label={`Buyer Lead Price (${leadConfig?.currency ?? "INR"})`} value={leadPrice} onChange={event => setLeadPrice(event.target.value)} inputProps={{inputMode:"decimal"}} helperText="Use a non-negative amount with up to two decimal places." /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth label="Maximum Broker purchases" value={maxBrokers} onChange={event => setMaxBrokers(event.target.value)} inputProps={{inputMode:"numeric"}} helperText="Positive integer; technical ceiling 1,000 (business value is Admin-configurable)." /></Grid>
              </Grid>
              <FormControlLabel control={<Switch checked={leadConfig?.isActive ?? false} onChange={event => setLeadConfig(current => current ? {...current, isActive:event.target.checked} : current)} />} label="Enable new Buyer Lead purchase intents" />
              <Typography variant="caption" color="text.secondary">Gateway status: No payment gateway is connected. New intents remain pending until a server-side gateway verifier is integrated.</Typography>
              {leadConfig?.updatedAt ? <Typography variant="caption" color="text.secondary">Updated {new Date(leadConfig.updatedAt).toLocaleString()} · Admin ID {leadConfig.updatedBy ?? "—"}</Typography> : null}
              <AppButton disabled={leadConfigSaving || !leadConfig || !/^\d{1,14}(?:\.\d{1,2})?$/.test(leadPrice) || !/^\d+$/.test(maxBrokers) || Number(maxBrokers)<1 || Number(maxBrokers)>1000} onClick={async () => {
                if (!leadConfig) return;
                setLeadConfigSaving(true);
                try {
                  const next = await propertyLeadPurchaseAdminService.updateConfig({buyerLeadPrice:leadPrice,maxBrokerPurchases:Number(maxBrokers),isActive:leadConfig.isActive});
                  setLeadConfig(next);setLeadPrice(next.buyerLeadPrice ?? "");setMaxBrokers(next.maxBrokerPurchases?.toString() ?? "");setLeadConfigError("");setToast({message:"Buyer Lead purchase configuration saved.",severity:"success"});
                } catch (error) {setToast({message:error instanceof Error ? error.message : "Configuration save failed.",severity:"error"});}
                finally {setLeadConfigSaving(false);}
              }}>{leadConfigSaving ? "Saving…" : "Save Buyer Lead Configuration"}</AppButton>
            </Stack>}
          </AppCard>
        </Grid>
        <Grid item xs={12}>
          <AppCard
            title="Application Settings"
            subtitle="Key/value configuration. Secret values are masked and can be overwritten but not read back here."
          >
            <Stack spacing={2}>
              <AppButton startIcon={<AddRoundedIcon />} onClick={() => setSettingModal({ kind: "create" })} sx={{ alignSelf: "flex-start" }}>
                Add Setting
              </AppButton>
              {settings.length ? <AppTable columns={settingColumns} rows={settings} /> : <EmptyState title="No settings configured" description="Add one to get started." />}
            </Stack>
          </AppCard>
        </Grid>
        <Grid item xs={12}>
          <AppCard title="Message Templates" subtitle="Email, SMS, and push templates.">
            <Stack spacing={2}>
              <AppButton startIcon={<AddRoundedIcon />} onClick={() => setTemplateModal({ kind: "create" })} sx={{ alignSelf: "flex-start" }}>
                Add Template
              </AppButton>
              {templates.length ? <AppTable columns={templateColumns} rows={templates} /> : <EmptyState title="No templates found" description="Add one to get started." />}
            </Stack>
          </AppCard>
        </Grid>
      </Grid>

      {settingModal ? (
        <SettingFormModal
          mode={settingModal.kind}
          row={settingModal.kind === "edit" ? settingModal.row : undefined}
          submitting={submitting}
          onClose={() => setSettingModal(null)}
          onSubmit={async (key, input) => {
            setSubmitting(true);
            try {
              const response = await settingsService.upsertSetting(key, input);
              setSettings((current) => {
                const exists = current.some((item) => item.key === response.data.key);
                return exists ? current.map((item) => (item.key === response.data.key ? response.data : item)) : [response.data, ...current];
              });
              setToast({ message: `Setting "${key}" saved.`, severity: "success" });
              setSettingModal(null);
            } catch {
              setToast({ message: "Save failed. Please check the fields and try again.", severity: "error" });
            } finally {
              setSubmitting(false);
            }
          }}
        />
      ) : null}

      {templateModal?.kind === "create" || templateModal?.kind === "edit" ? (
        <TemplateFormModal
          mode={templateModal.kind}
          row={templateModal.kind === "edit" ? templateModal.row : undefined}
          submitting={submitting}
          onClose={() => setTemplateModal(null)}
          onSubmit={async (input) => {
            setSubmitting(true);
            try {
              if (templateModal.kind === "edit") {
                const response = await settingsService.updateTemplate(templateModal.row.id, input);
                setTemplates((current) => current.map((item) => (item.id === response.data.id ? response.data : item)));
                setToast({ message: `${response.data.name} updated.`, severity: "success" });
              } else {
                const response = await settingsService.createTemplate(input as CreateTemplateInput);
                setTemplates((current) => [response.data, ...current]);
                setToast({ message: `${response.data.name} created.`, severity: "success" });
              }
              setTemplateModal(null);
            } catch {
              setToast({ message: "Save failed. Please check the fields and try again.", severity: "error" });
            } finally {
              setSubmitting(false);
            }
          }}
        />
      ) : null}

      <ConfirmDialog
        open={templateModal?.kind === "delete"}
        title="Delete Template"
        description={templateModal?.kind === "delete" ? `This deletes "${templateModal.row.name}".` : ""}
        confirmText="Delete"
        onClose={() => setTemplateModal(null)}
        onConfirm={async () => {
          if (templateModal?.kind !== "delete") return;
          try {
            await settingsService.deleteTemplate(templateModal.row.id);
            setTemplates((current) => current.filter((item) => item.id !== templateModal.row.id));
            setToast({ message: "Template deleted.", severity: "success" });
          } catch {
            setToast({ message: "Delete failed. Please try again.", severity: "error" });
          } finally {
            setTemplateModal(null);
          }
        }}
      />

      <ToastNotification open={Boolean(toast)} message={toast?.message ?? ""} severity={toast?.severity} onClose={() => setToast(null)} />
    </>
  );
}

function SettingFormModal({
  mode,
  row,
  submitting,
  onClose,
  onSubmit,
}: {
  mode: "create" | "edit";
  row?: AppSetting;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (key: string, input: UpsertSettingInput) => void;
}) {
  const [key, setKey] = useState(row?.key ?? "");
  const [category, setCategory] = useState(row?.category ?? "");
  const [valueType, setValueType] = useState<SettingValueType>(row?.valueType ?? "string");
  const [value, setValue] = useState(row && !row.isSecret ? displayValue(row.value) : "");
  const [isSecret, setIsSecret] = useState(row?.isSecret ?? false);
  const [description, setDescription] = useState(row?.description ?? "");

  const canSubmit = key.trim() && category.trim();

  return (
    <AppModal open onClose={onClose} title={mode === "edit" ? `Edit Setting — ${row?.key}` : "Add Setting"}>
      <Stack spacing={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <AppInput label="Key *" value={key} onChange={(event) => setKey(event.target.value)} disabled={submitting || mode === "edit"} />
          </Grid>
          <Grid item xs={12} md={6}>
            <AppInput label="Category *" value={category} onChange={(event) => setCategory(event.target.value)} disabled={submitting} />
          </Grid>
          <Grid item xs={12} md={6}>
            <AppInput select label="Value Type" value={valueType} onChange={(event) => setValueType(event.target.value as SettingValueType)} disabled={submitting}>
              {VALUE_TYPES.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </AppInput>
          </Grid>
          <Grid item xs={12} md={6}>
            <AppInput select label="Is Secret" value={isSecret ? "true" : "false"} onChange={(event) => setIsSecret(event.target.value === "true")} disabled={submitting}>
              <MenuItem value="false">No</MenuItem>
              <MenuItem value="true">Yes</MenuItem>
            </AppInput>
          </Grid>
          <Grid item xs={12}>
            <AppInput
              label="Value"
              multiline={valueType === "json"}
              minRows={valueType === "json" ? 3 : undefined}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              disabled={submitting}
              helperText={isSecret ? "Overwrites the stored secret; the current value is never shown back." : undefined}
            />
          </Grid>
          <Grid item xs={12}>
            <AppInput label="Description" value={description ?? ""} onChange={(event) => setDescription(event.target.value)} disabled={submitting} />
          </Grid>
        </Grid>
        <DialogActions>
          <AppButton variant="text" onClick={onClose} disabled={submitting}>
            Cancel
          </AppButton>
          <AppButton
            disabled={submitting || !canSubmit}
            onClick={() =>
              onSubmit(key.trim(), {
                category: category.trim(),
                value: value === "" ? undefined : coerceValue(value, valueType),
                valueType,
                isSecret,
                description: description.trim() || null,
              })
            }
          >
            Save
          </AppButton>
        </DialogActions>
      </Stack>
    </AppModal>
  );
}

function TemplateFormModal({
  mode,
  row,
  submitting,
  onClose,
  onSubmit,
}: {
  mode: "create" | "edit";
  row?: MessageTemplate;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (input: CreateTemplateInput | UpdateTemplateInput) => void;
}) {
  const [channel, setChannel] = useState<TemplateChannel>(row?.channel ?? "email");
  const [name, setName] = useState(row?.name ?? "");
  const [code, setCode] = useState(row?.code ?? "");
  const [subject, setSubject] = useState(row?.subject ?? "");
  const [body, setBody] = useState(row?.body ?? "");
  const [variables, setVariables] = useState((row?.variables ?? []).join(", "));
  const [isActive, setIsActive] = useState(row?.isActive ?? true);

  const canSubmit = name.trim() && code.trim() && body.trim();

  return (
    <AppModal open onClose={onClose} title={mode === "edit" ? `Edit Template — ${row?.name}` : "Add Template"}>
      <Stack spacing={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <AppInput select label="Channel *" value={channel} onChange={(event) => setChannel(event.target.value as TemplateChannel)} disabled={submitting}>
              {CHANNELS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </AppInput>
          </Grid>
          <Grid item xs={12} md={4}>
            <AppInput label="Name *" value={name} onChange={(event) => setName(event.target.value)} disabled={submitting} />
          </Grid>
          <Grid item xs={12} md={4}>
            <AppInput label="Code *" value={code} onChange={(event) => setCode(event.target.value)} disabled={submitting || mode === "edit"} helperText="Letters, numbers, dot, underscore, hyphen." />
          </Grid>
          {channel === "email" ? (
            <Grid item xs={12}>
              <AppInput label="Subject" value={subject ?? ""} onChange={(event) => setSubject(event.target.value)} disabled={submitting} />
            </Grid>
          ) : null}
          <Grid item xs={12}>
            <AppInput label="Body *" multiline minRows={4} value={body} onChange={(event) => setBody(event.target.value)} disabled={submitting} />
          </Grid>
          <Grid item xs={12} md={8}>
            <AppInput label="Variables" value={variables} onChange={(event) => setVariables(event.target.value)} disabled={submitting} helperText="Comma-separated placeholder names, e.g. name, otp" />
          </Grid>
          <Grid item xs={12} md={4}>
            <AppInput select label="Status" value={isActive ? "true" : "false"} onChange={(event) => setIsActive(event.target.value === "true")} disabled={submitting}>
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </AppInput>
          </Grid>
        </Grid>
        <DialogActions>
          <AppButton variant="text" onClick={onClose} disabled={submitting}>
            Cancel
          </AppButton>
          <AppButton
            disabled={submitting || !canSubmit}
            onClick={() =>
              onSubmit({
                channel,
                name: name.trim(),
                code: code.trim(),
                subject: subject?.trim() || null,
                body: body.trim(),
                variables: variables
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
                isActive,
              })
            }
          >
            {mode === "edit" ? "Save Changes" : "Create Template"}
          </AppButton>
        </DialogActions>
      </Stack>
    </AppModal>
  );
}
