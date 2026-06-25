"use client";

import { FlightRequestWizard } from "./flight-request-wizard";
import styles from "./flight-request-page.module.css";

export function FlightRequestPage() {
  return (
    <main className={styles.page}>
      <FlightRequestWizard />
    </main>
  );
}
