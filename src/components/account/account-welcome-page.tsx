"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  Heart,
  Search,
  ShieldCheck,
} from "lucide-react";
import type { UserAuthProfile } from "@/services/api/auth";
import styles from "./customer-portal-shell.module.css";

type AccountWelcomePageProps = {
  user: UserAuthProfile;
};

const emptyPreviewItems = [
  {
    title: "Bookings",
    description: "Confirmed reservations will appear here once you book.",
    icon: CalendarCheck2,
  },
  {
    title: "Favorites",
    description: "Save cars, stays, and rooms you want to compare later.",
    icon: Heart,
  },
  {
    title: "Security",
    description: "Your customer workspace is protected by your active session.",
    icon: ShieldCheck,
  },
];

export function AccountWelcomePage({ user }: AccountWelcomePageProps) {
  return (
    <section className={styles.welcomePage}>
      <div className={styles.welcomePanel}>
        <span>
          <ShieldCheck aria-hidden="true" />
          Customer dashboard
        </span>
        <h1>Welcome back, {user.fullName}</h1>
        <p>
          Start from your customer dashboard, keep your saved listings
          organized, and return to profile settings whenever your booking
          details change.
        </p>
        <div className={styles.welcomeActions}>
          <Link href="/listings/cars">
            <Search aria-hidden="true" />
            Explore listings
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link href="/account/profile">
            Profile settings
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div
        className={styles.emptyPreview}
        aria-label="Customer workspace status"
      >
        {emptyPreviewItems.map((item) => {
          const Icon = item.icon;

          return (
            <article key={item.title}>
              <Icon aria-hidden="true" />
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
