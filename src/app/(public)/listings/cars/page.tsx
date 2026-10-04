import { CategoryListingsRoute } from "@/components/listings/category-listings-route";
import { createPublicMetadata } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata = createPublicMetadata({
	title: "Car Rentals",
	description:
		"Browse approved car rentals from verified Pluto Booking partners in Rwanda.",
	path: "/listings/cars",
	keywords: ["car rental Rwanda", "Kigali car rental", "verified rental cars"],
});

export default function CarListingsPage() {
	return (
		<div className={styles.container}>
			<CategoryListingsRoute categorySlug="cars" />
		</div>
	);
}
