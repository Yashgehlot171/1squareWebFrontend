import { Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppCard } from "../../components/common/AppCard";
import { Loader } from "../../components/common/Loader";
import { PageHeader } from "../../components/common/PageHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { userService } from "../../services/user.service";
import type { UserRecord } from "../../types";

export function UserDetailsPage() {
  const { id = "" } = useParams();
  const [record, setRecord] = useState<UserRecord | null>(null);

  useEffect(() => {
    userService.getUserById(id).then((response) => setRecord(response.data));
  }, [id]);

  if (!record) {
    return <Loader />;
  }

  return (
    <>
      <PageHeader title="User Details" subtitle="Detailed record view sourced from the user service." />
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <AppCard title={record.name} subtitle={record.id}>
            <Typography>Email: {record.email}</Typography>
            <Typography>Mobile: {record.mobile}</Typography>
            <Typography>Role: {record.roleLabel}</Typography>
            <Typography>Created Date: {record.createdDate}</Typography>
            <Typography>Last Login: {record.lastLogin}</Typography>
            <StatusBadge value={record.status} />
          </AppCard>
        </Grid>
      </Grid>
    </>
  );
}
