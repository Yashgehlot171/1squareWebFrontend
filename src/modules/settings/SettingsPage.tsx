import { Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { AppCard } from "../../components/common/AppCard";
import { Loader } from "../../components/common/Loader";
import { PageHeader } from "../../components/common/PageHeader";
import { auditService } from "../../services/audit.service";
import type { SettingsSection } from "../../types";

export function SettingsPage() {
  const [sections, setSections] = useState<SettingsSection[]>([]);

  useEffect(() => {
    auditService.getSettings().then((response) => setSections(response.data));
  }, []);

  if (!sections.length) {
    return <Loader />;
  }

  return (
    <>
      <PageHeader title="Settings" subtitle="Super Admin only configuration surface." />
      <Grid container spacing={2}>
        {sections.map((section) => (
          <Grid item xs={12} md={6} key={section.key}>
            <AppCard title={section.title} subtitle={section.key}>
              <Typography color="text.secondary">{section.description}</Typography>
            </AppCard>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
