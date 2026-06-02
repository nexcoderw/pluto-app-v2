import type { Metadata } from "next";
import { PublicListingDetailPage } from "@/components/listings/public-listing-detail-page";

export const metadata: Metadata = {
	title: "Car Listing Details",
	description: "Review full details for an approved Pluto Booking car listing.",
};

export default async function CarListingDetailRoute({
	params,
}: {
	params: Promise<{ listingId: string }>;
}) {
	const { listingId } = await params;

	return <PublicListingDetailPage categorySlug="cars" listingId={listingId} />;
}
