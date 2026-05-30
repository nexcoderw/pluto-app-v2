'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import {
	Building2,
	Eye,
	EyeOff,
	LoaderCircle,
	LockKeyhole,
	Mail,
	Phone,
	UserRound,
	UserPlus,
} from 'lucide-react';
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
import { ApiRequestError } from '@/services/api/errors';
import {
	isUserGoogleLoginEnabled,
	redirectToUserGoogleLogin,
	registerUser,
	type UserRole,
} from '@/services/api/auth';
import styles from './auth-form.module.css';

const registerSchema = z.object({
	fullName: z.string().min(2, 'Enter your full name.').max(120),
	email: z.string().email('Enter a valid email address.').max(254),
	phone: z
		.string()
		.regex(/^\+?[1-9]\d{7,14}$/, 'Use an international phone format.'),
	password: z
		.string()
		.min(12, 'Password must be at least 12 characters.')
		.max(128)
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
			'Use uppercase, lowercase, a number, and a special character.',
		),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

type RegisterFormProps = {
	role: UserRole;
	title: string;
	description: string;
	submitLabel: string;
	googleLabel: string;
};

export function RegisterForm({
	role,
	title,
	description,
	submitLabel,
	googleLabel,
}: RegisterFormProps) {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [modalError, setModalError] = useState<string | null>(null);
	const isGoogleLoginEnabled = isUserGoogleLoginEnabled();

	// State setup: every registration field is required before creating the account.
	const form = useForm<RegisterFormValues>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			fullName: '',
			email: '',
			phone: '',
			password: '',
		},
		mode: 'onBlur',
	});

	const deviceName = useMemo(() => {
		if (typeof navigator === 'undefined') {
			return 'Pluto browser';
		}

		return navigator.userAgent.slice(0, 120);
	}, []);

	const registerMutation = useMutation({
		mutationFn: (values: RegisterFormValues) =>
			registerUser({
				...values,
				role,
				deviceName,
			}),
		onSuccess: (response) => {
			toast.success(response.message, {
				description:
					role === 'PARTNER'
						? 'Your partner account is ready for onboarding.'
						: 'Your customer account is ready.',
			});
			router.replace(role === 'PARTNER' ? '/partner-onboarding' : '/account');
		},
		onError: (error) => {
			const apiError =
				error instanceof ApiRequestError
					? error
					: new ApiRequestError({
							message: 'Registration could not be completed. Please try again.',
						});

			if (apiError.isNetworkError || apiError.statusCode === 429) {
				setModalError(apiError.message);
				return;
			}

			toast.error(apiError.message);
			form.setError('root', { message: apiError.message });
		},
	});

	// Event handlers: include the requested role server-side and prevent duplicate posts.
	function onSubmit(values: RegisterFormValues) {
		registerMutation.mutate(values);
	}

	return (
		<>
			<form
				className={`${styles.formWrap} ${styles.wideForm}`}
				onSubmit={form.handleSubmit(onSubmit)}
				noValidate
			>
				<div className={styles.headingBlock}>
					<h1>{title}</h1>
					<p>{description}</p>
				</div>

				<div className={styles.fieldGroup}>
					<Label htmlFor="fullName">Full name</Label>
					<div
						className={styles.inputShell}
						data-invalid={Boolean(form.formState.errors.fullName)}
					>
						<UserRound aria-hidden="true" />
						<Input
							id="fullName"
							type="text"
							autoComplete="name"
							placeholder="Aline Uwase"
							aria-invalid={Boolean(form.formState.errors.fullName)}
							{...form.register('fullName')}
						/>
					</div>
					{form.formState.errors.fullName ? (
						<p className={styles.inlineError}>{form.formState.errors.fullName.message}</p>
					) : null}
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

				<div className={styles.fieldGroup}>
					<Label htmlFor="phone">Phone number</Label>
					<div className={styles.inputShell} data-invalid={Boolean(form.formState.errors.phone)}>
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
						<p className={styles.inlineError}>{form.formState.errors.phone.message}</p>
					) : null}
				</div>

				<div className={styles.fieldGroup}>
					<Label htmlFor="password">Password</Label>
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
					disabled={registerMutation.isPending}
					aria-label={registerMutation.isPending ? 'Creating account' : submitLabel}
				>
					{registerMutation.isPending ? (
						<LoaderCircle className={styles.spinner} aria-hidden="true" />
					) : (
						<>
							{role === 'PARTNER' ? (
								<Building2 aria-hidden="true" />
							) : (
								<UserPlus aria-hidden="true" />
							)}
							{submitLabel}
						</>
					)}
				</Button>

				{isGoogleLoginEnabled ? (
					<>
						<div className={styles.divider} />
						<Button
							type="button"
							variant="outline"
							className={styles.googleButton}
							onClick={() => redirectToUserGoogleLogin(role)}
						>
							<Image
								src="/google.webp"
								alt=""
								width={250}
								height={256}
								className={styles.googleIcon}
							/>
							{googleLabel}
						</Button>
					</>
				) : null}

				<p className={styles.footerText}>
					Already have an account? <Link href="/login">Sign in</Link>
				</p>
			</form>

			<AlertDialog open={Boolean(modalError)}>
				<AlertDialogContent className={styles.modalContent}>
					<AlertDialogHeader>
						<AlertDialogTitle>Registration needs your attention</AlertDialogTitle>
						<AlertDialogDescription>{modalError}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogAction onClick={() => setModalError(null)}>
							<UserPlus aria-hidden="true" />
							I understand
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
