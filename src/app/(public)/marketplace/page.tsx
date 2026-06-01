import type { Metadata } from "next";
import { MarketplacePage } from "@/components/marketplace/marketplace-page";

export const metadata: Metadata = {
	title: "Marketplace",
	description:
		"Search approved cars, apartments, hotel rooms, and Airbnb homes on Pluto Booking.",
};

export default function MarketplaceRoute() {
	return <MarketplacePage />;
}
