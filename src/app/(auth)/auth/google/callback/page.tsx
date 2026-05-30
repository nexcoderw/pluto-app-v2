import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth/auth-shell';
import { GoogleCallbackPanel } from '@/components/auth/google-callback-panel';

export const metadata: Metadata = {
	title: 'Google Sign-In',
	description: 'Complete secure Google sign-in for Pluto Booking.',
	robots: {
		index: false,
		follow: false,
	},
};

export default function GoogleCallbackPage() {
	return (
		<AuthShell tone="customer">
			<GoogleCallbackPanel />
		</AuthShell>
	);
}
