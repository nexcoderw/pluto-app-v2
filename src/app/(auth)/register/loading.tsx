import { AuthFormSkeleton } from '@/components/auth/auth-form-skeleton';
import { AuthShell } from '@/components/auth/auth-shell';

export default function RegisterLoading() {
	return (
		<AuthShell tone="customer">
			<AuthFormSkeleton />
		</AuthShell>
	);
}
