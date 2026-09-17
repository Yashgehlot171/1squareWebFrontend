import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import { DialogActions, Grid, IconButton, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useFormik } from "formik";
import { useMemo, useState } from "react";
import * as Yup from "yup";
import { Link as RouterLink } from "react-router-dom";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { AppInput } from "../../components/common/AppInput";
import { AppModal } from "../../components/common/AppModal";
import { AppTable } from "../../components/common/AppTable";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { PageHeader } from "../../components/common/PageHeader";
import { SearchFilter } from "../../components/common/SearchFilter";
import { StatusBadge } from "../../components/common/StatusBadge";
import { ToastNotification } from "../../components/common/ToastNotification";
import type { TableColumn } from "../../types";

export interface FieldConfig {
  key: string;
  label: string;
  required?: boolean;
  type?: "text" | "number" | "email" | "mobile" | "date" | "select" | "textarea";
  options?: string[];
  showWhen?: (values: Record<string, string>) => boolean;
  validateWhen?: (values: Record<string, string>) => boolean;
}

export interface BusinessModulePageProps {
  title: string;
  subtitle: string;
  rows: Array<Record<string, unknown>>;
  columns: Array<{ key: string; label: string; status?: boolean; currency?: boolean }>;
  fields: FieldConfig[];
  searchableKeys: string[];
  statusKey?: string;
  cityKey?: string;
  dateKey?: string;
  actions: string[];
  remarkRequiredActions?: string[];
  detailPathPrefix?: string;
}

function asString(value: unknown) {
  return value === undefined || value === null ? "" : String(value);
}

function buildValidation(fields: FieldConfig[]) {
  const shape: Record<string, Yup.StringSchema> = {};
  fields.forEach((field) => {
    let schema = Yup.string();
    if (field.type === "email") {
      schema = schema.email("Enter a valid email.");
    }
    if (field.type === "mobile") {
      schema = schema.matches(/^[6-9]\d{9}$/, "Enter a valid 10 digit Indian mobile number.");
    }
    if (field.type === "number") {
      schema = schema.test("numeric", "Enter a numeric value.", (value) => !value || !Number.isNaN(Number(value)));
    }
    if (field.required) {
      schema = schema.required(`${field.label} is required.`);
    }
    shape[field.key] = schema;
  });
  return Yup.object(shape);
}

function buildConditionalErrors(fields: FieldConfig[], values: Record<string, string>) {
  return fields.reduce<Record<string, string>>((errors, field) => {
    if (field.validateWhen?.(values) && !values[field.key]) {
      errors[field.key] = `${field.label} is required.`;
    }
    return errors;
  }, {});
}

