'use client';

import { type ChangeEvent, type FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	parsePhoneNumberFromString,
	type CountryCode,
} from 'libphonenumber-js';
import {
	BadgeCheck,
	Building2,
	CalendarClock,
	CarFront,
	CheckCircle2,
	ClipboardCheck,
	FileText,
	Home,
	LayoutDashboard,
	ListChecks,
	Phone,
	PlusCircle,
	RefreshCcw,
	Send,
	Settings,
	ShieldAlert,
	ShieldCheck,
	Tag,
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
	uploadPartnerDocument,
	type PartnerDocument,
	type PartnerProfile,
	type PartnerProfileStatus,
} from '@/services/api/partner-profile';
import {
	createCarProduct,
	listPartnerProducts,
	type CreateCarProductRequest,
} from '@/services/api/partner-products';
import type { Product, ProductStatus } from '@/services/api/products';
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
	{
		href: '/partner-onboarding',
		label: 'Overview',
		icon: LayoutDashboard,
		active: true,
	},
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
		description:
			'Approved partners can prepare listing content and pricing here.',
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

type ListingFormState = {
	title: string;
	description: string;
	shortDescription: string;
	city: string;
	basePrice: string;
	brand: string;
	model: string;
	year: string;
	transmission: string;
	fuelType: string;
	seats: string;
	doors: string;
	driverIncluded: boolean;
	insuranceIncluded: boolean;
};

type ListingFormErrors = Partial<Record<keyof ListingFormState, string>>;

export function PartnerPortal() {
	return (
		<PortalAccessBoundary allowedRole="PARTNER">
			{(user) => <PartnerPortalContent user={user} />}
		</PortalAccessBoundary>
	);
}

function PartnerPortalContent({ user }: { user: UserAuthProfile }) {
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
				<PartnerProfileWorkflow profile={profile} user={user} />
			)}
		</PortalShell>
	);
}

function PartnerProfileWorkflow({
	profile,
	user,
}: {
	profile: PartnerProfile;
	user: UserAuthProfile;
}) {
	if (profile.status === 'APPROVED') {
		return <ApprovedPartnerWorkspace profile={profile} />;
	}

	if (profile.status === 'PENDING') {
		return <PendingReviewPanel profile={profile} />;
	}

	return <PartnerProfileForm profile={profile} user={user} />;
}

