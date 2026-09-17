import { Box, FormGroup, FormControlLabel, Checkbox, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { AppButton } from "../../components/common/AppButton";
import { AppInput } from "../../components/common/AppInput";
import { Loader } from "../../components/common/Loader";
import { PageHeader } from "../../components/common/PageHeader";
import { ToastNotification } from "../../components/common/ToastNotification";
import { permissionGroups } from "../../constants/permissions";
import { rolesMock } from "../../mock-data/roles.mock";
import { roleService } from "../../services/role.service";
import type { Permission, RoleCode, RoleDefinition } from "../../types";

const roleSchema = z.object({
  name: z.string().min(2, "Role name is required."),
  description: z.string().min(5, "Description is required."),
});

export function RoleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState<RoleDefinition>({
    id: "role_new",
    name: "",
    code: "admin" as RoleCode,
    description: "",
    permissions: [],
    status: "active",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    roleService.getRoleById(id).then((response) => {
      if (response.data) {
        setForm(response.data);
      }
      setLoading(false);
    });
  }, [id]);

  const togglePermission = (permission: Permission) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((item) => item !== permission)
        : [...prev.permissions, permission],
    }));
  };

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

    await roleService.saveRole(form);
    setToast(true);
    setTimeout(() => navigate("/roles"), 600);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <PageHeader title={isEdit ? "Edit Role" : "Create Role"} subtitle="Permission-based role form driven by the role service." />
      <Box maxWidth={800}>
        <Stack spacing={2}>
          <AppInput label="Role Name" value={form.name} error={Boolean(errors.name)} helperText={errors.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
          <AppInput label="Description" value={form.description} error={Boolean(errors.description)} helperText={errors.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
          <FormGroup>
            {Object.entries(permissionGroups).map(([group, permissions]) => (
              <Box key={group} sx={{ border: 1, borderColor: "divider", borderRadius: 2, p: 2, mb: 1.5 }}>
                <strong>{group}</strong>
                <Stack direction="row" flexWrap="wrap">
                  {permissions.map((permission) => (
                    <FormControlLabel
                      key={permission}
                      control={<Checkbox checked={form.permissions.includes(permission)} onChange={() => togglePermission(permission)} />}
                      label={permission}
                    />
                  ))}
                </Stack>
              </Box>
            ))}
          </FormGroup>
          <Stack direction="row" spacing={1.5}>
            <AppButton onClick={handleSubmit}>{isEdit ? "Update Role" : "Save Role"}</AppButton>
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
