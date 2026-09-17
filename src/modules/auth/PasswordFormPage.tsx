import { Alert, CardContent, Stack } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { AppInput } from "../../components/common/AppInput";
import { authService } from "../../services/auth.service";
import type { PasswordFormValues } from "../../types";

interface PasswordFormPageProps {
  mode: "reset" | "change";
}

export function PasswordFormPage({ mode }: PasswordFormPageProps) {
  const requiresCurrentPassword = mode === "change";
  const formik = useFormik<PasswordFormValues>({
    initialValues: { currentPassword: "", password: "", confirmPassword: "" },
    validationSchema: Yup.object({
      currentPassword: requiresCurrentPassword ? Yup.string().required("Current password is required.") : Yup.string(),
      password: Yup.string()
        .min(8, "Password must be at least 8 characters.")
        .matches(/[A-Z]/, "Password must include an uppercase letter.")
        .matches(/[a-z]/, "Password must include a lowercase letter.")
        .matches(/[0-9]/, "Password must include a number.")
        .matches(/[^A-Za-z0-9]/, "Password must include a special character.")
        .required("Password is required."),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match.")
        .required("Confirm password is required."),
    }),
    onSubmit: async (values, helpers) => {
      try {
        if (mode === "change") {
          await authService.changePassword(values);
        } else {
          await authService.resetPassword(values);
        }
        helpers.setStatus({ success: "Password updated successfully." });
      } catch (error) {
        helpers.setStatus({ error: error instanceof Error ? error.message : "Unable to update password." });
      }
    },
  });

  return (
    <Stack alignItems="center" sx={{ minHeight: mode === "reset" ? "100vh" : undefined, justifyContent: "center", bgcolor: mode === "reset" ? "background.default" : undefined, p: mode === "reset" ? 2 : 0 }}>
      <AppCard title={mode === "change" ? "Change Password" : "Reset Password"} subtitle="Password validation is handled with Formik and Yup.">
        <CardContent>
          <Stack spacing={2} component="form" onSubmit={formik.handleSubmit}>
            {formik.status?.error ? <Alert severity="error">{formik.status.error}</Alert> : null}
            {formik.status?.success ? <Alert severity="success">{formik.status.success}</Alert> : null}
            {requiresCurrentPassword ? (
              <AppInput
                label="Current Password *"
                name="currentPassword"
                type="password"
                value={formik.values.currentPassword}
                error={formik.touched.currentPassword && Boolean(formik.errors.currentPassword)}
                helperText={formik.touched.currentPassword ? formik.errors.currentPassword : undefined}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              />
            ) : null}
            <AppInput
              label="New Password *"
              name="password"
              type="password"
              value={formik.values.password}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password ? formik.errors.password : undefined}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
            />
            <AppInput
              label="Confirm Password *"
              name="confirmPassword"
              type="password"
              value={formik.values.confirmPassword}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword ? formik.errors.confirmPassword : undefined}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
            />
            <AppButton type="submit" disabled={formik.isSubmitting}>
              Update Password
            </AppButton>
          </Stack>
        </CardContent>
      </AppCard>
    </Stack>
  );
}
