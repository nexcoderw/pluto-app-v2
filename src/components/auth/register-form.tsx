'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import {
	Building2,
	BriefcaseBusiness,
	Eye,
	EyeOff,
	LoaderCircle,
	LockKeyhole,
	Mail,
	Phone,
	UserRound,
	UserPlus,
} from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
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
	type PartnerType,
	type UserRole,
} from '@/services/api/auth';
import styles from './auth-form.module.css';

const registerSchema = z.object({
	role: z.enum(['CUSTOMER', 'PARTNER']),
	partnerType: z.enum(['INDIVIDUAL', 'COMPANY']).optional(),
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
}).superRefine((values, context) => {
	if (values.role === 'PARTNER' && !values.partnerType) {
		context.addIssue({
			code: 'custom',
			path: ['partnerType'],
			message: 'Choose the partner type.',
		});
	}
});

type RegisterFormValues = z.infer<typeof registerSchema>;

type RegisterFormProps = {
	initialRole?: UserRole;
	title: string;
	description: string;
};

export function RegisterForm({
	initialRole = 'CUSTOMER',
	title,
	description,
}: RegisterFormProps) {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [modalError, setModalError] = useState<string | null>(null);
	const isGoogleLoginEnabled = isUserGoogleLoginEnabled();

	// State setup: every registration field is required before creating the account.
	const form = useForm<RegisterFormValues>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			role: initialRole,
			partnerType: initialRole === 'PARTNER' ? 'INDIVIDUAL' : undefined,
			fullName: '',
			email: '',
			phone: '',
			password: '',
		},
		mode: 'onBlur',
	});
	const selectedRole = useWatch({
		control: form.control,
		name: 'role',
	});
	const watchedPartnerType = useWatch({
		control: form.control,
		name: 'partnerType',
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
				fullName: values.fullName,
				email: values.email,
				phone: values.phone,
				password: values.password,
				role: values.role,
				partnerType:
					values.role === 'PARTNER' ? values.partnerType : undefined,
				deviceName,
			}),
		onSuccess: (response) => {
			toast.success(response.message, {
				description:
					response.user.role === 'PARTNER'
						? 'Your partner account is ready for onboarding.'
						: 'Your customer account is ready.',
			});
			router.replace(
				response.user.role === 'PARTNER' ? '/partner-onboarding' : '/account',
			);
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

	const selectedPartnerType = watchedPartnerType ?? 'INDIVIDUAL';
	const submitLabel =
		selectedRole === 'PARTNER' ? 'Create partner account' : 'Create account';
	const googleLabel =
		selectedRole === 'PARTNER'
			? 'Sign up as partner with Google'
			: 'Sign up with Google';

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
					<Label>Account role</Label>
					<div className={styles.segmentGrid} data-invalid={Boolean(form.formState.errors.role)}>
						<button
							type="button"
							className={styles.segmentButton}
							data-active={selectedRole === 'CUSTOMER'}
							onClick={() => {
								form.setValue('role', 'CUSTOMER', { shouldValidate: true });
								form.setValue('partnerType', undefined, { shouldValidate: true });
							}}
						>
							<UserRound aria-hidden="true" />
							<span>
								<strong>Customer</strong>
								<small>Book and manage trips</small>
							</span>
						</button>
						<button
							type="button"
							className={styles.segmentButton}
							data-active={selectedRole === 'PARTNER'}
							onClick={() => {
								form.setValue('role', 'PARTNER', { shouldValidate: true });
								form.setValue('partnerType', selectedPartnerType, {
									shouldValidate: true,
								});
							}}
						>
							<Building2 aria-hidden="true" />
							<span>
								<strong>Partner</strong>
								<small>List properties or rentals</small>
							</span>
						</button>
					</div>
				</div>

				{selectedRole === 'PARTNER' ? (
					<div className={styles.fieldGroup}>
						<Label>Partner type</Label>
						<div
							className={styles.segmentGrid}
							data-invalid={Boolean(form.formState.errors.partnerType)}
						>
							<button
								type="button"
								className={styles.segmentButton}
								data-active={selectedPartnerType === 'INDIVIDUAL'}
								onClick={() =>
									form.setValue('partnerType', 'INDIVIDUAL', {
										shouldValidate: true,
									})
								}
							>
								<UserRound aria-hidden="true" />
								<span>
									<strong>Individual</strong>
									<small>Personal host or owner</small>
								</span>
							</button>
							<button
								type="button"
								className={styles.segmentButton}
								data-active={selectedPartnerType === 'COMPANY'}
								onClick={() =>
									form.setValue('partnerType', 'COMPANY', {
										shouldValidate: true,
									})
								}
							>
								<BriefcaseBusiness aria-hidden="true" />
								<span>
									<strong>Company</strong>
									<small>Registered business</small>
								</span>
							</button>
						</div>
						{form.formState.errors.partnerType ? (
							<p className={styles.inlineError}>
								{form.formState.errors.partnerType.message}
							</p>
						) : null}
					</div>
				) : null}

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
							{selectedRole === 'PARTNER' ? (
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
							onClick={() =>
								redirectToUserGoogleLogin(
									selectedRole,
									selectedRole === 'PARTNER'
										? (selectedPartnerType as PartnerType)
										: undefined,
								)
							}
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
