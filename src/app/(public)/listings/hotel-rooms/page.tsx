import type { Metadata } from "next";
import { CategoryListingsRoute } from "@/components/listings/category-listings-route";

export const metadata: Metadata = {
	title: "Hotel Room Listings",
	description:
		"Browse approved hotel room listings from verified Pluto Booking partners.",
};

export default function HotelRoomListingsPage() {
	return <CategoryListingsRoute categorySlug="hotel-rooms" />;
}
