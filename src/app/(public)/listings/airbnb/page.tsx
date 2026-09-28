import type { Metadata } from "next";
import { CategoryListingsRoute } from "@/components/listings/category-listings-route";
import styles from "./page.module.css";

export const metadata: Metadata = {
	title: "AirBnB Listings",
	description:
		"Browse approved AirBnB-style home listings from verified Pluto Booking partners.",
};

export default function AirbnbListingsPage() {
	return (
		<div className={styles.container}>
			<CategoryListingsRoute categorySlug="airbnb" />
		</div>
	);
}
