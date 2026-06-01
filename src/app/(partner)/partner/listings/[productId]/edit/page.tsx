import type { Metadata } from 'next';
import { EditListingPage } from '@/components/partner/listings/listing-form-page';

type PartnerEditListingPageProps = {
	params: Promise<{
		productId: string;
	}>;
};

export const metadata: Metadata = {
	title: 'Edit Partner Listing',
	description:
		'Update a Pluto Booking partner listing and send changes through the secure review workflow.',
	robots: {
		index: false,
		follow: false,
	},
};

export default async function PartnerEditListingPage({
	params,
}: PartnerEditListingPageProps) {
	const { productId } = await params;

	return <EditListingPage productId={productId} />;
}
