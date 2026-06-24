import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Plane,
  PlaneTakeoff,
  ShieldCheck,
  TicketCheck,
} from "lucide-react";
import styles from "./flight-request-page.module.css";

const heroPoints = [
  { icon: ShieldCheck, label: "Secure request" },
  { icon: BadgeCheck, label: "Manual flight search" },
  { icon: TicketCheck, label: "Payment link after approval" },
];

export function FlightRequestHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <span className={styles.eyebrow}>
          <PlaneTakeoff aria-hidden="true" />
          Managed flight desk
        </span>
        <h1>Request a flight without chasing fares.</h1>
        <p>
          Share the route, dates, and traveler details. Pluto Booking reviews
          the options manually and keeps every update inside your account.
        </p>
        <div className={styles.heroActions}>
          <Link href="/account/flight-requests">
            My requests
            <ArrowRight aria-hidden="true" />
          </Link>
          <span>
            <ShieldCheck aria-hidden="true" />
            Customers only
          </span>
        </div>
      </div>

      <aside className={styles.flightDeskCard} aria-label="Flight desk summary">
        <div className={styles.flightDeskTop}>
          <span>
            <Plane aria-hidden="true" />
          </span>
          <strong>PLUTO FLIGHT</strong>
        </div>
        <div className={styles.flightPath} aria-hidden="true">
          <span>KGL</span>
          <i />
          <span>ANY</span>
        </div>
        <ul>
          {heroPoints.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.label}>
                <Icon aria-hidden="true" />
                {item.label}
              </li>
            );
          })}
        </ul>
      </aside>
    </section>
  );
}
