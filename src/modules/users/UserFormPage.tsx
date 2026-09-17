import { Box, Stack } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { AppButton } from "../../components/common/AppButton";
import { AppInput } from "../../components/common/AppInput";
import { AppSelect } from "../../components/common/AppSelect";
import { Loader } from "../../components/common/Loader";
import { PageHeader } from "../../components/common/PageHeader";
import { ToastNotification } from "../../components/common/ToastNotification";
import { rolesMock } from "../../mock-data/roles.mock";
import { roleService } from "../../services/role.service";
import { userService } from "../../services/user.service";
import type { OptionItem, RoleCode, UserRecord } from "../../types";

const userSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("Valid email is required."),
  mobile: z.string().min(10, "Mobile is required."),
  role: z.string().min(1, "Role is required."),
  status: z.string().min(1, "Status is required."),
});

const defaultForm: UserRecord = {
  id: "usr_new",
  name: "",
  email: "",
  mobile: "",
  role: "admin",
  roleLabel: "Admin",
  status: "active",
  createdDate: "2026-06-08",
  lastLogin: "-",
};

export function UserFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState<UserRecord>(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [toastOpen, setToastOpen] = useState(false);
  const [roleOptions, setRoleOptions] = useState<OptionItem[]>([]);

  useEffect(() => {
    roleService.getRoles().then((response) => {
      setRoleOptions(response.data.items.map((role) => ({ label: role.name, value: role.code })));
    });

    if (id) {
      userService.getUserById(id).then((response) => {
        if (response.data) {
          setForm(response.data);
        }
        setLoading(false);
      });
    }
  }, [id]);

  const statusOptions = useMemo<OptionItem[]>(
    () => [
      { label: "Active", value: "active" },
      { label: "Suspended", value: "suspended" },
    ],
    [],
  );

  const updateField = (key: keyof UserRecord, value: string) => {
    if (key === "role") {
      const selectedRole = rolesMock.find((role) => role.code === value);
      setForm((prev) => ({
        ...prev,
        role: value as RoleCode,
        roleLabel: selectedRole?.name ?? prev.roleLabel,
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [key]: value as never }));
  };

  const handleSubmit = async () => {
    const parsed = userSchema.safeParse(form);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        nextErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    if (isEdit) {
      await userService.updateUser(form);
    } else {
      await userService.createUser({ ...form, id: `usr_${Date.now()}` });
    }
    setToastOpen(true);
    setTimeout(() => navigate("/users"), 600);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <PageHeader title={isEdit ? "Edit User" : "Add User"} subtitle="Validated form backed by the mock service layer." />
      <Box maxWidth={720}>
        <Stack spacing={2.5}>
          <AppInput label="Name" value={form.name} error={Boolean(errors.name)} helperText={errors.name} onChange={(event) => updateField("name", event.target.value)} />
          <AppInput label="Email" value={form.email} error={Boolean(errors.email)} helperText={errors.email} onChange={(event) => updateField("email", event.target.value)} />
          <AppInput label="Mobile" value={form.mobile} error={Boolean(errors.mobile)} helperText={errors.mobile} onChange={(event) => updateField("mobile", event.target.value)} />
          <AppSelect label="Role" value={form.role} options={roleOptions} error={Boolean(errors.role)} helperText={errors.role} onChange={(value) => updateField("role", value)} />
          <AppSelect label="Status" value={form.status} options={statusOptions} error={Boolean(errors.status)} helperText={errors.status} onChange={(value) => updateField("status", value)} />
          <Stack direction="row" spacing={1.5}>
            <AppButton onClick={handleSubmit}>{isEdit ? "Update User" : "Create User"}</AppButton>
            <AppButton variant="text" onClick={() => navigate("/users")}>
              Cancel
            </AppButton>
          </Stack>
        </Stack>
      </Box>
      <ToastNotification open={toastOpen} message={`User ${isEdit ? "updated" : "created"} successfully.`} onClose={() => setToastOpen(false)} />
    </>
  );
}
