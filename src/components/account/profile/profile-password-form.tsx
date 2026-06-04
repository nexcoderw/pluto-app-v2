"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  KeyRound,
  Loader2,
  LockKeyhole,
  Save,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { changeUserPassword } from "@/services/api/auth";
import { ApiRequestError } from "@/services/api/errors";
import styles from "./account-profile-page.module.css";

type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type PasswordFormErrors = Partial<Record<keyof PasswordFormState, string>>;

const initialPasswordForm: PasswordFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function ProfilePasswordForm() {
  const [form, setForm] = useState<PasswordFormState>(initialPasswordForm);
  const [errors, setErrors] = useState<PasswordFormErrors>({});
  const passwordRules = useMemo(
    () => getPasswordRules(form.newPassword),
    [form.newPassword],
  );
  const changeMutation = useMutation({
    mutationFn: changeUserPassword,
    onSuccess: () => {
      setForm(initialPasswordForm);
      setErrors({});
      toast.success("Password changed.", {
        description: "Your account password was updated successfully.",
      });
    },
    onError: (error) => {
      if (error instanceof ApiRequestError) {
        toast.error("Password update failed.", {
          description: error.message,
        });
        return;
      }

      toast.error("Password update failed.", {
        description: "Check your password details and try again.",
      });
    },
  });

  function updateField(field: keyof PasswordFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validatePasswordForm(form, passwordRules);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    changeMutation.mutate(form);
  }

  return (
    <form className={styles.detailsPanel} onSubmit={handleSubmit}>
      <div className={styles.panelHeader}>
        <span>
          <ShieldCheck aria-hidden="true" />
          Security
        </span>
        <h2>Change password</h2>
        <p>
          Use a strong password that is unique to Pluto Booking. Your active
          session stays open after a successful update.
        </p>
      </div>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Current password</span>
          <div data-invalid={Boolean(errors.currentPassword)}>
            <LockKeyhole aria-hidden="true" />
            <input
              type="password"
              value={form.currentPassword}
              placeholder="Enter current password"
              autoComplete="current-password"
              onChange={(event) =>
                updateField("currentPassword", event.target.value)
              }
            />
          </div>
          {errors.currentPassword ? (
            <small>{errors.currentPassword}</small>
          ) : null}
        </label>

        <label className={styles.field}>
          <span>New password</span>
          <div data-invalid={Boolean(errors.newPassword)}>
            <KeyRound aria-hidden="true" />
            <input
              type="password"
              value={form.newPassword}
              placeholder="Create a strong password"
              autoComplete="new-password"
              onChange={(event) =>
                updateField("newPassword", event.target.value)
              }
            />
          </div>
          {errors.newPassword ? <small>{errors.newPassword}</small> : null}
        </label>

        <label className={styles.field}>
          <span>Confirm password</span>
          <div data-invalid={Boolean(errors.confirmPassword)}>
            <KeyRound aria-hidden="true" />
            <input
              type="password"
              value={form.confirmPassword}
              placeholder="Repeat new password"
              autoComplete="new-password"
              onChange={(event) =>
                updateField("confirmPassword", event.target.value)
              }
            />
          </div>
          {errors.confirmPassword ? (
            <small>{errors.confirmPassword}</small>
          ) : null}
        </label>
      </div>

      <div className={styles.passwordChecklist}>
        {passwordRules.map((rule) => (
          <span key={rule.label} data-valid={rule.valid}>
            <ShieldCheck aria-hidden="true" />
            {rule.label}
          </span>
        ))}
      </div>

      <div className={styles.formFooter}>
        <p>
          Passwords must include uppercase, lowercase, a number, and a special
          character.
        </p>
        <Button
          type="submit"
          className={styles.saveButton}
          disabled={changeMutation.isPending}
        >
          {changeMutation.isPending ? (
            <Loader2 aria-hidden="true" className={styles.spinner} />
          ) : (
            <Save aria-hidden="true" />
          )}
          Update password
        </Button>
      </div>
    </form>
  );
}

function getPasswordRules(password: string) {
  return [
    { label: "At least 12 characters", valid: password.length >= 12 },
    {
      label: "Uppercase and lowercase",
      valid: /[A-Z]/.test(password) && /[a-z]/.test(password),
    },
    { label: "At least one number", valid: /\d/.test(password) },
    {
      label: "At least one special character",
      valid: /[^A-Za-z0-9]/.test(password),
    },
  ];
}

function validatePasswordForm(
  form: PasswordFormState,
  passwordRules: ReturnType<typeof getPasswordRules>,
): PasswordFormErrors {
  const errors: PasswordFormErrors = {};

  if (!form.currentPassword) {
    errors.currentPassword = "Enter your current password.";
  }

  if (!passwordRules.every((rule) => rule.valid)) {
    errors.newPassword = "Create a stronger password before saving.";
  }

  if (form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (form.currentPassword && form.currentPassword === form.newPassword) {
    errors.newPassword = "Choose a password different from the current one.";
  }

  return errors;
}
