import { Link as RouterLink } from "react-router-dom";
import { Alert, CardContent, Link, Stack, Typography } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { AppInput } from "../../components/common/AppInput";
import { authService } from "../../services/auth.service";

const schema = Yup.object({
  identifier: Yup.string().required("Email or mobile is required."),
});

export function ForgotPasswordPage() {
  const formik = useFormik({
    initialValues: { identifier: "" },
    validationSchema: schema,
    onSubmit: async (values, helpers) => {
      try {
        await authService.forgotPassword(values.identifier);
        helpers.setStatus({ success: "Reset link generated in mock service. Use the reset password page to continue." });
      } catch (error) {
        helpers.setStatus({ error: error instanceof Error ? error.message : "Unable to process forgot password request." });
      }
    },
  });

  return (
    <Stack alignItems="center" sx={{ minHeight: "100vh", justifyContent: "center", bgcolor: "background.default", p: 2 }}>
      <AppCard title="Forgot Password" subtitle="Enter registered email or mobile to receive a reset link.">
        <CardContent>
          <Stack spacing={2} component="form" onSubmit={formik.handleSubmit}>
            {formik.status?.error ? <Alert severity="error">{formik.status.error}</Alert> : null}
            {formik.status?.success ? <Alert severity="success">{formik.status.success}</Alert> : null}
            <AppInput
              label="Email / Mobile *"
              name="identifier"
              value={formik.values.identifier}
              error={formik.touched.identifier && Boolean(formik.errors.identifier)}
              helperText={formik.touched.identifier ? formik.errors.identifier : undefined}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
            />
            <AppButton type="submit" disabled={formik.isSubmitting}>
              Send Reset Link
            </AppButton>
            <Typography variant="body2">
              <Link component={RouterLink} to="/reset-password" underline="hover">
                Go to reset password
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </AppCard>
    </Stack>
  );
}
