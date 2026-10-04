import type { Metadata } from "next";
import { HotelRoomListingDetailPage } from "@/components/listings/hotel-rooms/hotel-room-listing-detail-page";
import { createPublicMetadata } from "@/lib/seo";

type HotelRoomListingDetailRouteProps = {
	params: Promise<{ listingId: string }>;
};

export async function generateMetadata({
	params,
}: HotelRoomListingDetailRouteProps): Promise<Metadata> {
	const { listingId } = await params;
	return createPublicMetadata({
		title: "Hotel Room Details",
		description:
			"Review full details for an approved Pluto Booking hotel room.",
		path: `/listings/hotel-rooms/${listingId}`,
	});
}

export default async function HotelRoomListingDetailRoute({
	params,
}: HotelRoomListingDetailRouteProps) {
	const { listingId } = await params;

	return <HotelRoomListingDetailPage listingId={listingId} />;
}
