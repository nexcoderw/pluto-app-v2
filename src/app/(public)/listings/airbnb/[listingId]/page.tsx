import type { Metadata } from "next";
import { AirbnbListingDetailPage } from "@/components/listings/airbnb/airbnb-listing-detail-page";
import { createPublicMetadata } from "@/lib/seo";

type AirbnbListingDetailRouteProps = {
	params: Promise<{ listingId: string }>;
};

export async function generateMetadata({
	params,
}: AirbnbListingDetailRouteProps): Promise<Metadata> {
	const { listingId } = await params;
	return createPublicMetadata({
		title: "Vacation Home Details",
		description:
			"Review full details for an approved Pluto Booking vacation home.",
		path: `/listings/airbnb/${listingId}`,
	});
}

export default async function AirbnbListingDetailRoute({
	params,
}: AirbnbListingDetailRouteProps) {
	const { listingId } = await params;

	return <AirbnbListingDetailPage listingId={listingId} />;
}
