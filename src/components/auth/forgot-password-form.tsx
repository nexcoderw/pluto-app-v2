'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, LoaderCircle, Mail, Send } from 'lucide-react';
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
import { forgotUserPassword } from '@/services/api/auth';
import { ApiRequestError } from '@/services/api/errors';
import styles from './auth-form.module.css';

const forgotPasswordSchema = z.object({
	email: z.string().email('Enter a valid email address.').max(254),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
	const form = useForm<ForgotPasswordFormValues>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: '',
		},
		mode: 'onBlur',
	});

	const forgotPasswordMutation = useMutation({
		mutationFn: forgotUserPassword,
		onSuccess: (response) => {
			toast.success(response.message, {
				description: 'Check your inbox and continue with the secure reset link.',
			});
		},
		onError: (error) => {
			const apiError =
				error instanceof ApiRequestError
					? error
					: new ApiRequestError({
							message: 'Password reset could not be started. Please try again.',
						});

			if (apiError.isNetworkError || apiError.statusCode === 429) {
				form.setError('root', { message: apiError.message });
				return;
			}

			toast.error(apiError.message);
			form.setError('root', { message: apiError.message });
		},
	});

	// Event handlers: request reset without exposing whether an account exists.
	function onSubmit(values: ForgotPasswordFormValues) {
		forgotPasswordMutation.mutate(values);
	}

	if (forgotPasswordMutation.isSuccess) {
		return (
			<section className={styles.formWrap} aria-live="polite">
				<div className={styles.successPanel}>
					<CheckCircle2 aria-hidden="true" />
					<h1>Check your email</h1>
					<p>If that account exists, Pluto Booking has sent a secure reset link.</p>
					<Link href="/login" className={styles.secondaryAction}>
						<ArrowLeft aria-hidden="true" />
						Back to login
					</Link>
				</div>
			</section>
		);
	}

	return (
		<>
			<form className={styles.formWrap} onSubmit={form.handleSubmit(onSubmit)} noValidate>
				<div className={styles.headingBlock}>
					<h1>Reset access</h1>
					<p>Enter your email and we will send a secure password reset link.</p>
				</div>

				<div className={styles.fieldGroup}>
					<Label htmlFor="email">Email</Label>
					<div className={styles.inputShell} data-invalid={Boolean(form.formState.errors.email)}>
						<Mail aria-hidden="true" />
						<Input
							id="email"
							type="email"
							autoComplete="email"
							placeholder="you@example.com"
							aria-invalid={Boolean(form.formState.errors.email)}
							{...form.register('email')}
						/>
					</div>
					{form.formState.errors.email ? (
						<p className={styles.inlineError}>{form.formState.errors.email.message}</p>
					) : null}
				</div>

				{form.formState.errors.root ? (
					<p className={styles.formError}>{form.formState.errors.root.message}</p>
				) : null}

				<Button
					type="submit"
					className={styles.submitButton}
					disabled={forgotPasswordMutation.isPending}
					aria-label={forgotPasswordMutation.isPending ? 'Sending reset link' : 'Send reset link'}
				>
					{forgotPasswordMutation.isPending ? (
						<LoaderCircle className={styles.spinner} aria-hidden="true" />
					) : (
						<>
							<Send aria-hidden="true" />
							Send reset link
						</>
					)}
				</Button>

				<Link href="/login" className={styles.secondaryAction}>
					<ArrowLeft aria-hidden="true" />
					Back to login
				</Link>
			</form>

			<AlertDialog open={Boolean(form.formState.errors.root)}>
				<AlertDialogContent className={styles.modalContent}>
					<AlertDialogHeader>
						<AlertDialogTitle>Reset request needs attention</AlertDialogTitle>
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
