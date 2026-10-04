import { HomePageExperience } from "@/components/home/home-page-experience";
import { createPublicMetadata } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata = createPublicMetadata({
	title: "Pluto Booking | Verified Stays, Cars, and Rentals",
	description:
		"Search trusted cars, apartments, hotel rooms, and Airbnb stays from verified Pluto Booking partners across Rwanda.",
	path: "/",
	absoluteTitle: true,
	keywords: ["Rwanda stays", "Rwanda car rental", "Kigali apartments"],
});

export default function HomePage() {
	return (
		<div className={styles.container}>
			<HomePageExperience />
		</div>
	);
}
