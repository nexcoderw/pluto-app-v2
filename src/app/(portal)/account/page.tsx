import type { Metadata } from 'next';
import { AccountCustomerPortal } from './account-customer-portal';

export const metadata: Metadata = {
	title: 'Account',
	description: 'Your Pluto Booking customer account.',
	robots: {
		index: false,
		follow: false,
	},
};

export default function AccountPage() {
	return <AccountCustomerPortal />;
}
