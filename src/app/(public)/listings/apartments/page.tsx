import type { Metadata } from "next";
import { CategoryListingsRoute } from "@/components/listings/category-listings-route";
import styles from "./page.module.css";

export const metadata: Metadata = {
	title: "Apartment Listings",
	description:
		"Browse approved apartment listings from verified Pluto Booking partners.",
};

export default function ApartmentListingsPage() {
	return (
		<div className={styles.container}>
			<CategoryListingsRoute categorySlug="apartments" />
		</div>
	);
}