function PartnerProfileForm({
	profile,
	user,
}: {
	profile: PartnerProfile;
	user: UserAuthProfile;
}) {
	const queryClient = useQueryClient();
	const [form, setForm] = useState<PartnerFormState>(() =>
		toFormState(profile, user),
	);
	const [errors, setErrors] = useState<PartnerFormErrors>({});
	const [documentTitle, setDocumentTitle] = useState('');
	const [documentDescription, setDocumentDescription] = useState('');
	const [documentFile, setDocumentFile] = useState<File | null>(null);
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
						nationalIdNumber: normalizeOptional(form.nationalIdNumber),
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
			setForm(toFormState(response.profile, user));
			setIsStartFreshDialogOpen(false);
			toast.success('Fresh application started.', {
				description: 'The previous version was archived for audit history.',
			});
		},
		onError: (error) => toast.error(getErrorMessage(error)),
	});

	const uploadDocumentMutation = useMutation({
		mutationFn: () => {
			if (!documentTitle.trim()) {
				throw new Error('Add a clear document title before uploading.');
			}

			if (!documentFile) {
				throw new Error('Choose a verification document to upload.');
			}

			return uploadPartnerDocument({
				title: documentTitle.trim(),
				description: normalizeOptional(documentDescription),
				file: documentFile,
			});
		},
		onSuccess: () => {
			setDocumentTitle('');
			setDocumentDescription('');
			setDocumentFile(null);
			void queryClient.invalidateQueries({ queryKey: ['partner-profile'] });
			toast.success('Document uploaded.', {
				description: 'Admins can review it with your partner application.',
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
					<span>
						{isCompany ? 'Company verification' : 'Identity verification'}
					</span>
					<h2>
						{profile.status === 'REJECTED'
							? 'Update your application'
							: 'Complete partner profile'}
					</h2>
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
						<small>
							{profile.rejectionReason ??
								'Please review your information and submit again.'}
						</small>
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
							placeholder="Enter your registered business name"
							onChange={(event) => updateField('businessName', event)}
						/>
						<FormField
							label="Registration number"
							value={form.registrationNumber}
							error={errors.registrationNumber}
							placeholder="Enter your company registration number"
							onChange={(event) => updateField('registrationNumber', event)}
						/>
						<FormField
							label="Tax identification"
							value={form.taxIdentification}
							error={errors.taxIdentification}
							placeholder="Enter your tax identification number"
							onChange={(event) => updateField('taxIdentification', event)}
						/>
						<FormField
							label="Representative name"
							value={form.representativeName}
							error={errors.representativeName}
							placeholder="Enter the authorized representative name"
							onChange={(event) => updateField('representativeName', event)}
						/>
						<FormField
							label="Representative ID number"
							value={form.representativeIdNumber}
							error={errors.representativeIdNumber}
							placeholder="Enter the representative ID number"
							onChange={(event) => updateField('representativeIdNumber', event)}
						/>
					</>
				) : (
					<>
						<FormField
							label="Legal full name"
							value={form.legalName}
							error={errors.legalName}
							placeholder="Use the full name on your Pluto Booking account"
							onChange={(event) => updateField('legalName', event)}
						/>
						<FormField
							label="National ID number"
							value={form.nationalIdNumber}
							error={errors.nationalIdNumber}
							placeholder="Add your national ID number if available"
							optional
							onChange={(event) => updateField('nationalIdNumber', event)}
						/>
					</>
				)}

				<FormField
					label="Business email"
					type="email"
					value={form.businessEmail}
					error={errors.businessEmail}
					placeholder="Use your account email or business email"
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
					placeholder="Kigali"
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
					placeholder="https://yourwebsite.com"
					onChange={(event) => updateField('websiteUrl', event)}
					optional
				/>
				<FormField
					label="Address"
					value={form.addressLine}
					error={errors.addressLine}
					placeholder="Street, building, or business address"
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

				<DocumentUploadPanel
					documents={profile.documents}
					title={documentTitle}
					description={documentDescription}
					file={documentFile}
					isUploading={uploadDocumentMutation.isPending}
					onTitleChange={(event) => setDocumentTitle(event.target.value)}
					onDescriptionChange={(event) =>
						setDocumentDescription(event.target.value)
					}
					onFileChange={(event) => {
						setDocumentFile(event.target.files?.[0] ?? null);
					}}
					onUpload={() => uploadDocumentMutation.mutate()}
				/>

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

			<AlertDialog
				open={isSubmitDialogOpen}
				onOpenChange={setIsSubmitDialogOpen}
			>
				<AlertDialogContent className={styles.dialog}>
					<AlertDialogHeader>
						<AlertDialogTitle>Submit partner profile?</AlertDialogTitle>
						<AlertDialogDescription>
							Your profile will be locked while admins review it. If it is
							rejected, you can update the application and resubmit it again.
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

			<AlertDialog
				open={isStartFreshDialogOpen}
				onOpenChange={setIsStartFreshDialogOpen}
			>
				<AlertDialogContent className={styles.dialog}>
					<AlertDialogHeader>
						<AlertDialogTitle>Start a fresh application?</AlertDialogTitle>
						<AlertDialogDescription>
							The current application data will be archived for audit history
							and your editable form will be reset.
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

function DocumentUploadPanel({
	documents,
	title,
	description,
	file,
	isUploading,
	onTitleChange,
	onDescriptionChange,
	onFileChange,
	onUpload,
}: {
	documents: PartnerDocument[];
	title: string;
	description: string;
	file: File | null;
	isUploading: boolean;
	onTitleChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onDescriptionChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
	onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
	onUpload: () => void;
}) {
	return (
		<section className={styles.documentPanel} data-wide="true">
			<div className={styles.documentPanelHeader}>
				<div>
					<span>Verification documents</span>
					<h3>Optional private review files</h3>
					<p>
						You can add identity, registration, or tax files when they help the
						review. Files stay private and are only visible to authorized
						admins, but they are not required to submit the profile.
					</p>
				</div>
				<UploadCloud aria-hidden="true" />
			</div>

			<div className={styles.documentUploadGrid}>
				<FormField
					label="Document title"
					value={title}
					placeholder="Example: National ID, tax certificate, or license"
					onChange={onTitleChange}
				/>
				<label className={styles.formField}>
					<span>
						Document file
						<em>Optional</em>
					</span>
					<Input
						type="file"
						accept=".pdf,image/png,image/jpeg,image/webp"
						onChange={onFileChange}
					/>
					{file ? <small className={styles.fileHint}>{file.name}</small> : null}
				</label>
				<label className={styles.formField} data-wide="true">
					<span>
						Document note
						<em>Optional</em>
					</span>
					<Textarea
						className={styles.descriptionTextarea}
						value={description}
						onChange={onDescriptionChange}
						placeholder="Add context for the admin reviewer."
					/>
				</label>
			</div>

			<div className={styles.documentActions}>
				<Button type="button" onClick={onUpload} disabled={isUploading}>
					<UploadCloud aria-hidden="true" />
					{isUploading ? 'Uploading...' : 'Upload document'}
				</Button>
			</div>

			<div className={styles.documentList}>
				{documents.length ? (
					documents.map((document) => (
						<div key={document.id} className={styles.documentItem}>
							<FileText aria-hidden="true" />
							<span>
								<strong>{document.title}</strong>
								<small>
									{document.file.originalName} ·{' '}
									{formatFileSize(document.file.sizeBytes)}
								</small>
							</span>
							<StatusPill status={document.status} />
						</div>
					))
				) : (
					<p>No documents uploaded yet.</p>
				)}
			</div>
		</section>
	);
}

function ApprovedPartnerWorkspace({ profile }: { profile: PartnerProfile }) {
	const isCompany = profile.partnerType === 'COMPANY';
	const queryClient = useQueryClient();
	const [form, setForm] = useState<ListingFormState>(defaultListingForm);
	const [errors, setErrors] = useState<ListingFormErrors>({});
	const productsQuery = useQuery({
		queryKey: ['partner-products'],
		queryFn: () => listPartnerProducts({ page: 1 }),
	});
	const createListingMutation = useMutation({
		mutationFn: (payload: CreateCarProductRequest) => createCarProduct(payload),
		onSuccess: () => {
			setForm(defaultListingForm);
			setErrors({});
			void queryClient.invalidateQueries({ queryKey: ['partner-products'] });
			toast.success('Car listing submitted.', {
				description: 'Admins can now review it before it goes public.',
			});
		},
		onError: (error) => toast.error(getErrorMessage(error)),
	});

	function updateListingField(
		field: keyof ListingFormState,
		value: string | boolean,
	) {
		setForm((current) => ({ ...current, [field]: value }));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function handleCreateListing(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const validationErrors = validateListingForm(form);

		if (Object.keys(validationErrors).length) {
			setErrors(validationErrors);
			toast.error('Complete the highlighted listing fields.');
			return;
		}

		createListingMutation.mutate(toCreateCarProductPayload(form));
	}

	return (
		<section className={styles.approvedWorkspace}>
			<div className={shellStyles.featureBand}>
				<div>
					<h2>
						{isCompany
							? 'Business partner workspace'
							: 'Individual partner workspace'}
					</h2>
					<p>
						Your profile is approved. Create accurate listings for admin review
						before they become public in the marketplace.
					</p>
				</div>
				<ul className={shellStyles.featureList}>
					<li>
						<ListChecks aria-hidden="true" />
						Listing review workflow
					</li>
					<li>
						<UploadCloud aria-hidden="true" />
						Media-ready product records
					</li>
					<li>
						<Home aria-hidden="true" />
						Approved partner operations
					</li>
				</ul>
			</div>

			<div className={styles.listingGrid}>
				<form className={styles.listingForm} onSubmit={handleCreateListing}>
					<div className={styles.listingHeader}>
						<span>
							<CarFront aria-hidden="true" />
							New car listing
						</span>
						<h3>Submit a vehicle for review</h3>
						<p>
							Start with the core listing details. Images, availability, and
							advanced pricing can be connected after the review workflow.
						</p>
					</div>

					<ListingField
						label="Listing title"
						value={form.title}
						error={errors.title}
						placeholder="Toyota RAV4 for Kigali trips"
						onChange={(value) => updateListingField('title', value)}
					/>
					<ListingField
						label="Short summary"
						value={form.shortDescription}
						error={errors.shortDescription}
						placeholder="Comfortable SUV with flexible daily pricing"
						onChange={(value) => updateListingField('shortDescription', value)}
						optional
					/>
					<label className={styles.formField} data-wide="true">
						<span>Description</span>
						<Textarea
							className={styles.descriptionTextarea}
							value={form.description}
							onChange={(event) =>
								updateListingField('description', event.target.value)
							}
							placeholder="Describe the car, pickup rules, included services, and ideal customer use cases."
							aria-invalid={Boolean(errors.description)}
						/>
						{errors.description ? <small>{errors.description}</small> : null}
					</label>
					<ListingField
						label="City"
						value={form.city}
						error={errors.city}
						placeholder="Kigali"
						onChange={(value) => updateListingField('city', value)}
					/>
					<ListingField
						label="Daily base price"
						value={form.basePrice}
						error={errors.basePrice}
						placeholder="45000"
						type="number"
						onChange={(value) => updateListingField('basePrice', value)}
					/>
					<ListingField
						label="Brand"
						value={form.brand}
						error={errors.brand}
						placeholder="Toyota"
						onChange={(value) => updateListingField('brand', value)}
					/>
					<ListingField
						label="Model"
						value={form.model}
						error={errors.model}
						placeholder="RAV4"
						onChange={(value) => updateListingField('model', value)}
					/>
					<ListingField
						label="Year"
						value={form.year}
						error={errors.year}
						placeholder="2022"
						type="number"
						onChange={(value) => updateListingField('year', value)}
					/>
					<ListingField
						label="Transmission"
						value={form.transmission}
						error={errors.transmission}
						placeholder="Automatic"
						onChange={(value) => updateListingField('transmission', value)}
					/>
					<ListingField
						label="Fuel type"
						value={form.fuelType}
						error={errors.fuelType}
						placeholder="Petrol"
						onChange={(value) => updateListingField('fuelType', value)}
					/>
					<ListingField
						label="Seats"
						value={form.seats}
						error={errors.seats}
						placeholder="5"
						type="number"
						onChange={(value) => updateListingField('seats', value)}
					/>
					<ListingField
						label="Doors"
						value={form.doors}
						error={errors.doors}
						placeholder="4"
						type="number"
						onChange={(value) => updateListingField('doors', value)}
					/>

					<div className={styles.listingToggles} data-wide="true">
						<label>
							<input
								type="checkbox"
								checked={form.driverIncluded}
								onChange={(event) =>
									updateListingField('driverIncluded', event.target.checked)
								}
							/>
							<span>Driver included</span>
						</label>
						<label>
							<input
								type="checkbox"
								checked={form.insuranceIncluded}
								onChange={(event) =>
									updateListingField('insuranceIncluded', event.target.checked)
								}
							/>
							<span>Insurance included</span>
						</label>
					</div>

					<div className={styles.formActions} data-wide="true">
						<Button type="submit" disabled={createListingMutation.isPending}>
							<PlusCircle aria-hidden="true" />
							{createListingMutation.isPending
								? 'Submitting...'
								: 'Submit listing'}
						</Button>
					</div>
				</form>

				<PartnerProductsPanel
					products={productsQuery.data?.items ?? []}
					isLoading={productsQuery.isPending}
					isError={productsQuery.isError}
					onRetry={() => productsQuery.refetch()}
				/>
			</div>
		</section>
	);
}

function ListingField({
	label,
	value,
	error,
	type = 'text',
	optional = false,
	placeholder,
	onChange,
}: {
	label: string;
	value: string;
	error?: string;
	type?: string;
	optional?: boolean;
	placeholder?: string;
	onChange: (value: string) => void;
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
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				aria-invalid={Boolean(error)}
			/>
			{error ? <small>{error}</small> : null}
		</label>
	);
}

function PartnerProductsPanel({
	products,
	isLoading,
	isError,
	onRetry,
}: {
	products: Product[];
	isLoading: boolean;
	isError: boolean;
	onRetry: () => void;
}) {
	return (
		<aside className={styles.productsPanel}>
			<div className={styles.productsHeader}>
				<span>
					<Tag aria-hidden="true" />
					Your listings
				</span>
				<h3>Review status</h3>
				<p>
					Track submitted listings and admin decisions before customers can see
					them.
				</p>
			</div>

			{isLoading ? (
				<div className={styles.productsSkeleton} aria-label="Loading listings">
					{Array.from({ length: 4 }).map((_, index) => (
						<div key={index} />
					))}
				</div>
			) : isError ? (
				<div className={styles.productsEmpty}>
					<ShieldAlert aria-hidden="true" />
					<strong>Listings unavailable</strong>
					<p>Refresh this panel before creating or reviewing listing status.</p>
					<Button type="button" variant="outline" onClick={onRetry}>
						<RefreshCcw aria-hidden="true" />
						Retry
					</Button>
				</div>
			) : products.length ? (
				<div className={styles.productList}>
					{products.map((product) => (
						<div key={product.id} className={styles.productCard}>
							<span>
								<strong>{product.title}</strong>
								<small>
									{formatMoney(product.basePrice, product.currency)} /{' '}
									{product.pricingUnit.toLowerCase()}
								</small>
							</span>
							<ProductStatusPill status={product.status ?? 'PENDING_REVIEW'} />
						</div>
					))}
				</div>
			) : (
				<div className={styles.productsEmpty}>
					<CarFront aria-hidden="true" />
					<strong>No listings yet</strong>
					<p>Submit your first car listing for secure admin review.</p>
				</div>
			)}
		</aside>
	);
}

function ProductStatusPill({ status }: { status: ProductStatus }) {
	return (
		<span className={styles.productStatusPill} data-status={status}>
			{status.toLowerCase().replace('_', ' ')}
		</span>
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
					<span>
						{formatDate(profile.resubmittedAt ?? profile.submittedAt)}
					</span>
				</div>
			</div>
		</section>
	);
}

function PartnerProfileSkeleton() {
	return (
		<section
			className={styles.profilePanel}
			aria-label="Loading partner profile"
		>
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
					<p>
						Try again before submitting or editing your verification details.
					</p>
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
	placeholder,
	onChange,
}: {
	label: string;
	value: string;
	error?: string;
	type?: string;
	optional?: boolean;
	placeholder?: string;
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
				placeholder={placeholder}
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

function toFormState(
	profile: PartnerProfile,
	user?: UserAuthProfile,
): PartnerFormState {
	const shouldUseAccountDefaults = profile.partnerType === 'INDIVIDUAL';
	const fallbackLegalName = shouldUseAccountDefaults
		? (user?.fullName ?? '')
		: '';
	const fallbackEmail = shouldUseAccountDefaults ? (user?.email ?? '') : '';
	const phoneSource =
		profile.businessPhone ??
		(shouldUseAccountDefaults ? (user?.phone ?? null) : null);

	return {
		legalName: profile.legalName ?? fallbackLegalName,
		nationalIdNumber: profile.nationalIdNumber ?? '',
		businessName: profile.businessName ?? '',
		registrationNumber: profile.registrationNumber ?? '',
		taxIdentification: profile.taxIdentification ?? '',
		businessEmail: profile.businessEmail ?? fallbackEmail,
		...toPhoneFormState(phoneSource),
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
		: ['legalName', 'businessEmail', 'businessPhone', 'description'];

	requiredFields.forEach((field) => {
		if (!form[field].trim()) {
			errors[field] = 'This field is required.';
		}
	});

	if (
		form.businessEmail &&
		!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.businessEmail)
	) {
		errors.businessEmail = 'Enter a valid business email.';
	}

	if (
		form.businessPhone &&
		!isValidInternationalPhoneNumber(
			form.businessPhoneCountry,
			form.businessPhone,
		)
	) {
		errors.businessPhone =
			'Use a valid phone number for the selected country code.';
	}

	return errors;
}

const defaultListingForm: ListingFormState = {
	title: '',
	description: '',
	shortDescription: '',
	city: 'Kigali',
	basePrice: '',
	brand: '',
	model: '',
	year: '',
	transmission: 'Automatic',
	fuelType: 'Petrol',
	seats: '5',
	doors: '4',
	driverIncluded: false,
	insuranceIncluded: true,
};

function validateListingForm(form: ListingFormState) {
	const errors: ListingFormErrors = {};
	const requiredFields: (keyof ListingFormState)[] = [
		'title',
		'description',
		'city',
		'basePrice',
		'brand',
		'model',
		'year',
		'transmission',
		'fuelType',
		'seats',
		'doors',
	];

	requiredFields.forEach((field) => {
		if (typeof form[field] === 'string' && !form[field].trim()) {
			errors[field] = 'This field is required.';
		}
	});

	if (form.title.trim() && form.title.trim().length < 4) {
		errors.title = 'Use at least 4 characters.';
	}

	if (form.description.trim() && form.description.trim().length < 30) {
		errors.description = 'Use at least 30 characters.';
	}

	if (Number(form.basePrice) <= 0) {
		errors.basePrice = 'Enter a valid price.';
	}

	const year = Number(form.year);
	if (!Number.isInteger(year) || year < 1990 || year > 2035) {
		errors.year = 'Enter a valid vehicle year.';
	}

	if (Number(form.seats) < 1) {
		errors.seats = 'Enter at least 1 seat.';
	}

	if (Number(form.doors) < 1) {
		errors.doors = 'Enter at least 1 door.';
	}

	return errors;
}

function toCreateCarProductPayload(
	form: ListingFormState,
): CreateCarProductRequest {
	return {
		title: form.title.trim(),
		description: form.description.trim(),
		shortDescription: normalizeOptional(form.shortDescription),
		city: form.city.trim() || 'Kigali',
		country: 'Rwanda',
		basePrice: form.basePrice.trim(),
		currency: 'RWF',
		pricingUnit: 'DAY',
		brand: form.brand.trim(),
		model: form.model.trim(),
		year: Number(form.year),
		transmission: form.transmission.trim(),
		fuelType: form.fuelType.trim(),
		seats: Number(form.seats),
		doors: Number(form.doors),
		driverIncluded: form.driverIncluded,
		insuranceIncluded: form.insuranceIncluded,
		airConditioning: true,
	};
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

function formatFileSize(sizeBytes: number) {
	if (sizeBytes < 1024 * 1024) {
		return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
	}

	return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatMoney(value: string, currency: string) {
	const amount = Number(value);

	if (Number.isNaN(amount)) {
		return `${currency} ${value}`;
	}

	return new Intl.NumberFormat('en', {
		style: 'currency',
		currency,
		maximumFractionDigits: 0,
	}).format(amount);
}
