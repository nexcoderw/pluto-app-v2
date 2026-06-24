"use client";

import {
  CalendarDays,
  Mail,
  MapPin,
  PlaneLanding,
  UserRound,
} from "lucide-react";
import type { FlightRequestFormState } from "./flight-request-types";
import styles from "./flight-request-overview.module.css";

type FlightRequestOverviewProps = {
  form: FlightRequestFormState;
};

export function FlightRequestOverview({ form }: FlightRequestOverviewProps) {
  const origin = form.originAirportName || form.originAirportCode || "From";
  const destination =
    form.destinationAirportName || form.destinationAirportCode || "To";
  const route = `${origin} to ${destination}`;

  return (
    <aside className={styles.card} aria-label="Flight request overview">
      <div className={styles.header}>
        <span className={styles.icon}>
          <PlaneLanding aria-hidden="true" />
        </span>
        <span className={styles.eyebrow}>Request overview</span>
      </div>

      <div className={styles.route}>
        <small>Route</small>
        <h2>{route}</h2>
      </div>

      <dl className={styles.summary}>
        <div>
          <dt>
            <UserRound aria-hidden="true" />
            Name
          </dt>
          <dd>{form.travelerName.trim() || "Traveler name"}</dd>
        </div>
        <div>
          <dt>
            <Mail aria-hidden="true" />
            Email
          </dt>
          <dd>{form.contactEmail.trim() || "Email not added"}</dd>
        </div>
        <div>
          <dt>
            <CalendarDays aria-hidden="true" />
            Departure
          </dt>
          <dd>{formatOverviewDate(form.departureDate)}</dd>
        </div>
        <div>
          <dt>
            <MapPin aria-hidden="true" />
            Trip
          </dt>
          <dd>{form.tripType === "ROUND_TRIP" ? "Round trip" : "One way"}</dd>
        </div>
      </dl>
    </aside>
  );
}

function formatOverviewDate(value: string) {
  if (!value) {
    return "Choose departure";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
