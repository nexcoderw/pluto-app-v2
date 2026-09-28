import type { Metadata } from "next";
import { CategoryListingsRoute } from "@/components/listings/category-listings-route";
import styles from "./page.module.css";

export const metadata: Metadata = {
	title: "Car Listings",
	description:
		"Browse approved car rentals from verified Pluto Booking partners.",
};

export default function CarListingsPage() {
	return (
		<div className={styles.container}>
			<CategoryListingsRoute categorySlug="cars" />
		</div>
	);
}
