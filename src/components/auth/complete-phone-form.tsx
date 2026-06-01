'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, LoaderCircle, Phone, ShieldCheck } from 'lucide-react';
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
import { completeGooglePhone, refreshUserSession } from '@/services/api/auth';
import { ApiRequestError } from '@/services/api/errors';
import { hasKnownUserSession } from '@/services/api/token-store';
import styles from './auth-form.module.css';

const completePhoneSchema = z.object({
	phone: z
		.string()
		.regex(/^\+?[1-9]\d{7,14}$/, 'Use an international phone format.'),
});

type CompletePhoneFormValues = z.infer<typeof completePhoneSchema>;

export function CompletePhoneForm() {
	const router = useRouter();

	const form = useForm<CompletePhoneFormValues>({
		resolver: zodResolver(completePhoneSchema),
		defaultValues: {
			phone: '',
		},
		mode: 'onBlur',
	});

	useEffect(() => {
		if (!hasKnownUserSession()) {
			router.replace('/login');
			return;
		}

		refreshUserSession()
			.then((response) => {
				if (!response.user.requiresPhoneNumber) {
					router.replace('/');
				}
			})
			.catch(() => router.replace('/login'));
	}, [router]);

	const completePhoneMutation = useMutation({
		mutationFn: completeGooglePhone,
		onSuccess: (response) => {
			toast.success(response.message, {
				description: 'Your account profile is now complete.',
			});
			router.replace('/');
		},
		onError: (error) => {
			const apiError =
				error instanceof ApiRequestError
					? error
					: new ApiRequestError({
							message: 'Phone number could not be saved. Please try again.',
						});

			form.setError('root', { message: apiError.message });
		},
	});

	// Event handlers: submit the missing Google phone number through the protected endpoint.
	function onSubmit(values: CompletePhoneFormValues) {
		completePhoneMutation.mutate(values);
	}

	return (
		<>
			<form
				className={styles.formWrap}
				onSubmit={form.handleSubmit(onSubmit)}
				noValidate
			>
				<div className={styles.headingBlock}>
					<h1>Finish your account</h1>
					<p>
						Add a required phone number so Pluto Booking can complete your
						profile.
					</p>
				</div>

				<div className={styles.fieldGroup}>
					<Label htmlFor="phone">Phone number</Label>
					<div
						className={styles.inputShell}
						data-invalid={Boolean(form.formState.errors.phone)}
					>
						<Phone aria-hidden="true" />
						<Input
							id="phone"
							type="tel"
							autoComplete="tel"
							placeholder="+250788123456"
							aria-invalid={Boolean(form.formState.errors.phone)}
							{...form.register('phone')}
						/>
					</div>
					{form.formState.errors.phone ? (
						<p className={styles.inlineError}>
							{form.formState.errors.phone.message}
						</p>
					) : null}
				</div>

				{form.formState.errors.root ? (
					<p className={styles.formError}>
						{form.formState.errors.root.message}
					</p>
				) : null}

				<Button
					type="submit"
					className={styles.submitButton}
					disabled={completePhoneMutation.isPending}
					aria-label={
						completePhoneMutation.isPending
							? 'Saving phone number'
							: 'Save phone number'
					}
				>
					{completePhoneMutation.isPending ? (
						<LoaderCircle className={styles.spinner} aria-hidden="true" />
					) : (
						<>
							<ShieldCheck aria-hidden="true" />
							Save phone number
						</>
					)}
				</Button>
			</form>

			<AlertDialog open={Boolean(form.formState.errors.root)}>
				<AlertDialogContent className={styles.modalContent}>
					<AlertDialogHeader>
						<AlertDialogTitle>Phone number needs attention</AlertDialogTitle>
						<AlertDialogDescription>
							{form.formState.errors.root?.message}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogAction onClick={() => form.clearErrors('root')}>
							<CheckCircle2 aria-hidden="true" />I understand
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
