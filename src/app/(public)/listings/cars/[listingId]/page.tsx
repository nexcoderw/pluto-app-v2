import type { Metadata } from "next";
import { CarListingDetailPage } from "@/components/listings/cars/car-listing-detail-page";
import { createPublicMetadata } from "@/lib/seo";

type CarListingDetailRouteProps = {
	params: Promise<{ listingId: string }>;
};

export async function generateMetadata({
	params,
}: CarListingDetailRouteProps): Promise<Metadata> {
	const { listingId } = await params;
	return createPublicMetadata({
		title: "Car Rental Details",
		description: "Review full details for an approved Pluto Booking car rental.",
		path: `/listings/cars/${listingId}`,
	});
}

export default async function CarListingDetailRoute({
	params,
}: CarListingDetailRouteProps) {
	const { listingId } = await params;

	return <CarListingDetailPage listingId={listingId} />;
}
