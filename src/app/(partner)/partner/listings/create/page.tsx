import type { Metadata } from 'next';
import { CreateListingPage } from '@/components/partner/listings/listing-form-page';

export const metadata: Metadata = {
	title: 'Create Partner Listing',
	description:
		'Create a review-ready Pluto Booking partner listing with guided fields and secure image uploads.',
	robots: {
		index: false,
		follow: false,
	},
};

export default function PartnerCreateListingPage() {
	return <CreateListingPage />;
}
