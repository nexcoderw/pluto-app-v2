import { CategoryListingsRoute } from "@/components/listings/category-listings-route";
import { createPublicMetadata } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata = createPublicMetadata({
	title: "Apartments",
	description:
		"Browse approved apartment stays from verified Pluto Booking partners in Rwanda.",
	path: "/listings/apartments",
	keywords: ["apartments Rwanda", "Kigali apartments", "short stay apartments"],
});

export default function ApartmentListingsPage() {
	return (
		<div className={styles.container}>
			<CategoryListingsRoute categorySlug="apartments" />
		</div>
	);
}
