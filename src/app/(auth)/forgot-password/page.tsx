import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const metadata: Metadata = {
	title: 'Forgot Password',
	description: 'Request a secure Pluto Booking password reset link.',
	robots: {
		index: false,
		follow: false,
	},
};

export default function ForgotPasswordPage() {
	return (
		<AuthShell tone="recovery">
			<ForgotPasswordForm />
		</AuthShell>
	);
}