export function BusinessModulePage({
  title,
  subtitle,
  rows,
  columns,
  fields,
  searchableKeys,
  statusKey = "status",
  cityKey = "city",
  actions,
  remarkRequiredActions = [],
  detailPathPrefix,
}: BusinessModulePageProps) {
  const [records, setRecords] = useState(rows);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [city, setCity] = useState("All");
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [mode, setMode] = useState<"view" | "add" | "edit" | null>(null);
  const [confirmAction, setConfirmAction] = useState("");
  const [remark, setRemark] = useState("");
  const [toast, setToast] = useState("");

  const statusOptions = useMemo(() => ["All", ...Array.from(new Set(records.map((row) => asString(row[statusKey])).filter(Boolean)))], [records, statusKey]);
  const cityOptions = useMemo(() => ["All", ...Array.from(new Set(records.map((row) => asString(row[cityKey])).filter(Boolean)))], [records, cityKey]);

  const filteredRows = useMemo(
    () =>
      records.filter((row) => {
        const matchesSearch = searchableKeys.some((key) => asString(row[key]).toLowerCase().includes(search.toLowerCase()));
        const matchesStatus = status === "All" || asString(row[statusKey]) === status;
        const matchesCity = city === "All" || asString(row[cityKey]) === city;
        return matchesSearch && matchesStatus && matchesCity;
      }),
    [city, cityKey, records, search, searchableKeys, status, statusKey],
  );

  const initialValues = useMemo(() => {
    const source = selected ?? {};
    return fields.reduce<Record<string, string>>((acc, field) => {
      acc[field.key] = asString(source[field.key]);
      return acc;
    }, {});
  }, [fields, selected]);

  const formik = useFormik<Record<string, string>>({
    enableReinitialize: true,
    initialValues,
    validationSchema: buildValidation(fields),
    validate: (values) => buildConditionalErrors(fields, values),
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: (values) => {
      if (mode === "edit" && selected) {
        setRecords((prev) => prev.map((row) => (row.id === selected.id ? { ...row, ...values } : row)));
      } else {
        setRecords((prev) => [{ id: `${title.slice(0, 3).toUpperCase()}-${String(prev.length + 1).padStart(4, "0")}`, ...values }, ...prev]);
      }
      setToast(`${title} saved successfully.`);
      setMode(null);
    },
  });

  const tableColumns: TableColumn<Record<string, unknown>>[] = [
    ...columns.map((column) => ({
      key: column.key,
      header: column.label,
      render: (row: Record<string, unknown>) => {
        const value = row[column.key];
        if (column.status) {
          return <StatusBadge value={asString(value)} />;
        }
        if (column.currency) {
          return `INR ${Number(value).toLocaleString("en-IN")}`;
        }
        return asString(value);
      },
    })),
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <Stack direction="row" spacing={0.5}>
          <IconButton
            size="small"
            component={detailPathPrefix ? RouterLink : "button"}
            to={detailPathPrefix ? `${detailPathPrefix}/${String(row.id)}` : undefined}
            onClick={detailPathPrefix ? undefined : () => {
              setSelected(row);
              setMode("view");
            }}
          >
            <VisibilityRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => {
            setSelected(row);
            setMode("edit");
          }}>
            <EditRoundedIcon fontSize="small" />
          </IconButton>
          {actions.slice(0, 2).map((action) => (
            <IconButton key={action} size="small" onClick={() => {
              setSelected(row);
              setConfirmAction(action);
            }}>
              <MoreVertRoundedIcon fontSize="small" />
            </IconButton>
          ))}
          {actions.includes("Delete") ? (
            <IconButton color="error" size="small" onClick={() => {
              setSelected(row);
              setConfirmAction("Delete");
            }}>
              <DeleteOutlineRoundedIcon fontSize="small" />
            </IconButton>
          ) : null}
        </Stack>
      ),
    },
  ];

  const confirmNeedsRemark = remarkRequiredActions.includes(confirmAction);

  const handleConfirm = () => {
    if (confirmNeedsRemark && !remark.trim()) {
      setToast("Remark is required for this action.");
      return;
    }
    setToast(`${confirmAction} completed for ${asString(selected?.id)}.`);
    setConfirmAction("");
    setRemark("");
  };

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          <AppButton startIcon={<AddRoundedIcon />} onClick={() => {
            setSelected(null);
            setMode("add");
          }}>
            Add
          </AppButton>
        }
      />
      <Stack spacing={2}>
        <AppCard title="Filters" subtitle="Search, status, city, pagination, and workflow-ready actions.">
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <SearchFilter value={search} onChange={setSearch} placeholder={`Search ${title.toLowerCase()}`} />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth size="small" label="Status" value={status} onChange={(event) => setStatus(event.target.value)}>
                {statusOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField select fullWidth size="small" label="City" value={city} onChange={(event) => setCity(event.target.value)}>
                {cityOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </AppCard>
        <AppTable columns={tableColumns} rows={filteredRows} />
      </Stack>
      <AppModal open={Boolean(mode)} onClose={() => setMode(null)} title={`${mode === "add" ? "Add" : mode === "edit" ? "Edit" : "View"} ${title}`}>
        {mode === "view" ? (
          <Grid container spacing={2}>
            {columns.map((column) => (
              <Grid item xs={12} md={6} key={column.key}>
                <Typography variant="caption" color="text.secondary">
                  {column.label}
                </Typography>
                <Typography variant="body2">{asString(selected?.[column.key])}</Typography>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Stack spacing={2} component="form" onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
              {fields.filter((field) => !field.showWhen || field.showWhen(formik.values)).map((field) => (
                <Grid item xs={12} md={field.type === "textarea" ? 12 : 6} key={field.key}>
                  {field.type === "select" ? (
                    <TextField
                      select
                      fullWidth
                      size="small"
                      label={`${field.label}${field.required ? " *" : ""}`}
                      name={field.key}
                      value={formik.values[field.key]}
                      error={formik.touched[field.key] && Boolean(formik.errors[field.key])}
                      helperText={formik.touched[field.key] ? formik.errors[field.key] : undefined}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    >
                      {(field.options ?? []).map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  ) : (
                    <AppInput
                      multiline={field.type === "textarea"}
                      minRows={field.type === "textarea" ? 3 : undefined}
                      label={`${field.label}${field.required ? " *" : ""}`}
                      name={field.key}
                      type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                      value={formik.values[field.key]}
                      error={formik.touched[field.key] && Boolean(formik.errors[field.key])}
                      helperText={formik.touched[field.key] ? formik.errors[field.key] : undefined}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      InputLabelProps={field.type === "date" ? { shrink: true } : undefined}
                    />
                  )}
                </Grid>
              ))}
            </Grid>
            <DialogActions>
              <AppButton variant="text" onClick={() => setMode(null)}>
                Cancel
              </AppButton>
              <AppButton type="submit">Save</AppButton>
            </DialogActions>
          </Stack>
        )}
      </AppModal>
      <ConfirmDialog
        open={Boolean(confirmAction)}
        title={`Confirm ${confirmAction}`}
        description={confirmNeedsRemark ? "This action requires a remark before it can be completed." : "Confirm this workflow action."}
        onClose={() => setConfirmAction("")}
        onConfirm={handleConfirm}
      />
      {confirmAction && confirmNeedsRemark ? (
        <AppModal open onClose={() => setConfirmAction("")} title={`${confirmAction} Remark`}>
          <Stack spacing={2}>
            <AppInput label="Remark *" multiline minRows={3} value={remark} onChange={(event) => setRemark(event.target.value)} />
            <DialogActions>
              <AppButton variant="text" onClick={() => setConfirmAction("")}>
                Cancel
              </AppButton>
              <AppButton onClick={handleConfirm}>Confirm</AppButton>
            </DialogActions>
          </Stack>
        </AppModal>
      ) : null}
      <ToastNotification open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </>
  );
}
