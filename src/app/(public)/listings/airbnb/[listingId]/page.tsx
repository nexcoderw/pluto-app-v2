import type { Metadata } from "next";
import { PublicListingDetailPage } from "@/components/listings/public-listing-detail-page";

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

	return (
		<PublicListingDetailPage categorySlug="airbnb" listingId={listingId} />
	);
}
