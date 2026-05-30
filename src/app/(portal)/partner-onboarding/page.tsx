import type { Metadata } from 'next';
import { PartnerPortal } from './partner-portal';

export const metadata: Metadata = {
	title: 'Partner Onboarding',
	description: 'Prepare your Pluto Booking partner profile for review.',
	robots: {
		index: false,
		follow: false,
	},
};

export default function PartnerOnboardingPage() {
	return <PartnerPortal />;
}
