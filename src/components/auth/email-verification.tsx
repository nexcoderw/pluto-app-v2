"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MailCheck,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  clearPendingVerificationEmail,
  confirmEmailVerification,
  getPendingVerificationEmail,
  resendEmailVerification,
  storePendingVerificationEmail,
} from "@/services/api/auth";
import { ApiRequestError } from "@/services/api/errors";
import styles from "./email-verification.module.css";

type EmailVerificationProps = {
  token?: string;
};

const RESEND_COOLDOWN_SECONDS = 60;

export function EmailVerification({ token }: EmailVerificationProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [verified, setVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const deviceName = useMemo(() => {
    if (typeof navigator === "undefined") {
      return "Pluto browser";
    }

    return navigator.userAgent.slice(0, 120);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setEmail(getPendingVerificationEmail());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1_000);

    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const confirmMutation = useMutation({
    mutationFn: () =>
      confirmEmailVerification({
        token: token ?? "",
        deviceName,
      }),
    onSuccess: (response) => {
      clearPendingVerificationEmail();
      setVerified(true);
      setConfirmError("");
      toast.success(response.message, {
        description: "Your secure Pluto Booking session is ready.",
      });

      window.setTimeout(() => {
        router.replace(
          response.user.requiresPhoneNumber ? "/complete-phone" : "/",
        );
      }, 1_800);
    },
    onError: (error) => {
      const apiError = toApiError(
        error,
        "Email verification could not be completed. Request a new link.",
      );
      setConfirmError(apiError.message);
      toast.error(apiError.message);
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => resendEmailVerification({ email: email.trim() }),
    onSuccess: (response) => {
      storePendingVerificationEmail(email);
      setEmailError("");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      toast.success(response.message, {
        description: "Check your inbox and spam folder for the new link.",
      });
    },
    onError: (error) => {
      const apiError = toApiError(
        error,
        "The verification email could not be requested. Try again shortly.",
      );
      setEmailError(apiError.message);
      toast.error(apiError.message);
    },
  });

  function requestVerificationEmail() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailError("Enter the email address used during registration.");
      return;
    }

    setEmail(normalizedEmail);
    setEmailError("");
    resendMutation.mutate();
  }

  if (verified) {
    return (
      <section className={styles.panel} data-state="success">
        <span className={styles.stateIcon}>
          <CheckCircle2 aria-hidden="true" />
        </span>
        <div className={styles.heading}>
          <span>Verification complete</span>
          <h1>Your account is ready</h1>
          <p>
            Your email is verified. We are opening Pluto Booking with your
            secure session.
          </p>
        </div>
        <div className={styles.redirectStatus}>
          <LoaderCircle aria-hidden="true" />
          Redirecting securely
        </div>
      </section>
    );
  }

  return (
    <section className={styles.panel}>
      <span className={styles.stateIcon} data-error={Boolean(confirmError)}>
        {confirmError ? (
          <CircleAlert aria-hidden="true" />
        ) : token ? (
          <ShieldCheck aria-hidden="true" />
        ) : (
          <MailCheck aria-hidden="true" />
        )}
      </span>

      <div className={styles.heading}>
        <span>{token ? "Secure verification" : "Check your inbox"}</span>
        <h1>
          {confirmError
            ? "Request a fresh link"
            : token
              ? "Verify your email"
              : "Finish creating your account"}
        </h1>
        <p>
          {confirmError
            ? confirmError
            : token
              ? "Confirm this one-time link to activate your account and start a secure session."
              : "We sent a one-time verification link to the email used during registration."}
        </p>
      </div>

      {token && !confirmError ? (
        <div className={styles.primaryFlow}>
          <div className={styles.securityNote}>
            <LockKeyhole aria-hidden="true" />
            <span>
              <strong>One-time confirmation</strong>
              <small>This link expires and cannot be reused.</small>
            </span>
          </div>
          <Button
            type="button"
            className={styles.primaryButton}
            disabled={confirmMutation.isPending}
            onClick={() => confirmMutation.mutate()}
            aria-label={
              confirmMutation.isPending ? "Verifying email" : "Verify email"
            }
          >
            {confirmMutation.isPending ? (
              <LoaderCircle className={styles.spinner} aria-hidden="true" />
            ) : (
              <>
                <ShieldCheck aria-hidden="true" />
                Verify email
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className={styles.resendFlow}>
          <div className={styles.fieldGroup}>
            <Label htmlFor="verificationEmail">Registration email</Label>
            <div
              className={styles.inputShell}
              data-invalid={Boolean(emailError)}
            >
              <Mail aria-hidden="true" />
              <Input
                id="verificationEmail"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setEmailError("");
                }}
              />
            </div>
            {emailError ? (
              <p className={styles.inlineError}>{emailError}</p>
            ) : null}
          </div>

          <Button
            type="button"
            className={styles.primaryButton}
            disabled={resendMutation.isPending || resendCooldown > 0}
            onClick={requestVerificationEmail}
            aria-label={
              resendMutation.isPending
                ? "Requesting verification email"
                : "Send verification email"
            }
          >
            {resendMutation.isPending ? (
              <LoaderCircle className={styles.spinner} aria-hidden="true" />
            ) : (
              <>
                <RefreshCcw aria-hidden="true" />
                {resendCooldown > 0
                  ? `Try again in ${resendCooldown}s`
                  : "Send verification email"}
              </>
            )}
          </Button>
        </div>
      )}

      <Link href="/login" className={styles.secondaryLink}>
        Sign in instead
        <ArrowRight aria-hidden="true" />
      </Link>
    </section>
  );
}

function toApiError(error: unknown, fallbackMessage: string): ApiRequestError {
  return error instanceof ApiRequestError
    ? error
    : new ApiRequestError({ message: fallbackMessage });
}
