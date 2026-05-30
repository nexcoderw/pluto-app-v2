import { AuthFormSkeleton } from '@/components/auth/auth-form-skeleton';
import { AuthShell } from '@/components/auth/auth-shell';

export default function PartnerRegisterLoading() {
	return (
		<AuthShell tone="partner">
			<AuthFormSkeleton />
		</AuthShell>
	);
}
