import LockRoundedIcon from "@mui/icons-material/LockRounded";
import {
  Alert,
  Box,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { AppSelect } from "../../components/common/AppSelect";
import { PermissionGuard } from "../../components/common/PermissionGuard";
import { PageHeader } from "../../components/common/PageHeader";
import { ToastNotification } from "../../components/common/ToastNotification";
import { roleService, SUPER_ADMIN_ROLE_SLUG, type PermissionApiItem, type RoleApiItem } from "../../services/role.service";
import type { OptionItem } from "../../types";

export function PermissionMatrixPage() {
  const [roles, setRoles] = useState<RoleApiItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionApiItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [checkedIds, setCheckedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([roleService.list(), roleService.listPermissions()])
      .then(([roleList, permissionList]) => {
        setRoles(roleList);
        setPermissions(permissionList);
        if (roleList.length) {
          setSelectedRoleId(String(roleList[0].id));
        }
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load roles and permissions."))
      .finally(() => setLoading(false));
  }, []);

  const selectedRole = useMemo(() => roles.find((role) => String(role.id) === selectedRoleId) ?? null, [roles, selectedRoleId]);
  const isProtected = Boolean(selectedRole && (selectedRole.slug === SUPER_ADMIN_ROLE_SLUG || selectedRole.isSystem));

  useEffect(() => {
    if (selectedRole) {
      setCheckedIds(new Set(selectedRole.permissions.map((permission) => permission.id)));
    } else {
      setCheckedIds(new Set());
    }
  }, [selectedRole]);

  const roleOptions: OptionItem[] = roles.map((role) => ({ label: role.name, value: String(role.id) }));

  const groupedPermissions = useMemo(() => {
    const groups = new Map<string, PermissionApiItem[]>();
    permissions.forEach((permission) => {
      const list = groups.get(permission.module) ?? [];
      list.push(permission);
      groups.set(permission.module, list);
    });
    return groups;
  }, [permissions]);

  const togglePermission = (permissionId: number) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setSaving(true);
    setError("");
    try {
      const updated = await roleService.updatePermissions(selectedRole.id, Array.from(checkedIds));
      setRoles((prev) => prev.map((role) => (role.id === updated.id ? updated : role)));
      setToast("Permissions updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update permissions.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Stack alignItems="center" py={6}>
        <CircularProgress size={28} />
      </Stack>
    );
  }

  return (
    <>
      <PageHeader
        title="Permission Matrix"
        subtitle="Assign backend permissions to a role, grouped by module. Live-wired to /admin/permissions and /admin/roles/:roleId/permissions."
      />

      {error ? (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      {!roles.length ? (
        <Alert severity="info">No roles exist yet. Create a role first.</Alert>
      ) : (
        <Stack spacing={2}>
          <AppCard title="Role" subtitle="Choose which role's permissions to view or edit.">
            <Box maxWidth={360}>
              <AppSelect label="Role" value={selectedRoleId} onChange={setSelectedRoleId} options={roleOptions} />
            </Box>
          </AppCard>

          {isProtected ? (
            <Alert severity="warning" icon={<LockRoundedIcon fontSize="inherit" />}>
              "{selectedRole?.name}" is a protected system role and holds every permission by design. Its assignments cannot be
              edited from this screen. The backend also rejects any attempt to remove role/permission-management permissions
              from your own super-admin role, regardless of this screen.
            </Alert>
          ) : null}

          {Array.from(groupedPermissions.entries()).map(([module, modulePermissions]) => (
            <AppCard key={module} title={module}>
              <Grid container spacing={1}>
                {modulePermissions.map((permission) => (
                  <Grid item xs={12} sm={6} md={4} key={permission.id}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checkedIds.has(permission.id)}
                          disabled={isProtected}
                          onChange={() => togglePermission(permission.id)}
                        />
                      }
                      label={
                        <Stack>
                          <Typography variant="body2">{permission.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {permission.slug}
                          </Typography>
                        </Stack>
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </AppCard>
          ))}

          <PermissionGuard permission="PERMISSION_EDIT">
            <Stack direction="row">
              <AppButton onClick={handleSave} disabled={isProtected || saving || !selectedRole}>
                {saving ? "Saving…" : "Save Permissions"}
              </AppButton>
            </Stack>
          </PermissionGuard>
        </Stack>
      )}

      <ToastNotification open={Boolean(toast)} message={toast} onClose={() => setToast("")} />
    </>
  );
}
