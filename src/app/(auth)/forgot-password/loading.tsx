import { AuthFormSkeleton } from '@/components/auth/auth-form-skeleton';
import { AuthShell } from '@/components/auth/auth-shell';

export default function ForgotPasswordLoading() {
	return (
		<AuthShell tone="recovery">
			<AuthFormSkeleton />
		</AuthShell>
	);
}
