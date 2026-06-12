const PENDING_EMAIL_KEY = "pluto:pending-email-verification";

export function storePendingVerificationEmail(email: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(PENDING_EMAIL_KEY, email.trim().toLowerCase());
}

export function getPendingVerificationEmail(): string {
  if (typeof window === "undefined") {
    return "";
  }

  return window.sessionStorage.getItem(PENDING_EMAIL_KEY) ?? "";
}

export function clearPendingVerificationEmail(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(PENDING_EMAIL_KEY);
}
