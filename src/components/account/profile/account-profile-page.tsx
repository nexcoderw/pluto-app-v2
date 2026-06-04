"use client";

import { useState } from "react";
import {
  ChevronRight,
  KeyRound,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { PortalAccessBoundary } from "@/components/portal/portal-access-boundary";
import { PortalShell } from "@/components/portal/portal-shell";
import { getCustomerPortalNavigation } from "@/components/account/account-portal-navigation";
import type { UserAuthProfile } from "@/services/api/auth";
import { AccountProfileSkeleton } from "./account-profile-skeleton";
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

export function AccountProfilePage() {
  return (
    <PortalAccessBoundary
      allowedRole="CUSTOMER"
      loadingFallback={<AccountProfileSkeleton />}
    >
      {(user) => <AccountProfileWorkspace user={user} />}
    </PortalAccessBoundary>
  );
}

function AccountProfileWorkspace({ user }: { user: UserAuthProfile }) {
  const [profile, setProfile] = useState(user);
  const [activeTab, setActiveTab] = useState<ProfileTab>("details");

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
      hideHero
    >
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

        <div className={styles.tabContent} role="tabpanel">
          {activeTab === "details" ? (
            <ProfileDetailsForm user={profile} onUserUpdated={setProfile} />
          ) : null}
          {activeTab === "security" ? <ProfilePasswordForm /> : null}
        </div>
      </section>
    </PortalShell>
  );
}
