import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { EmailVerification } from "@/components/auth/email-verification";

export const metadata: Metadata = {
  title: "Verify Email",
  description:
    "Verify your email address to finish creating your Pluto Booking account.",
  robots: {
    index: false,
    follow: false,
  },
};

type VerifyEmailPageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const params = await searchParams;
  const token = Array.isArray(params.token) ? params.token[0] : params.token;

  return (
    <AuthShell tone="recovery">
      <EmailVerification token={token} />
    </AuthShell>
  );
}
