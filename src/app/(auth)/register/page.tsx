import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
	title: 'Create Customer Account',
	description: 'Create a secure customer account for Pluto Booking.',
	robots: {
		index: false,
		follow: false,
	},
};

export default function RegisterPage() {
	return (
		<AuthShell tone="customer" showGoogleCustomerNote>
			<RegisterForm
				initialRole="CUSTOMER"
				title="Create an account"
				description="Join Pluto Booking to save favorites, manage bookings, and access trusted listings."
			/>
		</AuthShell>
	);
}
