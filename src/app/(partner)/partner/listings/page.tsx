import type { Metadata } from 'next';
import { PartnerWorkspacePage } from '@/components/partner/partner-workspace-page';

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
	return <PartnerWorkspacePage page="listings" />;
}
