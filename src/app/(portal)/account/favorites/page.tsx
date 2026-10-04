import type { Metadata } from "next";
import { CustomerFavoritesPage } from "@/components/account/favorites/customer-favorites-page";

export const metadata: Metadata = {
	title: "Favorites",
	description: "Review your saved Pluto Booking listings.",
	robots: {
		index: false,
		follow: false,
	},
};

export default function CustomerFavoritesRoute() {
	return <CustomerFavoritesPage />;
}
