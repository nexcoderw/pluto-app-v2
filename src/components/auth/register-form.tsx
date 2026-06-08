'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import type { CountryCode } from 'libphonenumber-js';
import {
	ArrowLeft,
	ArrowRight,
	Building2,
	BriefcaseBusiness,
	CheckCircle2,
	Eye,
	EyeOff,
	LoaderCircle,
	LockKeyhole,
	Mail,
	Phone,
	ShieldCheck,
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	PHONE_COUNTRIES,
	RWANDA_PHONE_COUNTRY,
	getPhoneCountryOption,
	isSupportedPhoneCountry,
} from '@/constants/phone-countries';
import {
	getPhonePlaceholder,
	isValidInternationalPhoneNumber,
	normalizePhoneNumber,
} from '@/lib/phone-number';
import { getUserPortalPath } from '@/lib/user-portal';
import { ApiRequestError } from '@/services/api/errors';
import {
	isUserGoogleLoginEnabled,
	redirectToUserGoogleLogin,
	registerUser,
	type PublicUserRole,
} from '@/services/api/auth';
import styles from './auth-form.module.css';

const passwordRule = /^(?=.*[A-Za-z])(?=.*[^A-Za-z0-9]).+$/;

const registerSchema = z
	.object({
		role: z.enum(['CUSTOMER', 'PARTNER']),
		partnerType: z.enum(['INDIVIDUAL', 'COMPANY']).optional(),
		fullName: z.string().min(2, 'Enter your full name.').max(120),
		email: z.string().email('Enter a valid email address.').max(254),
		phoneCountry: z.custom<CountryCode>(
			(value) => isSupportedPhoneCountry(value),
			'Choose a country code.',
		),
		phone: z.string().min(4, 'Enter your phone number.').max(32),
		password: z
			.string()
			.min(8, 'Password must be at least 8 characters.')
			.max(128)
			.regex(passwordRule, 'Use at least one letter and one special sign.'),
		confirmPassword: z.string().min(1, 'Confirm your password.'),
	})
	.superRefine((values, context) => {
		if (values.role === 'PARTNER' && !values.partnerType) {
			context.addIssue({
				code: 'custom',
				path: ['partnerType'],
				message: 'Choose the partner type.',
			});
		}

		if (!isValidInternationalPhoneNumber(values.phoneCountry, values.phone)) {
			context.addIssue({
				code: 'custom',
				path: ['phone'],
				message: 'Use a valid phone number for the selected country code.',
			});
		}

		if (values.password !== values.confirmPassword) {
			context.addIssue({
				code: 'custom',
				path: ['confirmPassword'],
				message: 'Passwords must match.',
			});
		}
	});

type RegisterFormValues = z.infer<typeof registerSchema>;
type WizardStep = 1 | 2 | 3;

type RegisterFormProps = {
	initialRole?: PublicUserRole;
	title: string;
	description: string;
};

const wizardSteps = [
	{ id: 1, label: 'Role', description: 'Account type' },
	{ id: 2, label: 'Details', description: 'Contact profile' },
	{ id: 3, label: 'Security', description: 'Password setup' },
] as const satisfies readonly {
	id: WizardStep;
	label: string;
	description: string;
}[];

