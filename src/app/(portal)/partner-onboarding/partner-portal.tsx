'use client';

import { type ChangeEvent, type FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';
import {
	BadgeCheck,
	Building2,
	CalendarClock,
	CheckCircle2,
	ClipboardCheck,
	FileText,
	Home,
	LayoutDashboard,
	ListChecks,
	Phone,
	RefreshCcw,
	Send,
	Settings,
	ShieldAlert,
	ShieldCheck,
	UploadCloud,
	UserRoundCheck,
	X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PortalAccessBoundary } from '@/components/portal/portal-access-boundary';
import {
	PortalShell,
	type PortalAction,
	type PortalMetric,
	type PortalNavItem,
} from '@/components/portal/portal-shell';
import shellStyles from '@/components/portal/portal-shell.module.css';
import {
	getPartnerProfile,
	saveCompanyPartnerProfile,
	saveIndividualPartnerProfile,
	startFreshPartnerProfile,
	submitPartnerProfile,
	type PartnerProfile,
	type PartnerProfileStatus,
} from '@/services/api/partner-profile';
import type { UserAuthProfile } from '@/services/api/auth';
import {
	PHONE_COUNTRIES,
	RWANDA_PHONE_COUNTRY,
	getPhoneCountryOption,
} from '@/constants/phone-countries';
import {
	getPhonePlaceholder,
	isValidInternationalPhoneNumber,
	normalizePhoneNumber,
} from '@/lib/phone-number';
import { ApiRequestError } from '@/services/api/errors';
import styles from './partner-portal.module.css';

const partnerNavigation: PortalNavItem[] = [
	{ href: '/partner-onboarding', label: 'Overview', icon: LayoutDashboard, active: true },
	{ href: '/partner-onboarding', label: 'Listings', icon: Building2 },
	{ href: '/partner-onboarding', label: 'Documents', icon: FileText },
	{ href: '/partner-onboarding', label: 'Review queue', icon: ClipboardCheck },
	{ href: '/partner-onboarding', label: 'Availability', icon: CalendarClock },
	{ href: '/partner-onboarding', label: 'Settings', icon: Settings },
];

const partnerActions: PortalAction[] = [
	{
		href: '/partner-onboarding',
		label: 'Create first listing',
		description: 'Approved partners can prepare listing content and pricing here.',
		icon: Building2,
	},
	{
		href: '/partner-onboarding',
		label: 'Upload documents',
		description: 'Verification document tools will connect to this workspace.',
		icon: UploadCloud,
	},
];

type PartnerFormState = {
	legalName: string;
	nationalIdNumber: string;
	businessName: string;
	registrationNumber: string;
	taxIdentification: string;
	businessEmail: string;
	businessPhoneCountry: CountryCode;
	businessPhone: string;
	representativeName: string;
	representativeIdNumber: string;
	description: string;
	addressLine: string;
	city: string;
	country: CountryCode;
	websiteUrl: string;
};

type PartnerFormErrors = Partial<Record<keyof PartnerFormState, string>>;
type PartnerTextField = Exclude<
	keyof PartnerFormState,
	'businessPhoneCountry' | 'country'
>;

export function PartnerPortal() {
	return (
		<PortalAccessBoundary allowedRole="PARTNER">
			{(user) => <PartnerPortalContent user={user} />}
		</PortalAccessBoundary>
	);
}

function PartnerPortalContent({
	user,
}: {
	user: UserAuthProfile;
}) {
	const profileQuery = useQuery({
		queryKey: ['partner-profile'],
		queryFn: getPartnerProfile,
	});
	const profile = profileQuery.data?.profile;
	const metrics = useMemo(() => buildMetrics(profile), [profile]);

	return (
		<PortalShell
			variant="partner"
			user={user}
			eyebrow="Partner portal"
			title={buildTitle(user.fullName, profile)}
			description={buildDescription(profile)}
			homeHref="/"
			homeLabel="View marketplace"
			navigation={partnerNavigation}
			metrics={metrics}
			actions={profile?.status === 'APPROVED' ? partnerActions : []}
		>
			{profileQuery.isPending ? (
				<PartnerProfileSkeleton />
			) : profileQuery.isError || !profile ? (
				<PartnerProfileError onRetry={() => profileQuery.refetch()} />
			) : (
				<PartnerProfileWorkflow profile={profile} />
			)}
		</PortalShell>
	);
}

function PartnerProfileWorkflow({ profile }: { profile: PartnerProfile }) {
	if (profile.status === 'APPROVED') {
		return <ApprovedPartnerWorkspace profile={profile} />;
	}

	if (profile.status === 'PENDING') {
		return <PendingReviewPanel profile={profile} />;
	}

	return <PartnerProfileForm profile={profile} />;
}

function PartnerProfileForm({ profile }: { profile: PartnerProfile }) {
	const queryClient = useQueryClient();
	const [form, setForm] = useState<PartnerFormState>(() => toFormState(profile));
	const [errors, setErrors] = useState<PartnerFormErrors>({});
	const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
	const [isStartFreshDialogOpen, setIsStartFreshDialogOpen] = useState(false);
	const isCompany = profile.partnerType === 'COMPANY';

	const saveMutation = useMutation({
		mutationFn: async () => {
			const validationErrors = validateForm(form, isCompany);
			const businessPhone = normalizePhoneNumber(
				form.businessPhoneCountry,
				form.businessPhone,
			);

			if (Object.keys(validationErrors).length) {
				setErrors(validationErrors);
				throw new Error('Please complete the highlighted fields.');
			}

			return isCompany
				? saveCompanyPartnerProfile({
						businessName: form.businessName.trim(),
						registrationNumber: form.registrationNumber.trim(),
						taxIdentification: form.taxIdentification.trim(),
						businessEmail: form.businessEmail.trim(),
						businessPhone,
						representativeName: form.representativeName.trim(),
						representativeIdNumber: form.representativeIdNumber.trim(),
						description: form.description.trim(),
						addressLine: form.addressLine.trim(),
						city: form.city.trim() || 'Kigali',
						country: getPhoneCountryOption(form.country).name,
						websiteUrl: normalizeOptional(form.websiteUrl),
					})
				: saveIndividualPartnerProfile({
						legalName: form.legalName.trim(),
						nationalIdNumber: form.nationalIdNumber.trim(),
						businessEmail: form.businessEmail.trim(),
						businessPhone,
						description: form.description.trim(),
						addressLine: normalizeOptional(form.addressLine),
						city: form.city.trim() || 'Kigali',
						country: getPhoneCountryOption(form.country).name,
						websiteUrl: normalizeOptional(form.websiteUrl),
					});
		},
		onSuccess: (response) => {
			queryClient.setQueryData(['partner-profile'], response);
			toast.success('Partner profile saved.', {
				description: 'Your draft is ready to submit for admin review.',
			});
		},
		onError: (error) => {
			toast.error(getErrorMessage(error));
		},
	});

	const submitMutation = useMutation({
		mutationFn: submitPartnerProfile,
		onSuccess: (response) => {
			queryClient.setQueryData(['partner-profile'], response);
			setIsSubmitDialogOpen(false);
			toast.success('Profile submitted for review.', {
				description: 'The admin team can now review your partner application.',
			});
		},
		onError: (error) => toast.error(getErrorMessage(error)),
	});

	const startFreshMutation = useMutation({
		mutationFn: startFreshPartnerProfile,
		onSuccess: (response) => {
			queryClient.setQueryData(['partner-profile'], response);
			setForm(toFormState(response.profile));
			setIsStartFreshDialogOpen(false);
			toast.success('Fresh application started.', {
				description: 'The previous version was archived for audit history.',
			});
		},
		onError: (error) => toast.error(getErrorMessage(error)),
	});

	function updateField(
		field: PartnerTextField,
		event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) {
		setForm((current) => ({ ...current, [field]: event.target.value }));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function handleSave(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		void saveMutation.mutateAsync();
	}

	return (
		<section className={styles.profilePanel}>
			<div className={styles.profileHeader}>
				<div>
					<span>{isCompany ? 'Company verification' : 'Identity verification'}</span>
					<h2>{profile.status === 'REJECTED' ? 'Update your application' : 'Complete partner profile'}</h2>
					<p>
						{isCompany
							? 'Submit business, tax, and representative information so admins can verify the company.'
							: 'Submit your legal identity and contact information so admins can verify your individual partner account.'}
					</p>
				</div>
				<StatusPill status={profile.status} />
			</div>

			{profile.status === 'REJECTED' ? (
				<div className={styles.rejectionNotice}>
					<ShieldAlert aria-hidden="true" />
					<span>
						<strong>Application rejected</strong>
						<small>{profile.rejectionReason ?? 'Please review your information and submit again.'}</small>
					</span>
				</div>
			) : null}

			<form className={styles.profileForm} onSubmit={handleSave}>
				{isCompany ? (
					<>
						<FormField
							label="Business name"
							value={form.businessName}
							error={errors.businessName}
							onChange={(event) => updateField('businessName', event)}
						/>
						<FormField
							label="Registration number"
							value={form.registrationNumber}
							error={errors.registrationNumber}
							onChange={(event) => updateField('registrationNumber', event)}
						/>
						<FormField
							label="Tax identification"
							value={form.taxIdentification}
							error={errors.taxIdentification}
							onChange={(event) => updateField('taxIdentification', event)}
						/>
						<FormField
							label="Representative name"
							value={form.representativeName}
							error={errors.representativeName}
							onChange={(event) => updateField('representativeName', event)}
						/>
						<FormField
							label="Representative ID number"
							value={form.representativeIdNumber}
							error={errors.representativeIdNumber}
							onChange={(event) => updateField('representativeIdNumber', event)}
						/>
					</>
				) : (
					<>
						<FormField
							label="Legal full name"
							value={form.legalName}
							error={errors.legalName}
							onChange={(event) => updateField('legalName', event)}
						/>
						<FormField
							label="National ID number"
							value={form.nationalIdNumber}
							error={errors.nationalIdNumber}
							onChange={(event) => updateField('nationalIdNumber', event)}
						/>
					</>
				)}

				<FormField
					label="Business email"
					type="email"
					value={form.businessEmail}
					error={errors.businessEmail}
					onChange={(event) => updateField('businessEmail', event)}
				/>
				<BusinessPhoneField
					country={form.businessPhoneCountry}
					phone={form.businessPhone}
					error={errors.businessPhone}
					onCountryChange={(country) => {
						setForm((current) => ({
							...current,
							businessPhoneCountry: country,
						}));
						setErrors((current) => ({ ...current, businessPhone: undefined }));
					}}
					onPhoneChange={(event) => updateField('businessPhone', event)}
				/>
				<FormField
					label="City"
					value={form.city}
					error={errors.city}
					onChange={(event) => updateField('city', event)}
				/>
				<CountrySelectField
					country={form.country}
					error={errors.country}
					onCountryChange={(country) => {
						setForm((current) => ({ ...current, country }));
						setErrors((current) => ({ ...current, country: undefined }));
					}}
				/>
				<FormField
					label="Website URL"
					value={form.websiteUrl}
					error={errors.websiteUrl}
					onChange={(event) => updateField('websiteUrl', event)}
					optional
				/>
				<FormField
					label="Address"
					value={form.addressLine}
					error={errors.addressLine}
					onChange={(event) => updateField('addressLine', event)}
					optional={!isCompany}
				/>

				<label className={styles.formField} data-wide="true">
					<span>Profile description</span>
					<Textarea
						className={styles.descriptionTextarea}
						value={form.description}
						onChange={(event) => updateField('description', event)}
						aria-invalid={Boolean(errors.description)}
						placeholder="Describe your experience, services, and what you plan to list on Pluto Booking."
					/>
					{errors.description ? <small>{errors.description}</small> : null}
				</label>

				<div className={styles.formActions}>
					{profile.status === 'REJECTED' ? (
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsStartFreshDialogOpen(true)}
							disabled={startFreshMutation.isPending}
						>
							<RefreshCcw aria-hidden="true" />
							Start fresh
						</Button>
					) : null}
					<Button type="submit" disabled={saveMutation.isPending}>
						<CheckCircle2 aria-hidden="true" />
						{saveMutation.isPending ? 'Saving...' : 'Save draft'}
					</Button>
					<Button
						type="button"
						variant="outline"
						onClick={() => setIsSubmitDialogOpen(true)}
						disabled={saveMutation.isPending || submitMutation.isPending}
					>
						<Send aria-hidden="true" />
						Submit for review
					</Button>
				</div>
			</form>

			<AlertDialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
				<AlertDialogContent className={styles.dialog}>
					<AlertDialogHeader>
						<AlertDialogTitle>Submit partner profile?</AlertDialogTitle>
						<AlertDialogDescription>
							Your profile will be locked while admins review it. If it is rejected,
							you can update the application and resubmit it again.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={submitMutation.isPending}>
							<X aria-hidden="true" />
							Review first
						</AlertDialogCancel>
						<AlertDialogAction
							disabled={submitMutation.isPending}
							onClick={(event) => {
								event.preventDefault();
								void submitMutation.mutateAsync();
							}}
						>
							<Send aria-hidden="true" />
							{submitMutation.isPending ? 'Submitting...' : 'Submit profile'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog open={isStartFreshDialogOpen} onOpenChange={setIsStartFreshDialogOpen}>
				<AlertDialogContent className={styles.dialog}>
					<AlertDialogHeader>
						<AlertDialogTitle>Start a fresh application?</AlertDialogTitle>
						<AlertDialogDescription>
							The current application data will be archived for audit history and
							your editable form will be reset.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={startFreshMutation.isPending}>
							<X aria-hidden="true" />
							Keep editing
						</AlertDialogCancel>
						<AlertDialogAction
							disabled={startFreshMutation.isPending}
							onClick={(event) => {
								event.preventDefault();
								void startFreshMutation.mutateAsync();
							}}
						>
							<RefreshCcw aria-hidden="true" />
							{startFreshMutation.isPending ? 'Resetting...' : 'Start fresh'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</section>
	);
}

function ApprovedPartnerWorkspace({ profile }: { profile: PartnerProfile }) {
	const isCompany = profile.partnerType === 'COMPANY';

	return (
		<section className={shellStyles.featureBand}>
			<div>
				<h2>{isCompany ? 'Business partner workspace' : 'Individual partner workspace'}</h2>
				<p>
					Your profile is approved. You can now prepare listings, upload
					supporting media, manage availability, and build your marketplace
					presence.
				</p>
			</div>
			<ul className={shellStyles.featureList}>
				<li>
					<ListChecks aria-hidden="true" />
					Listing readiness tools
				</li>
				<li>
					<UploadCloud aria-hidden="true" />
					Secure document and media uploads
				</li>
				<li>
					<Home aria-hidden="true" />
					Approved partner operations
				</li>
			</ul>
		</section>
	);
}

function PendingReviewPanel({ profile }: { profile: PartnerProfile }) {
	return (
		<section className={styles.profilePanel}>
			<div className={styles.pendingPanel}>
				<ShieldCheck aria-hidden="true" />
				<div>
					<span>Admin review in progress</span>
					<h2>Your partner profile is pending</h2>
					<p>
						The portal remains locked while admins review your application. You
						will be able to manage listings after approval.
					</p>
				</div>
				<div className={styles.timeline}>
					<strong>Submitted</strong>
					<span>{formatDate(profile.resubmittedAt ?? profile.submittedAt)}</span>
				</div>
			</div>
		</section>
	);
}

function PartnerProfileSkeleton() {
	return (
		<section className={styles.profilePanel} aria-label="Loading partner profile">
			<div className={styles.skeletonLine} />
			<div className={styles.skeletonGrid}>
				<div />
				<div />
				<div />
				<div />
			</div>
		</section>
	);
}

function PartnerProfileError({ onRetry }: { onRetry: () => void }) {
	return (
		<section className={styles.profilePanel}>
			<div className={styles.pendingPanel}>
				<ShieldAlert aria-hidden="true" />
				<div>
					<span>Profile unavailable</span>
					<h2>We could not load your partner profile</h2>
					<p>Try again before submitting or editing your verification details.</p>
				</div>
				<Button type="button" onClick={onRetry}>
					<RefreshCcw aria-hidden="true" />
					Retry
				</Button>
			</div>
		</section>
	);
}

function FormField({
	label,
	value,
	error,
	type = 'text',
	optional = false,
	onChange,
}: {
	label: string;
	value: string;
	error?: string;
	type?: string;
	optional?: boolean;
	onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
	return (
		<label className={styles.formField}>
			<span>
				{label}
				{optional ? <em>Optional</em> : null}
			</span>
			<Input
				type={type}
				value={value}
				onChange={onChange}
				aria-invalid={Boolean(error)}
			/>
			{error ? <small>{error}</small> : null}
		</label>
	);
}

function BusinessPhoneField({
	country,
	phone,
	error,
	onCountryChange,
	onPhoneChange,
}: {
	country: CountryCode;
	phone: string;
	error?: string;
	onCountryChange: (country: CountryCode) => void;
	onPhoneChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
	const countryOption = getPhoneCountryOption(country);

	return (
		<label className={styles.formField}>
			<span>Business phone</span>
			<div className={styles.phoneInputShell} data-invalid={Boolean(error)}>
				<Select
					value={country}
					onValueChange={(value) => onCountryChange(value as CountryCode)}
				>
					<SelectTrigger
						className={styles.countryCodeTrigger}
						aria-label="Business phone country code"
					>
						<SelectValue>
							<span>
								<span>{countryOption.code}</span>
								<strong>{countryOption.callingCode}</strong>
							</span>
						</SelectValue>
					</SelectTrigger>
					<SelectContent
						className={styles.countryCodeMenu}
						align="start"
						alignItemWithTrigger={false}
					>
						{PHONE_COUNTRIES.map((option) => (
							<SelectItem key={option.code} value={option.code}>
								<span className={styles.countryOption}>
									<strong>{option.callingCode}</strong>
									<span>{option.name}</span>
									<small>{option.code}</small>
								</span>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<span className={styles.phoneDivider} aria-hidden="true" />
				<Phone aria-hidden="true" />
				<Input
					type="tel"
					value={phone}
					onChange={onPhoneChange}
					placeholder={getPhonePlaceholder(country)}
					aria-invalid={Boolean(error)}
					autoComplete="tel"
				/>
			</div>
			{error ? <small>{error}</small> : null}
		</label>
	);
}

function CountrySelectField({
	country,
	error,
	onCountryChange,
}: {
	country: CountryCode;
	error?: string;
	onCountryChange: (country: CountryCode) => void;
}) {
	const countryOption = getPhoneCountryOption(country);

	return (
		<label className={styles.formField}>
			<span>Country</span>
			<Select
				value={country}
				onValueChange={(value) => onCountryChange(value as CountryCode)}
			>
				<SelectTrigger
					className={styles.countrySelectTrigger}
					aria-label="Partner country"
					aria-invalid={Boolean(error)}
				>
					<SelectValue>
						<span>
							<strong>{countryOption.name}</strong>
							<small>{countryOption.code}</small>
						</span>
					</SelectValue>
				</SelectTrigger>
				<SelectContent
					className={styles.countryCodeMenu}
					align="start"
					alignItemWithTrigger={false}
				>
					{PHONE_COUNTRIES.map((option) => (
						<SelectItem key={option.code} value={option.code}>
							<span className={styles.countryOption}>
								<strong>{option.callingCode}</strong>
								<span>{option.name}</span>
								<small>{option.code}</small>
							</span>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{error ? <small>{error}</small> : null}
		</label>
	);
}

function StatusPill({ status }: { status: PartnerProfileStatus }) {
	return (
		<span className={styles.statusPill} data-status={status}>
			{status.toLowerCase().replace('_', ' ')}
		</span>
	);
}

function buildMetrics(profile?: PartnerProfile): PortalMetric[] {
	return [
		{
			label: 'Listings prepared',
			value: profile?.status === 'APPROVED' ? 'Ready' : 'Locked',
			description:
				profile?.status === 'APPROVED'
					? 'Listing tools are available for approved partners.'
					: 'Listing tools unlock after admin approval.',
			icon: Building2,
		},
		{
			label: 'Verification status',
			value: profile ? profile.status : 'Loading',
			description: 'Partner profile status controls portal access.',
			icon: BadgeCheck,
		},
		{
			label: 'Partner type',
			value: profile?.partnerType === 'COMPANY' ? 'Business' : 'Individual',
			description: 'Verification questions adapt to the selected partner type.',
			icon: profile?.partnerType === 'COMPANY' ? Building2 : UserRoundCheck,
		},
	];
}

function buildTitle(fullName: string, profile?: PartnerProfile) {
	if (!profile) {
		return `Welcome, ${fullName}`;
	}

	if (profile.status === 'APPROVED') {
		return profile.partnerType === 'COMPANY'
			? 'Business partner workspace'
			: 'Individual partner workspace';
	}

	return profile.status === 'PENDING'
		? 'Your application is under review'
		: 'Complete your partner verification';
}

function buildDescription(profile?: PartnerProfile) {
	if (!profile) {
		return 'Loading your secure partner profile and application status.';
	}

	if (profile.status === 'APPROVED') {
		return 'Your profile is approved. Listing and marketplace operations are available from this secure partner workspace.';
	}

	if (profile.status === 'PENDING') {
		return 'Admin review is in progress. Your operational portal unlocks when the application is approved.';
	}

	if (profile.status === 'REJECTED') {
		return 'Review the admin feedback, update the application, or start fresh before resubmitting.';
	}

	return 'Complete the verification form before submitting your partner profile for admin review.';
}

function toFormState(profile: PartnerProfile): PartnerFormState {
	return {
		legalName: profile.legalName ?? '',
		nationalIdNumber: profile.nationalIdNumber ?? '',
		businessName: profile.businessName ?? '',
		registrationNumber: profile.registrationNumber ?? '',
		taxIdentification: profile.taxIdentification ?? '',
		businessEmail: profile.businessEmail ?? '',
		...toPhoneFormState(profile.businessPhone),
		representativeName: profile.representativeName ?? '',
		representativeIdNumber: profile.representativeIdNumber ?? '',
		description: profile.description ?? '',
		addressLine: profile.addressLine ?? '',
		city: profile.city ?? 'Kigali',
		country: toCountryCode(profile.country),
		websiteUrl: profile.websiteUrl ?? '',
	};
}

function validateForm(form: PartnerFormState, isCompany: boolean) {
	const errors: PartnerFormErrors = {};
	const requiredFields: PartnerTextField[] = isCompany
		? [
				'businessName',
				'registrationNumber',
				'taxIdentification',
				'businessEmail',
				'businessPhone',
				'representativeName',
				'representativeIdNumber',
				'description',
				'addressLine',
			]
		: ['legalName', 'nationalIdNumber', 'businessEmail', 'businessPhone', 'description'];

	requiredFields.forEach((field) => {
		if (!form[field].trim()) {
			errors[field] = 'This field is required.';
		}
	});

	if (form.businessEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.businessEmail)) {
		errors.businessEmail = 'Enter a valid business email.';
	}

	if (
		form.businessPhone &&
		!isValidInternationalPhoneNumber(
			form.businessPhoneCountry,
			form.businessPhone,
		)
	) {
		errors.businessPhone = 'Use a valid phone number for the selected country code.';
	}

	return errors;
}

function toPhoneFormState(phone?: string | null) {
	const parsedPhone = phone ? parsePhoneNumberFromString(phone) : undefined;

	if (parsedPhone?.country) {
		return {
			businessPhoneCountry: parsedPhone.country,
			businessPhone: parsedPhone.nationalNumber,
		};
	}

	return {
		businessPhoneCountry: RWANDA_PHONE_COUNTRY,
		businessPhone: phone ?? '',
	};
}

function toCountryCode(country?: string | null) {
	if (!country) {
		return RWANDA_PHONE_COUNTRY;
	}

	const normalizedCountry = country.trim().toLowerCase();
	const matchedCountry = PHONE_COUNTRIES.find(
		(option) =>
			option.code.toLowerCase() === normalizedCountry ||
			option.name.toLowerCase() === normalizedCountry,
	);

	return matchedCountry?.code ?? RWANDA_PHONE_COUNTRY;
}

function normalizeOptional(value: string) {
	const trimmed = value.trim();

	return trimmed || undefined;
}

function getErrorMessage(error: unknown) {
	if (error instanceof ApiRequestError || error instanceof Error) {
		return error.message;
	}

	return 'The request could not be completed.';
}

function formatDate(value?: string | null) {
	if (!value) {
		return 'Not submitted yet';
	}

	return new Intl.DateTimeFormat('en', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}).format(new Date(value));
}
