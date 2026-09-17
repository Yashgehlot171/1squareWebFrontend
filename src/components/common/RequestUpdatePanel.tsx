import { Stack } from "@mui/material";
import { useState } from "react";
import { z } from "zod";
import type { OptionItem } from "../../types";
import { AppButton } from "./AppButton";
import { AppCard } from "./AppCard";
import { AppInput } from "./AppInput";
import { AppSelect } from "./AppSelect";

interface RequestUpdatePanelProps {
  title?: string;
  subtitle?: string;
  initialStatus: string;
  initialRemark: string;
  statusOptions: OptionItem[];
  submitLabel?: string;
  onSubmit: (payload: { status: string; remark: string }) => Promise<void>;
}

const updateSchema = z.object({
  status: z.string().min(1, "Status is required."),
  remark: z.string().min(3, "Remark must be at least 3 characters."),
});

export function RequestUpdatePanel({
  title = "Remark and Status Update",
  subtitle = "Update the request with an internal remark and the latest status.",
  initialStatus,
  initialRemark,
  statusOptions,
  submitLabel = "Save Update",
  onSubmit,
}: RequestUpdatePanelProps) {
  const [status, setStatus] = useState(initialStatus);
  const [remark, setRemark] = useState(initialRemark);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const parsed = updateSchema.safeParse({ status, remark });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        nextErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await onSubmit(parsed.data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppCard title={title} subtitle={subtitle}>
      <Stack spacing={2}>
        <AppSelect
          label="Status"
          value={status}
          onChange={setStatus}
          options={statusOptions}
          error={Boolean(errors.status)}
          helperText={errors.status}
        />
        <AppInput
          label="Remark"
          value={remark}
          multiline
          minRows={4}
          onChange={(event) => setRemark(event.target.value)}
          error={Boolean(errors.remark)}
          helperText={errors.remark}
        />
        <AppButton onClick={handleSubmit} disabled={submitting}>
          {submitLabel}
        </AppButton>
      </Stack>
    </AppCard>
  );
}
