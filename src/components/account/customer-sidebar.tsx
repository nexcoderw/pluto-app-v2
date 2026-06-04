"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CUSTOMER_PORTAL_NAVIGATION } from "@/constants/customer-portal-navigation";
import styles from "./customer-portal-shell.module.css";

type CustomerSidebarProps = {
  activeHref: string;
  isOpen: boolean;
  onClose: () => void;
};

export function CustomerSidebar({
  activeHref,
  isOpen,
  onClose,
}: CustomerSidebarProps) {
  return (
    <aside className={styles.sidebar} data-open={isOpen}>
      <div className={styles.sidebarHeader}>
        <Link href="/" aria-label="Go to Pluto Booking home">
          <span className={styles.logoMark}>
            <Image src="/logo-b.png" alt="" width={30} height={30} priority />
          </span>
          <span>
            <strong>Pluto Booking</strong>
            <small>Customer portal</small>
          </span>
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={styles.closeButton}
          aria-label="Close customer menu"
          onClick={onClose}
        >
          <X aria-hidden="true" />
        </Button>
      </div>

      <nav
        className={styles.navigation}
        aria-label="Customer portal navigation"
      >
        {CUSTOMER_PORTAL_NAVIGATION.map((item, index) => {
          const Icon = item.icon;
          const isActive =
            activeHref === item.href ||
            (item.href !== "/account" && activeHref.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              data-active={isActive}
              onClick={onClose}
            >
              <span className={styles.navIndex}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <Icon aria-hidden="true" />
              <strong>{item.label}</strong>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
