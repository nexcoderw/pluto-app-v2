import type { Metadata } from "next";
import { ListingsPage } from "@/components/listings/listings-page";

export const metadata: Metadata = {
	title: "Browse Listing Categories",
	description:
		"Browse approved cars, apartments, hotel rooms, and Airbnb homes by category on Pluto Booking.",
	alternates: {
		canonical: "/listings",
	},
	openGraph: {
		title: "Browse Listing Categories | Pluto Booking",
		description:
			"Explore approved cars, apartments, hotel rooms, and Airbnb homes from verified Pluto Booking partners.",
		url: "/listings",
	},
};

export default function ListingsRoute() {
	return <ListingsPage />;
}