export function RegisterForm({
	initialRole = 'CUSTOMER',
	title,
	description,
}: RegisterFormProps) {
	const router = useRouter();
	const [step, setStep] = useState<WizardStep>(1);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [modalError, setModalError] = useState<string | null>(null);
	const isGoogleLoginEnabled = isUserGoogleLoginEnabled();

	// State setup: the wizard validates only the current step before moving forward.
	const form = useForm<RegisterFormValues>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			role: initialRole,
			partnerType: initialRole === 'PARTNER' ? 'INDIVIDUAL' : undefined,
			fullName: '',
			email: '',
			phoneCountry: RWANDA_PHONE_COUNTRY,
			phone: '',
			password: '',
			confirmPassword: '',
		},
		mode: 'onChange',
	});

	const selectedRole = useWatch({
		control: form.control,
		name: 'role',
	});
	const watchedPartnerType = useWatch({
		control: form.control,
		name: 'partnerType',
	});
	const selectedPhoneCountry = useWatch({
		control: form.control,
		name: 'phoneCountry',
	}) ?? RWANDA_PHONE_COUNTRY;
	const password = useWatch({
		control: form.control,
		name: 'password',
	}) ?? '';
	const confirmPassword = useWatch({
		control: form.control,
		name: 'confirmPassword',
	}) ?? '';

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
				phone: normalizePhoneNumber(values.phoneCountry, values.phone),
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
				response.user.role === 'CUSTOMER'
					? '/account?registered=success'
					: getUserPortalPath(response.user),
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

	const selectedPartnerType = watchedPartnerType ?? 'INDIVIDUAL';
	const passwordChecks = [
		{
			label: 'At least 8 characters',
			valid: password.length >= 8,
		},
		{
			label: 'At least one letter',
			valid: /[A-Za-z]/.test(password),
		},
		{
			label: 'At least one special sign',
			valid: /[^A-Za-z0-9]/.test(password),
		},
		{
			label: 'Passwords match',
			valid: Boolean(confirmPassword) && password === confirmPassword,
		},
	];
	const canUseGoogleSignup = isGoogleLoginEnabled && selectedRole === 'CUSTOMER';

	// Event handlers: step validation keeps users focused and avoids partial submissions.
	async function goToNextStep() {
		const fieldsByStep: Record<WizardStep, (keyof RegisterFormValues)[]> = {
			1: selectedRole === 'PARTNER' ? ['role', 'partnerType'] : ['role'],
			2: ['fullName', 'email', 'phoneCountry', 'phone'],
			3: ['password', 'confirmPassword'],
		};

		const isValid = await form.trigger(fieldsByStep[step], {
			shouldFocus: true,
		});

		if (isValid && step < 3) {
			setStep((currentStep) => (currentStep + 1) as WizardStep);
		}
	}

	function goToPreviousStep() {
		setStep((currentStep) => Math.max(1, currentStep - 1) as WizardStep);
	}

	function onSubmit(values: RegisterFormValues) {
		registerMutation.mutate(values);
	}

	return (
		<>
			<form
				className={`${styles.formWrap} ${styles.wideForm}`}
				onSubmit={(event) => {
					if (step < 3) {
						event.preventDefault();
						void goToNextStep();
						return;
					}

					void form.handleSubmit(onSubmit)(event);
				}}
				noValidate
			>
				<div className={styles.headingBlock}>
					<h1>{title}</h1>
					<p>{description}</p>
				</div>

				<ol className={styles.stepper} aria-label="Registration progress">
					{wizardSteps.map((item) => (
						<li
							key={item.id}
							data-active={item.id === step}
							data-complete={item.id < step}
						>
							<span className={styles.stepNumber}>
								{item.id < step ? <CheckCircle2 aria-hidden="true" /> : item.id}
							</span>
							<span className={styles.stepCopy}>
								<strong>{item.label}</strong>
								<small>{item.description}</small>
							</span>
						</li>
					))}
				</ol>

				{step === 1 ? (
					<section className={styles.stepPanel} aria-label="Choose account role">
						<div className={styles.fieldGroup}>
							<Label>Account role</Label>
							<div
								className={styles.segmentGrid}
								data-invalid={Boolean(form.formState.errors.role)}
							>
								<button
									type="button"
									className={styles.segmentButton}
									data-active={selectedRole === 'CUSTOMER'}
									onClick={() => {
										form.setValue('role', 'CUSTOMER', {
											shouldValidate: true,
										});
										form.setValue('partnerType', undefined, {
											shouldValidate: true,
										});
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
										form.setValue('role', 'PARTNER', {
											shouldValidate: true,
										});
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
					</section>
				) : null}

				{step === 2 ? (
					<section className={styles.stepPanel} aria-label="Enter contact details">
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
								<p className={styles.inlineError}>
									{form.formState.errors.fullName.message}
								</p>
							) : null}
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
							<Label htmlFor="phone">Phone number</Label>
							<div
								className={`${styles.inputShell} ${styles.phoneInputShell}`}
								data-invalid={Boolean(form.formState.errors.phone)}
							>
								<Select
									value={selectedPhoneCountry}
									onValueChange={(value) =>
										form.setValue('phoneCountry', value as CountryCode, {
											shouldDirty: true,
											shouldValidate: true,
										})
									}
								>
									<SelectTrigger
										className={styles.countryCodeTrigger}
										aria-label="Country code"
									>
										<SelectValue>
											<span>
												{getPhoneCountryOption(selectedPhoneCountry).code}
											</span>
											<strong>
												{
													getPhoneCountryOption(selectedPhoneCountry)
														.callingCode
												}
											</strong>
										</SelectValue>
									</SelectTrigger>
									<SelectContent
										className={styles.countryCodeMenu}
										align="start"
										alignItemWithTrigger={false}
									>
										{PHONE_COUNTRIES.map((country) => (
											<SelectItem key={country.code} value={country.code}>
												<span className={styles.countryOption}>
													<strong>{country.callingCode}</strong>
													<span>{country.name}</span>
													<small>{country.code}</small>
												</span>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<span className={styles.phoneDivider} aria-hidden="true" />
								<Phone aria-hidden="true" />
								<Input
									id="phone"
									type="tel"
									autoComplete="tel"
									placeholder={getPhonePlaceholder(selectedPhoneCountry)}
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
					</section>
				) : null}

				{step === 3 ? (
					<section className={styles.stepPanel} aria-label="Create password">
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
								<p className={styles.inlineError}>
									{form.formState.errors.password.message}
								</p>
							) : null}
						</div>

						<div className={styles.fieldGroup}>
							<Label htmlFor="confirmPassword">Confirm password</Label>
							<div
								className={styles.inputShell}
								data-invalid={Boolean(form.formState.errors.confirmPassword)}
							>
								<ShieldCheck aria-hidden="true" />
								<Input
									id="confirmPassword"
									type={showConfirmPassword ? 'text' : 'password'}
									autoComplete="new-password"
									placeholder="Confirm your password"
									aria-invalid={Boolean(form.formState.errors.confirmPassword)}
									{...form.register('confirmPassword')}
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className={styles.passwordToggle}
									aria-label={
										showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
									}
									onClick={() => setShowConfirmPassword((value) => !value)}
								>
									{showConfirmPassword ? (
										<EyeOff aria-hidden="true" />
									) : (
										<Eye aria-hidden="true" />
									)}
								</Button>
							</div>
							{form.formState.errors.confirmPassword ? (
								<p className={styles.inlineError}>
									{form.formState.errors.confirmPassword.message}
								</p>
							) : null}
						</div>

						<ul className={styles.passwordRules} aria-label="Password requirements">
							{passwordChecks.map((check) => (
								<li key={check.label} data-valid={check.valid}>
									<CheckCircle2 aria-hidden="true" />
									{check.label}
								</li>
							))}
						</ul>
					</section>
				) : null}

				{form.formState.errors.root ? (
					<p className={styles.formError}>{form.formState.errors.root.message}</p>
				) : null}

				<div className={styles.wizardActions}>
					{step > 1 ? (
						<Button
							type="button"
							variant="outline"
							className={styles.backButton}
							onClick={goToPreviousStep}
						>
							<ArrowLeft aria-hidden="true" />
							Back
						</Button>
					) : null}

					{step < 3 ? (
						<Button
							type="button"
							className={styles.submitButton}
							onClick={goToNextStep}
						>
							<ArrowRight aria-hidden="true" />
							Continue
						</Button>
					) : (
						<Button
							type="submit"
							className={styles.submitButton}
							disabled={registerMutation.isPending}
							aria-label={
								registerMutation.isPending ? 'Creating account' : 'Create account'
							}
						>
							{registerMutation.isPending ? (
								<LoaderCircle className={styles.spinner} aria-hidden="true" />
							) : (
								<>
									<UserPlus aria-hidden="true" />
									Create account
								</>
							)}
						</Button>
					)}
				</div>

				{canUseGoogleSignup ? (
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
							Sign up with Google
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
