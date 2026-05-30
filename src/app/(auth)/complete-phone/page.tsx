import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { CompletePhoneForm } from '@/components/auth/complete-phone-form';

export const metadata: Metadata = {
	title: 'Complete Account',
	description: 'Add your phone number to complete Pluto Booking registration.',
	robots: {
		index: false,
		follow: false,
	},
};

export default function CompletePhonePage() {
	return (
		<AuthShell tone="customer">
			<CompletePhoneForm />
		</AuthShell>
	);
}
