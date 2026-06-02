import type { Metadata } from "next";
import { CategoryListingsRoute } from "@/components/listings/category-listings-route";

export const metadata: Metadata = {
	title: "AirBnB Listings",
	description:
		"Browse approved AirBnB-style home listings from verified Pluto Booking partners.",
};

export default function AirbnbListingsPage() {
	return <CategoryListingsRoute categorySlug="airbnb" />;
}
