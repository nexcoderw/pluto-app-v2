import type { Metadata } from 'next';
import { PartnerDashboard } from '@/components/partner/partner-dashboard';

export const metadata: Metadata = {
	title: 'Partner Dashboard',
	description:
		'Manage approved Pluto Booking partner listings, availability, and review activity.',
	robots: {
		index: false,
		follow: false,
	},
};

export default function PartnerDashboardPage() {
	return <PartnerDashboard />;
}
