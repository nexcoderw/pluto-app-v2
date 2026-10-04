import { CategoryListingsRoute } from "@/components/listings/category-listings-route";
import { createPublicMetadata } from "@/lib/seo";
import styles from "./page.module.css";

export const metadata = createPublicMetadata({
	title: "Hotel Rooms",
	description:
		"Browse approved hotel rooms from verified Pluto Booking partners in Rwanda.",
	path: "/listings/hotel-rooms",
	keywords: ["hotels Rwanda", "Kigali hotel rooms", "verified hotels"],
});

export default function HotelRoomListingsPage() {
	return (
		<div className={styles.container}>
			<CategoryListingsRoute categorySlug="hotel-rooms" />
		</div>
	);
}
