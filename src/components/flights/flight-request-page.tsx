import { FlightRequestWizard } from "./flight-request-wizard";
import styles from "./flight-request-page.module.css";

export function FlightRequestPage() {
	return (
		<main className={styles.page}>
			<header className={styles.pageHeader}>
				<h1>Request a flight</h1>
				<p>Share your travel plans. We’ll review your request and send you a quote.</p>
			</header>
			<FlightRequestWizard />
		</main>
	);
}
