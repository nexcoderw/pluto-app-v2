"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Mail, Phone, Save, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  updateUserProfile,
  type UpdateUserProfileRequest,
  type UserAuthProfile,
} from "@/services/api/auth";
import { ApiRequestError } from "@/services/api/errors";
import styles from "./account-profile-page.module.css";

type ProfileDetailsFormProps = {
  user: UserAuthProfile;
  onUserUpdated: (user: UserAuthProfile) => void;
};

type FormState = {
  fullName: string;
  email: string;
  phone: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export function ProfileDetailsForm({
  user,
  onUserUpdated,
}: ProfileDetailsFormProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(user));
  const [errors, setErrors] = useState<FormErrors>({});
  const initialForm = useMemo(() => toFormState(user), [user]);
  const updateMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (response) => {
      onUserUpdated(response.user);
      setForm(toFormState(response.user));
      setErrors({});
      toast.success("Profile updated.", {
        description: "Your account information was saved successfully.",
      });
    },
    onError: (error) => {
      if (error instanceof ApiRequestError) {
        toast.error("Profile update failed.", {
          description: error.message,
        });
        return;
      }

      toast.error("Profile update failed.", {
        description: "Please check your details and try again.",
      });
    },
  });

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    const payload = buildChangedPayload(initialForm, form);

    if (!Object.keys(payload).length) {
      toast.info("No changes to save.", {
        description: "Update one of your profile fields before saving.",
      });
      return;
    }

    updateMutation.mutate(payload);
  }

  return (
    <form className={styles.detailsPanel} onSubmit={handleSubmit}>
      <div className={styles.panelHeader}>
        <span>
          <UserRound aria-hidden="true" />
          Account details
        </span>
        <h2>Customer profile</h2>
        <p>
          Update the information used for booking confirmations, partner
          coordination, and secure account recovery.
        </p>
      </div>

      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Full name</span>
          <div data-invalid={Boolean(errors.fullName)}>
            <UserRound aria-hidden="true" />
            <input
              type="text"
              value={form.fullName}
              placeholder="Enter your full name"
              autoComplete="name"
              onChange={(event) => updateField("fullName", event.target.value)}
            />
          </div>
          {errors.fullName ? <small>{errors.fullName}</small> : null}
        </label>

        <label className={styles.field}>
          <span>Email address</span>
          <div data-invalid={Boolean(errors.email)}>
            <Mail aria-hidden="true" />
            <input
              type="email"
              value={form.email}
              placeholder="name@example.com"
              autoComplete="email"
              onChange={(event) => updateField("email", event.target.value)}
            />
          </div>
          {errors.email ? <small>{errors.email}</small> : null}
        </label>

        <label className={styles.field}>
          <span>Phone number</span>
          <div data-invalid={Boolean(errors.phone)}>
            <Phone aria-hidden="true" />
            <input
              type="tel"
              value={form.phone}
              placeholder="+250788123456"
              autoComplete="tel"
              onChange={(event) => updateField("phone", event.target.value)}
            />
          </div>
          {errors.phone ? <small>{errors.phone}</small> : null}
        </label>
      </div>

      <div className={styles.formFooter}>
        <p>
          Changing email or phone can require verification again before some
          account actions are available.
        </p>
        <Button
          type="submit"
          className={styles.saveButton}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <Loader2 aria-hidden="true" className={styles.spinner} />
          ) : (
            <Save aria-hidden="true" />
          )}
          Save changes
        </Button>
      </div>
    </form>
  );
}

function toFormState(user: UserAuthProfile): FormState {
  return {
    fullName: user.fullName,
    email: user.email,
    phone: user.phone ?? "",
  };
}

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (form.fullName.trim().length < 2) {
    errors.fullName = "Enter at least 2 characters.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!/^\+?[1-9]\d{7,14}$/.test(form.phone.trim())) {
    errors.phone = "Use international format, for example +250788123456.";
  }

  return errors;
}

function buildChangedPayload(
  initialForm: FormState,
  form: FormState,
): UpdateUserProfileRequest {
  const payload: UpdateUserProfileRequest = {};
  const nextFullName = form.fullName.trim();
  const nextEmail = form.email.trim().toLowerCase();
  const nextPhone = form.phone.trim();

  if (nextFullName !== initialForm.fullName.trim()) {
    payload.fullName = nextFullName;
  }

  if (nextEmail !== initialForm.email.trim().toLowerCase()) {
    payload.email = nextEmail;
  }

  if (nextPhone !== initialForm.phone.trim()) {
    payload.phone = nextPhone;
  }

  return payload;
}
