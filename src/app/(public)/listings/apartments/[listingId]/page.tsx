import type { Metadata } from "next";
import { PublicListingDetailPage } from "@/components/listings/public-listing-detail-page";

export const metadata: Metadata = {
	title: "Apartment Listing Details",
	description:
		"Review full details for an approved Pluto Booking apartment listing.",
};

export default async function ApartmentListingDetailRoute({
	params,
}: {
	params: Promise<{ listingId: string }>;
}) {
	const { listingId } = await params;

	return (
		<PublicListingDetailPage categorySlug="apartments" listingId={listingId} />
	);
}
