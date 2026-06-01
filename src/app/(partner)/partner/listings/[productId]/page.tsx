import type { Metadata } from 'next';
import { ListingDetailPage } from '@/components/partner/listings/listing-detail-page';

type PartnerListingDetailPageProps = {
	params: Promise<{
		productId: string;
	}>;
};

export const metadata: Metadata = {
	title: 'Partner Listing Detail',
	description:
		'Review Pluto Booking partner listing details, media, specifications, and admin review status.',
	robots: {
		index: false,
		follow: false,
	},
};

export default async function PartnerListingDetailPage({
	params,
}: PartnerListingDetailPageProps) {
	const { productId } = await params;

	return <ListingDetailPage productId={productId} />;
}
