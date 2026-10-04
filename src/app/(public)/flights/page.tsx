import { FlightRequestPage } from "@/components/flights/flight-request-page";
import { createPublicMetadata } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata = createPublicMetadata({
	title: "Managed Flight Requests",
	description:
		"Submit a secure managed flight booking request with Pluto Booking Africa.",
	path: "/flights",
	keywords: ["flight booking Rwanda", "managed flight request"],
});

export default function FlightsPage() {
	return (
		<div className={styles.container}>
			<FlightRequestPage />
		</div>
	);
}
