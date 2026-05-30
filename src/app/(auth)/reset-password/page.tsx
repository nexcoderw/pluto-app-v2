import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata: Metadata = {
	title: 'Reset Password',
	description: 'Choose a new secure Pluto Booking password.',
	robots: {
		index: false,
		follow: false,
	},
};

export default function ResetPasswordPage() {
	return (
		<AuthShell tone="recovery">
			<ResetPasswordForm />
		</AuthShell>
	);
}
