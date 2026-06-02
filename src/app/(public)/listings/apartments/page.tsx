import type { Metadata } from "next";
import { CategoryListingsRoute } from "@/components/listings/category-listings-route";

export const metadata: Metadata = {
	title: "Apartment Listings",
	description:
		"Browse approved apartment listings from verified Pluto Booking partners.",
};

export default function ApartmentListingsPage() {
	return <CategoryListingsRoute categorySlug="apartments" />;
}
