import type { Metadata } from 'next';
import { PartnerWorkspacePage } from '@/components/partner/partner-workspace-page';

export const metadata: Metadata = {
	title: 'Partner Payments',
	description:
		'Monitor Pluto Booking partner payout readiness, payment status, and settlement workflow.',
	robots: {
		index: false,
		follow: false,
	},
};

export default function PartnerPaymentsPage() {
	return <PartnerWorkspacePage page="payments" />;
}
