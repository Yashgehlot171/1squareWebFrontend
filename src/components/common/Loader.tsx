import { Grid, Skeleton, Stack } from "@mui/material";

export function Loader() {
  return (
    <Stack spacing={2}>
      <Skeleton variant="rounded" height={86} />
      <Grid container spacing={2}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Skeleton variant="rounded" height={150} />
          </Grid>
        ))}
      </Grid>
      <Skeleton variant="rounded" height={320} />
    </Stack>
  );
}
