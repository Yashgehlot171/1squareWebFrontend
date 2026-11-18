import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { Alert, Box, FormControlLabel, Stack, Switch } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { AppButton } from "../../components/common/AppButton";
import { AppInput } from "../../components/common/AppInput";
import { Loader } from "../../components/common/Loader";
import { PageHeader } from "../../components/common/PageHeader";
import { ToastNotification } from "../../components/common/ToastNotification";
import { roleService, SUPER_ADMIN_ROLE_SLUG, type RoleApiItem } from "../../services/role.service";

const roleSchema = z.object({
  name: z.string().min(2, "Role name is required."),
  description: z.string().optional(),
});

interface RoleFormState {
  name: string;
  description: string;
  isActive: boolean;
}

const emptyForm: RoleFormState = { name: "", description: "", isActive: true };

export function RoleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [role, setRole] = useState<RoleApiItem | null>(null);
  const [form, setForm] = useState<RoleFormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    setLoading(true);
    setError("");
    roleService
      .getById(id)
      .then((data) => {
        setRole(data);
        setForm({ name: data.name, description: data.description ?? "", isActive: data.isActive });
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load role."))
      .finally(() => setLoading(false));
  }, [id]);

  const isProtected = Boolean(role && (role.slug === SUPER_ADMIN_ROLE_SLUG || role.isSystem));

  const handleSubmit = async () => {
    const parsed = roleSchema.safeParse(form);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        nextErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setError("");
    setSaving(true);
    try {
      if (isEdit && id) {
        await roleService.update(id, { name: form.name, description: form.description || undefined, isActive: form.isActive });
      } else {
        await roleService.create({ name: form.name, description: form.description || undefined, isActive: form.isActive });
      }
      setToast(true);
      setTimeout(() => navigate("/roles"), 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save role.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <PageHeader
        title={isEdit ? "Edit Role" : "Create Role"}
        subtitle="Role name, description and active status. Permissions are assigned separately from the Permission Matrix. Live-wired to /admin/roles."
      />
      <Box maxWidth={800}>
        <Stack spacing={2}>
          {error ? (
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          ) : null}

          {isProtected ? (
            <Alert severity="warning" icon={<LockRoundedIcon fontSize="inherit" />}>
              "{role?.name}" is a protected system role. Its name, description and active status cannot be edited here, and its
              permissions cannot be reduced below the set required to manage roles and permissions. The backend enforces this
              regardless of this screen.
            </Alert>
          ) : null}

          <AppInput
            label="Role Name"
            value={form.name}
            disabled={isProtected}
            error={Boolean(errors.name)}
            helperText={errors.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <AppInput
            label="Description"
            value={form.description}
            disabled={isProtected}
            multiline
            minRows={2}
            error={Boolean(errors.description)}
            helperText={errors.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.isActive}
                disabled={isProtected}
                onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
              />
            }
            label="Active"
          />

          <Stack direction="row" spacing={1.5}>
            <AppButton onClick={handleSubmit} disabled={isProtected || saving}>
              {saving ? "Saving…" : isEdit ? "Update Role" : "Save Role"}
            </AppButton>
            <AppButton variant="text" onClick={() => navigate("/roles")}>
              Cancel
            </AppButton>
          </Stack>
        </Stack>
      </Box>
      <ToastNotification open={toast} message={`Role ${isEdit ? "updated" : "saved"} successfully.`} onClose={() => setToast(false)} />
    </>
  );
}
