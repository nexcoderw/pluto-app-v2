"use client";

import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PortalSignoutDialog } from "@/components/portal/portal-signout-dialog";
import { logoutUser, type UserAuthProfile } from "@/services/api/auth";
import { CustomerSidebar } from "./customer-sidebar";
import styles from "./customer-portal-shell.module.css";

type CustomerPortalShellProps = {
  user: UserAuthProfile;
  children: ReactNode;
};

export function CustomerPortalShell({
  user,
  children,
}: CustomerPortalShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const avatarStyle = user.imageUrl
    ? ({
        "--customer-avatar-image": `url("${user.imageUrl}")`,
      } as CSSProperties)
    : undefined;

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logoutUser();
      toast.success("You have been signed out.", {
        description: "Your customer session has ended.",
      });
    } catch {
      toast.warning("Your local session was cleared.", {
        description: "Sign in again before opening protected pages.",
      });
    } finally {
      setIsLoggingOut(false);
      setIsLogoutDialogOpen(false);
      router.replace("/");
    }
  }

  return (
    <>
      <main className={styles.page}>
        <section className={styles.frame} aria-label="Customer account">
          <div
            className={styles.mobileBackdrop}
            data-open={isSidebarOpen}
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />

          <CustomerSidebar
            activeHref={pathname}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <div className={styles.workspace}>
            <header className={styles.topbar}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={styles.menuButton}
                aria-label="Open customer menu"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu aria-hidden="true" />
              </Button>

              <div className={styles.identity}>
                <span
                  className={styles.avatar}
                  data-has-image={Boolean(user.imageUrl)}
                  style={avatarStyle}
                  aria-hidden="true"
                >
                  {user.imageUrl
                    ? null
                    : getInitials(user.fullName || user.email)}
                </span>
                <span>
                  <strong>{user.fullName}</strong>
                  <small>{user.email}</small>
                </span>
              </div>

              <Button
                type="button"
                variant="destructive"
                className={styles.logoutButton}
                aria-label="Sign out"
                onClick={() => setIsLogoutDialogOpen(true)}
              >
                <LogOut aria-hidden="true" />
                <span>Exit</span>
              </Button>
            </header>

            {children}
          </div>
        </section>
      </main>

      <PortalSignoutDialog
        open={isLogoutDialogOpen}
        isSigningOut={isLoggingOut}
        onOpenChange={setIsLogoutDialogOpen}
        onConfirm={() => void handleLogout()}
      />
    </>
  );
}

function getInitials(value: string) {
  const [first = "P", second = "B"] = value.trim().split(/\s+/).filter(Boolean);

  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
}
