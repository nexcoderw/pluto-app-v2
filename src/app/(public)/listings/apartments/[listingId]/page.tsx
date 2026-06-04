import type { Metadata } from "next";
import { ApartmentListingDetailPage } from "@/components/listings/apartments/apartment-listing-detail-page";

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

	return <ApartmentListingDetailPage listingId={listingId} />;
}
