import { Grid, Stack, Typography } from "@mui/material";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { setUser } from "../../app/store";
import { AppCard } from "../../components/common/AppCard";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { profileService } from "../../services/profile.service";

export function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    profileService
      .getMe()
      .then((response) => dispatch(setUser(response.data)))
      .catch(() => undefined);
  }, [dispatch]);

  return (
    <>
      <PageHeader title="My Profile" subtitle="Current signed-in admin profile and role access summary." />
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <AppCard title={user?.name ?? "User"} subtitle={user?.roleLabel ?? "Role"}>
            <Stack spacing={1}>
              <Typography>Email: {user?.email}</Typography>
              <Typography>Mobile: {user?.mobile}</Typography>
              <Typography>Role: {user?.role}</Typography>
              <Typography component="div">
                Status: <StatusBadge value={user?.status ?? "active"} />
              </Typography>
            </Stack>
          </AppCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <AppCard title="Permissions" subtitle="Backend-ready permission payload">
            <Stack spacing={1}>
              {user?.permissions.map((permission) => (
                <Typography key={permission} variant="body2">
                  {permission}
                </Typography>
              ))}
            </Stack>
          </AppCard>
        </Grid>
      </Grid>
    </>
  );
}
