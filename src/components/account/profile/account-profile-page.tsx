"use client";

import { useState } from "react";
import {
  MailCheck,
  Phone,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { PortalAccessBoundary } from "@/components/portal/portal-access-boundary";
import {
  PortalShell,
  type PortalMetric,
} from "@/components/portal/portal-shell";
import { getCustomerPortalNavigation } from "@/components/account/account-portal-navigation";
import type { UserAuthProfile } from "@/services/api/auth";
import { ProfileDetailsForm } from "./profile-details-form";
import { ProfileImagePanel } from "./profile-image-panel";
import styles from "./account-profile-page.module.css";

export function AccountProfilePage() {
  return (
    <PortalAccessBoundary allowedRole="CUSTOMER">
      {(user) => <AccountProfileWorkspace user={user} />}
    </PortalAccessBoundary>
  );
}

function AccountProfileWorkspace({ user }: { user: UserAuthProfile }) {
  const [profile, setProfile] = useState(user);
  const metrics = buildProfileMetrics(profile);

  return (
    <PortalShell
      variant="customer"
      user={profile}
      eyebrow="Profile settings"
      title="Manage your customer identity"
      description="Keep your booking profile accurate so partners can contact the right person before every confirmed reservation."
      homeHref="/account"
      homeLabel="Back to account"
      navigation={getCustomerPortalNavigation("/account/profile")}
      metrics={metrics}
    >
      <section className={styles.profileLayout}>
        <ProfileImagePanel user={profile} onUserUpdated={setProfile} />
        <ProfileDetailsForm user={profile} onUserUpdated={setProfile} />
      </section>
    </PortalShell>
  );
}

function buildProfileMetrics(user: UserAuthProfile): PortalMetric[] {
  return [
    {
      label: "Profile name",
      value: initialsFromName(user.fullName),
      description: "Displayed across booking and review workflows.",
      icon: UserRound as LucideIcon,
    },
    {
      label: "Email status",
      value: user.emailVerified ? "Verified" : "Review",
      description: user.emailVerified
        ? "Your email is verified."
        : "Email verification will be required after changes.",
      icon: MailCheck as LucideIcon,
    },
    {
      label: "Phone status",
      value: user.phoneVerified ? "Verified" : "Active",
      description: user.phone
        ? "This number is used for booking coordination."
        : "Add a phone number before booking.",
      icon: Phone as LucideIcon,
    },
    {
      label: "Access",
      value: "Secure",
      description: "Only your logged-in session can update this profile.",
      icon: ShieldCheck as LucideIcon,
    },
  ];
}

function initialsFromName(value: string) {
  const [first = "P", second = "B"] = value.trim().split(/\s+/).filter(Boolean);

  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
}
