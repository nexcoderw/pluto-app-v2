import type { Metadata } from 'next';
import { PartnerListingsPage as PartnerListingsExperience } from '@/components/partner/listings/partner-listings-page';

export const metadata: Metadata = {
	title: 'Partner Listings',
	description:
		'Manage approved Pluto Booking partner listings, review readiness, and publishing workflow.',
	robots: {
		index: false,
		follow: false,
	},
};

export default function PartnerListingsPage() {
	return <PartnerListingsExperience />;
}
