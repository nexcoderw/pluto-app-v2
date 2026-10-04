import { CategoryListingsRoute } from "@/components/listings/category-listings-route";
import { createPublicMetadata } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata = createPublicMetadata({
	title: "Vacation Homes",
	description:
		"Browse approved vacation homes and Airbnb-style stays from verified Pluto Booking partners in Rwanda.",
	path: "/listings/airbnb",
	keywords: ["vacation homes Rwanda", "Kigali Airbnb", "holiday homes"],
});

export default function AirbnbListingsPage() {
	return (
		<div className={styles.container}>
			<CategoryListingsRoute categorySlug="airbnb" />
		</div>
	);
}
