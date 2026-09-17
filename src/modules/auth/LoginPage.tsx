import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { Alert, Box, Card, CardContent, Checkbox, FormControlLabel, Link, Stack, Typography } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch } from "../../app/hooks";
import { setSession } from "../../app/store";
import { AppButton } from "../../components/common/AppButton";
import { AppInput } from "../../components/common/AppInput";
import { ToastNotification } from "../../components/common/ToastNotification";
import { authService } from "../../services/auth.service";
import { getFieldErrors } from "../../services/api/responseParser";
import type { LoginFormValues } from "../../types";

const loginSchema = Yup.object({
  identifier: Yup.string().required("Email or mobile is required."),
  password: Yup.string().required("Password is required."),
  rememberMe: Yup.boolean().required(),
});

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | undefined)?.from;

  const formik = useFormik<LoginFormValues>({
    initialValues: { identifier: "", password: "", rememberMe: true },
    validationSchema: loginSchema,
    onSubmit: async (values, helpers) => {
      try {
        const response = await authService.login(values);
        dispatch(setSession(response.data));
        helpers.setStatus({ success: true });
        navigate(from ?? authService.getRoleDashboardPath(response.data.user.role), { replace: true });
      } catch (error) {
        const fieldErrors = getFieldErrors(error);
        helpers.setErrors({
          identifier: fieldErrors.identifier,
          password: fieldErrors.password,
        });
        helpers.setStatus({ error: error instanceof Error ? error.message : "Unable to login." });
      }
    },
  });

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "background.default", p: 2 }}>
      <Card sx={{ width: "100%", maxWidth: 440 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3} component="form" onSubmit={formik.handleSubmit}>
            <Box>
              <Typography variant="h4">1Square Property</Typography>
              <Typography color="text.secondary">Role-wise admin login for Super Admin, Admin, and Support Team.</Typography>
            </Box>
            {formik.status?.error ? <Alert severity="error">{formik.status.error}</Alert> : null}
            <AppInput
              label="Email / Mobile *"
              name="identifier"
              value={formik.values.identifier}
              error={formik.touched.identifier && Boolean(formik.errors.identifier)}
              helperText={formik.touched.identifier ? formik.errors.identifier : undefined}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
            />
            <AppInput
              label="Password *"
              name="password"
              type="password"
              value={formik.values.password}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password ? formik.errors.password : undefined}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
            />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <FormControlLabel
                control={<Checkbox name="rememberMe" checked={formik.values.rememberMe} onChange={formik.handleChange} />}
                label="Remember token"
              />
              <Link component={RouterLink} to="/forgot-password" underline="hover">
                Forgot Password
              </Link>
            </Stack>
            <AppButton type="submit" size="large" disabled={formik.isSubmitting}>
              {formik.isSubmitting ? "Logging in..." : "Login"}
            </AppButton>
            <Alert severity="info">Use backend-provided admin credentials for this environment.</Alert>
          </Stack>
        </CardContent>
      </Card>
      <ToastNotification open={Boolean(formik.status?.success)} message="Login successful." onClose={() => formik.setStatus(undefined)} />
    </Box>
  );
}
