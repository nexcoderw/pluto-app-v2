'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, LoaderCircle, LockKeyhole } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { resetUserPassword } from '@/services/api/auth';
import { ApiRequestError } from '@/services/api/errors';
import { AuthFormSkeleton } from './auth-form-skeleton';
import styles from './auth-form.module.css';

const resetPasswordSchema = z.object({
	password: z
		.string()
		.min(12, 'Password must be at least 12 characters.')
		.max(128)
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
			'Use uppercase, lowercase, a number, and a special character.',
		),
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
	return (
		<Suspense fallback={<AuthFormSkeleton />}>
			<ResetPasswordFormContent />
		</Suspense>
	);
}

function ResetPasswordFormContent() {
	const searchParams = useSearchParams();
	const token = searchParams.get('token') ?? '';
	const [showPassword, setShowPassword] = useState(false);

	const form = useForm<ResetPasswordFormValues>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			password: '',
		},
		mode: 'onBlur',
	});

	const resetPasswordMutation = useMutation({
		mutationFn: (values: ResetPasswordFormValues) =>
			resetUserPassword({
				token,
				password: values.password,
			}),
		onSuccess: (response) => {
			toast.success(response.message, {
				description: 'You can sign in with your new password.',
			});
		},
		onError: (error) => {
			const apiError =
				error instanceof ApiRequestError
					? error
					: new ApiRequestError({
							message: 'Password reset could not be completed. Please try again.',
						});

			form.setError('root', { message: apiError.message });
		},
	});

	// Empty state: token is required before the reset form can be submitted.
	if (!token) {
		return (
			<section className={styles.formWrap} aria-live="polite">
				<div className={styles.statePanel} data-state="error">
					<KeyRound aria-hidden="true" />
					<h1>Reset link missing</h1>
					<p>Open the link from your email or request a new secure reset link.</p>
					<Link href="/forgot-password" className={styles.secondaryAction}>
						<ArrowLeft aria-hidden="true" />
						Request new link
					</Link>
				</div>
			</section>
		);
	}

	if (resetPasswordMutation.isSuccess) {
		return (
			<section className={styles.formWrap} aria-live="polite">
				<div className={styles.successPanel}>
					<CheckCircle2 aria-hidden="true" />
					<h1>Password updated</h1>
					<p>Your Pluto Booking password has been changed successfully.</p>
					<Link href="/login" className={styles.secondaryAction}>
						<ArrowLeft aria-hidden="true" />
						Back to login
					</Link>
				</div>
			</section>
		);
	}

	function onSubmit(values: ResetPasswordFormValues) {
		resetPasswordMutation.mutate(values);
	}

	return (
		<>
			<form className={styles.formWrap} onSubmit={form.handleSubmit(onSubmit)} noValidate>
				<div className={styles.headingBlock}>
					<h1>Choose a new password</h1>
					<p>Use a secure password that you do not use on other services.</p>
				</div>

				<div className={styles.fieldGroup}>
					<Label htmlFor="password">New password</Label>
					<div
						className={styles.inputShell}
						data-invalid={Boolean(form.formState.errors.password)}
					>
						<LockKeyhole aria-hidden="true" />
						<Input
							id="password"
							type={showPassword ? 'text' : 'password'}
							autoComplete="new-password"
							placeholder="Create a secure password"
							aria-invalid={Boolean(form.formState.errors.password)}
							{...form.register('password')}
						/>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className={styles.passwordToggle}
							aria-label={showPassword ? 'Hide password' : 'Show password'}
							onClick={() => setShowPassword((value) => !value)}
						>
							{showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
						</Button>
					</div>
					{form.formState.errors.password ? (
						<p className={styles.inlineError}>{form.formState.errors.password.message}</p>
					) : null}
				</div>

				{form.formState.errors.root ? (
					<p className={styles.formError}>{form.formState.errors.root.message}</p>
				) : null}

				<Button
					type="submit"
					className={styles.submitButton}
					disabled={resetPasswordMutation.isPending}
					aria-label={resetPasswordMutation.isPending ? 'Updating password' : 'Update password'}
				>
					{resetPasswordMutation.isPending ? (
						<LoaderCircle className={styles.spinner} aria-hidden="true" />
					) : (
						<>
							<KeyRound aria-hidden="true" />
							Update password
						</>
					)}
				</Button>
			</form>

			<AlertDialog open={Boolean(form.formState.errors.root)}>
				<AlertDialogContent className={styles.modalContent}>
					<AlertDialogHeader>
						<AlertDialogTitle>Reset could not continue</AlertDialogTitle>
						<AlertDialogDescription>
							{form.formState.errors.root?.message}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogAction onClick={() => form.clearErrors('root')}>
							<CheckCircle2 aria-hidden="true" />
							I understand
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
