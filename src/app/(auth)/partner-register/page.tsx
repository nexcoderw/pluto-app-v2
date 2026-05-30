import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
	title: 'Partner Registration',
	description: 'Create a partner account and start onboarding with Pluto Booking.',
	robots: {
		index: false,
		follow: false,
	},
};

export default function PartnerRegisterPage() {
	return (
		<AuthShell tone="partner">
			<RegisterForm
				role="PARTNER"
				title="List with Pluto"
				description="Create a partner account for property, vehicle, and room listing review."
				submitLabel="Create partner account"
				googleLabel="Sign up as partner with Google"
			/>
		</AuthShell>
	);
}
