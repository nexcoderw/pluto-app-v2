'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import {
	Eye,
	EyeOff,
	LoaderCircle,
	LockKeyhole,
	LogIn,
	Mail,
	ShieldCheck,
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
	loginUser,
	redirectToUserGoogleLogin,
	refreshUserSession,
} from '@/services/api/auth';
import { hasKnownUserSession } from '@/services/api/token-store';
import styles from './auth-form.module.css';

const loginSchema = z.object({
	email: z.string().email('Enter a valid email address.').max(254),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters.')
		.max(128),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [modalError, setModalError] = useState<string | null>(null);
	const isGoogleLoginEnabled = isUserGoogleLoginEnabled();

	// State setup: inline validation catches field issues before the API request.
	const form = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
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

	const loginMutation = useMutation({
		mutationFn: (values: LoginFormValues) =>
			loginUser({
				...values,
				deviceName,
			}),
		onSuccess: (response) => {
			toast.success(response.message, {
				description: 'Your Pluto Booking session is ready.',
			});
			router.replace(
				response.user.requiresPhoneNumber ? '/complete-phone' : '/',
			);
		},
		onError: (error) => {
			const apiError =
				error instanceof ApiRequestError
					? error
					: new ApiRequestError({
							message: 'Login could not be completed. Please try again.',
						});

			if (apiError.isNetworkError || apiError.statusCode === 429) {
				setModalError(apiError.message);
				return;
			}

			toast.error(apiError.message);
			form.setError('root', { message: apiError.message });
		},
	});

	useEffect(() => {
		let isActive = true;

		if (!hasKnownUserSession()) {
			return () => {
				isActive = false;
			};
		}

		refreshUserSession()
			.then((response) => {
				if (!isActive) {
					return;
				}

				router.replace(
					response.user.requiresPhoneNumber ? '/complete-phone' : '/',
				);
			})
			.catch(() => undefined);

		return () => {
			isActive = false;
		};
	}, [router]);

	// Event handlers: React Query prevents duplicate submissions while pending.
	function onSubmit(values: LoginFormValues) {
		loginMutation.mutate(values);
	}

	return (
		<>
			<form
				className={styles.formWrap}
				onSubmit={form.handleSubmit(onSubmit)}
				noValidate
			>
				<div className={styles.headingBlock}>
					<h1>Welcome back</h1>
					<p>
						Sign in to manage bookings, favorites, partner listings, and account
						details.
					</p>
				</div>

				<div className={styles.fieldGroup}>
					<Label htmlFor="email">Email</Label>
					<div
						className={styles.inputShell}
						data-invalid={Boolean(form.formState.errors.email)}
					>
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
						<p className={styles.inlineError}>
							{form.formState.errors.email.message}
						</p>
					) : null}
				</div>

				<div className={styles.fieldGroup}>
					<div className={styles.fieldHeader}>
						<Label htmlFor="password">Password</Label>
						<Link href="/forgot-password">Forgot password?</Link>
					</div>
					<div
						className={styles.inputShell}
						data-invalid={Boolean(form.formState.errors.password)}
					>
						<LockKeyhole aria-hidden="true" />
						<Input
							id="password"
							type={showPassword ? 'text' : 'password'}
							autoComplete="current-password"
							placeholder="Enter your password"
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
							{showPassword ? (
								<EyeOff aria-hidden="true" />
							) : (
								<Eye aria-hidden="true" />
							)}
						</Button>
					</div>
					{form.formState.errors.password ? (
						<p className={styles.inlineError}>
							{form.formState.errors.password.message}
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
					disabled={loginMutation.isPending}
					aria-label={
						loginMutation.isPending ? 'Signing in' : 'Sign in securely'
					}
				>
					{loginMutation.isPending ? (
						<LoaderCircle className={styles.spinner} aria-hidden="true" />
					) : (
						<>
							<ShieldCheck aria-hidden="true" />
							Sign in securely
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
							onClick={() => redirectToUserGoogleLogin('CUSTOMER')}
						>
							<Image
								src="/google.webp"
								alt=""
								width={250}
								height={256}
								className={styles.googleIcon}
							/>
							Continue with Google
						</Button>
					</>
				) : null}

				<p className={styles.footerText}>
					New to Pluto? <Link href="/register">Create an account</Link>
				</p>
			</form>

			<AlertDialog open={Boolean(modalError)}>
				<AlertDialogContent className={styles.modalContent}>
					<AlertDialogHeader>
						<AlertDialogTitle>Login needs your attention</AlertDialogTitle>
						<AlertDialogDescription>{modalError}</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogAction onClick={() => setModalError(null)}>
							<LogIn aria-hidden="true" />I understand
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
