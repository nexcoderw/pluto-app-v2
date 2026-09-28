"use client";

import { useState } from "react";
import {
  ChevronRight,
  KeyRound,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { CustomerPortalShell } from "@/components/account/customer-portal-shell";
import { PortalAccessBoundary } from "@/components/portal/portal-access-boundary";
import { cn } from "@/lib/utils";
import type { UserAuthProfile } from "@/services/api/auth";
import { ProfileDetailsForm } from "./profile-details-form";
import { ProfileImagePanel } from "./profile-image-panel";
import { ProfilePasswordForm } from "./profile-password-form";
import styles from "./account-profile-page.module.css";

type ProfileTab = "details" | "security";

const profileTabs: Array<{
  id: ProfileTab;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    id: "details",
    label: "Profile details",
    description: "Name, email, and phone",
    icon: UserRound,
  },
  {
    id: "security",
    label: "Password",
    description: "Secure account access",
    icon: KeyRound,
  },
];

export function AccountProfilePage({ formClassName }: { formClassName?: string }) {
  return (
    <PortalAccessBoundary allowedRole="CUSTOMER">
      {(user) => (
        <AccountProfileWorkspace user={user} formClassName={formClassName} />
      )}
    </PortalAccessBoundary>
  );
}

function AccountProfileWorkspace({
  user,
  formClassName,
}: {
  user: UserAuthProfile;
  formClassName?: string;
}) {
  const [profile, setProfile] = useState(user);
  const [activeTab, setActiveTab] = useState<ProfileTab>("details");

  return (
    <CustomerPortalShell user={profile}>
      <section className={styles.profileLayout}>
        <aside
          className={styles.tabsSidebar}
          aria-label="Profile settings tabs"
        >
          <ProfileImagePanel
            user={profile}
            onUserUpdated={setProfile}
            variant="sidebar"
          />

          <div
            className={styles.tabsList}
            role="tablist"
            aria-orientation="vertical"
          >
            {profileTabs.map((tab) => {
              const Icon = tab.icon;
              const selected = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={styles.tabButton}
                  data-active={selected}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon aria-hidden="true" />
                  <span>
                    <strong>{tab.label}</strong>
                    <small>{tab.description}</small>
                  </span>
                  <ChevronRight aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </aside>

        <div className={cn(styles.tabContent, formClassName)} role="tabpanel">
          {activeTab === "details" ? (
            <ProfileDetailsForm user={profile} onUserUpdated={setProfile} />
          ) : null}
          {activeTab === "security" ? <ProfilePasswordForm /> : null}
        </div>
      </section>
    </CustomerPortalShell>
  );
}
