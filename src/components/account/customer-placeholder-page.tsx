"use client";

import { ArrowRight, Clock3 } from "lucide-react";
import Link from "next/link";
import { CustomerPortalLoading } from "@/components/account/customer-portal-loading";
import { CustomerPortalShell } from "@/components/account/customer-portal-shell";
import { PortalAccessBoundary } from "@/components/portal/portal-access-boundary";
import type { UserAuthProfile } from "@/services/api/auth";
import styles from "./customer-portal-shell.module.css";

type CustomerPlaceholderPageProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export function CustomerPlaceholderPage(props: CustomerPlaceholderPageProps) {
  return (
    <PortalAccessBoundary
      allowedRole="CUSTOMER"
      loadingFallback={<CustomerPortalLoading />}
    >
      {(user) => <PlaceholderContent user={user} {...props} />}
    </PortalAccessBoundary>
  );
}

function PlaceholderContent({
  user,
  title,
  description,
  actionLabel = "Back to dashboard",
  actionHref = "/account",
}: CustomerPlaceholderPageProps & { user: UserAuthProfile }) {
  return (
    <CustomerPortalShell user={user}>
      <section className={styles.welcomePanel}>
        <span>
          <Clock3 aria-hidden="true" />
          Coming soon
        </span>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className={styles.welcomeActions}>
          <Link href={actionHref}>
            {actionLabel}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </CustomerPortalShell>
  );
}
