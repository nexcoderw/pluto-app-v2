import type { Metadata } from "next";
import { CategoryListingsRoute } from "@/components/listings/category-listings-route";
import styles from "./page.module.css";

export const metadata: Metadata = {
	title: "Hotel Room Listings",
	description:
		"Browse approved hotel room listings from verified Pluto Booking partners.",
};

export default function HotelRoomListingsPage() {
	return (
		<div className={styles.container}>
			<CategoryListingsRoute categorySlug="hotel-rooms" />
		</div>
	);
}
