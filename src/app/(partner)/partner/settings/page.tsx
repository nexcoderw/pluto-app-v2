import type { Metadata } from 'next';
import { PartnerWorkspacePage } from '@/components/partner/partner-workspace-page';

export const metadata: Metadata = {
	title: 'Partner Settings',
	description:
		'Manage Pluto Booking partner profile preferences, secure account controls, and workspace readiness.',
	robots: {
		index: false,
		follow: false,
	},
};

export default function PartnerSettingsPage() {
	return <PartnerWorkspacePage page="settings" />;
}
