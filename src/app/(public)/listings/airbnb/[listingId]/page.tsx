import type { Metadata } from "next";
import { AirbnbListingDetailPage } from "@/components/listings/airbnb/airbnb-listing-detail-page";

export const metadata: Metadata = {
	title: "AirBnB Listing Details",
	description:
		"Review full details for an approved Pluto Booking AirBnB-style home listing.",
};

export default async function AirbnbListingDetailRoute({
	params,
}: {
	params: Promise<{ listingId: string }>;
}) {
	const { listingId } = await params;

	return <AirbnbListingDetailPage listingId={listingId} />;
}
