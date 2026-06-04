import type { Metadata } from "next";
import { HotelRoomListingDetailPage } from "@/components/listings/hotel-rooms/hotel-room-listing-detail-page";

export const metadata: Metadata = {
	title: "Hotel Room Listing Details",
	description:
		"Review full details for an approved Pluto Booking hotel room listing.",
};

export default async function HotelRoomListingDetailRoute({
	params,
}: {
	params: Promise<{ listingId: string }>;
}) {
	const { listingId } = await params;

	return <HotelRoomListingDetailPage listingId={listingId} />;
}
