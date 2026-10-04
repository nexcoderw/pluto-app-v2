import { ListingsPage } from "@/components/listings/listings-page";
import { createPublicMetadata } from "@/lib/seo";

export const metadata = createPublicMetadata({
	title: "Browse Cars and Stays",
	description:
		"Browse approved cars, apartments, hotel rooms, and Airbnb homes by category on Pluto Booking.",
	path: "/listings",
	keywords: ["Rwanda rentals", "Rwanda accommodation", "verified listings"],
});

export default function ListingsRoute() {
	return <ListingsPage />;
}
