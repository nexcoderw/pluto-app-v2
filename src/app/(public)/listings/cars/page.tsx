import type { Metadata } from "next";
import { CategoryListingsRoute } from "@/components/listings/category-listings-route";

export const metadata: Metadata = {
	title: "Car Listings",
	description:
		"Browse approved car rentals from verified Pluto Booking partners.",
};

export default function CarListingsPage() {
	return <CategoryListingsRoute categorySlug="cars" />;
}
