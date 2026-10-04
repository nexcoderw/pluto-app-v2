import type { Metadata } from "next";
import { ApartmentListingDetailPage } from "@/components/listings/apartments/apartment-listing-detail-page";
import { createPublicMetadata } from "@/lib/seo";

type ApartmentListingDetailRouteProps = {
	params: Promise<{ listingId: string }>;
};

export async function generateMetadata({
	params,
}: ApartmentListingDetailRouteProps): Promise<Metadata> {
	const { listingId } = await params;
	return createPublicMetadata({
		title: "Apartment Details",
		description:
			"Review full details for an approved Pluto Booking apartment stay.",
		path: `/listings/apartments/${listingId}`,
	});
}

export default async function ApartmentListingDetailRoute({
	params,
}: ApartmentListingDetailRouteProps) {
	const { listingId } = await params;

	return <ApartmentListingDetailPage listingId={listingId} />;
}
