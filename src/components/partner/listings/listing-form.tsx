'use client';

import {
	type ChangeEvent,
	type FormEvent,
	type ReactNode,
	useMemo,
	useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { getCountries } from 'libphonenumber-js';
import {
	ArrowLeft,
	ArrowRight,
	BadgeCheck,
	CarFront,
	CheckCircle2,
	CircleDollarSign,
	FileImage,
	Info,
	LoaderCircle,
	MapPin,
	Plus,
	ShieldCheck,
	Text,
	UploadCloud,
	X,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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
import { Textarea } from '@/components/ui/textarea';
import type { PricingUnit, Product } from '@/services/api/products';
import {
	createListing,
	updateListing,
	uploadProductImage,
	type CreateListingRequest,
	type UpdateListingRequest,
} from '@/services/api/partner-products';
import { ApiRequestError } from '@/services/api/errors';
import styles from './listing-form.module.css';

type ListingFormMode = 'create' | 'edit';
type ListingFormValues = {
	title: string;
	shortDescription: string;
	description: string;
	city: string;
	country: string;
	basePrice: string;
	currency: string;
	pricingUnit: PricingUnit;
	brand: string;
	model: string;
	year: string;
	plateNumber: string;
	transmission: string;
	fuelType: string;
	seats: string;
	doors: string;
	luggageCapacity: string;
	airConditioning: boolean;
	driverIncluded: boolean;
	insuranceIncluded: boolean;
	mileageLimitPerDay: string;
	minimumDriverAge: string;
	requiresDeposit: boolean;
	depositAmount: string;
};
type ListingFormErrors = Partial<
	Record<keyof ListingFormValues | 'images', string>
>;

const steps = [
	{
		key: 'story',
		title: 'Listing story',
		description: 'Customer-facing title, location, and description.',
		icon: Text,
	},
	{
		key: 'vehicle',
		title: 'Vehicle details',
		description: 'Technical details customers need before booking.',
		icon: CarFront,
	},
	{
		key: 'pricing',
		title: 'Pricing and media',
		description: 'Rates, booking options, and optional images.',
		icon: CircleDollarSign,
	},
] as const;

const pricingUnits: Array<{ label: string; value: PricingUnit }> = [
	{ label: 'Per hour', value: 'HOUR' },
	{ label: 'Per day', value: 'DAY' },
	{ label: 'Per night', value: 'NIGHT' },
	{ label: 'Per week', value: 'WEEK' },
	{ label: 'Per month', value: 'MONTH' },
];
const maxImageSize = 8 * 1024 * 1024;
const imageFileExtensions = [
	'.apng',
	'.avif',
	'.bmp',
	'.dib',
	'.gif',
	'.heic',
	'.heif',
	'.ico',
	'.jfif',
	'.jpe',
	'.jpeg',
	'.jpg',
	'.pjp',
	'.pjpeg',
	'.png',
	'.tif',
	'.tiff',
	'.webp',
] as const;
const imageAccept = ['image/*', ...imageFileExtensions].join(',');
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
const countryOptions = getCountries()
	.map((code) => ({
		code,
		name: regionNames.of(code) ?? code,
	}))
	.sort((first, second) => {
		if (first.code === 'RW') return -1;
		if (second.code === 'RW') return 1;

		return first.name.localeCompare(second.name);
	});

export function ListingForm({
	mode,
	product,
}: {
	mode: ListingFormMode;
	product?: Product;
}) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const [currentStep, setCurrentStep] = useState(0);
	const [values, setValues] = useState<ListingFormValues>(() =>
		createInitialValues(product),
	);
	const [errors, setErrors] = useState<ListingFormErrors>({});
	const [imageFiles, setImageFiles] = useState<File[]>([]);
	const isEdit = mode === 'edit' && Boolean(product);
	const mutation = useMutation({
		mutationFn: async () => {
			const payload = toListingPayload(values);
			const response =
				isEdit && product
					? await updateListing(product.id, payload as UpdateListingRequest)
					: await createListing({
							...payload,
							category: 'CAR',
						} as CreateListingRequest);

			for (const [index, file] of imageFiles.entries()) {
				await uploadProductImage({
					productId: response.product.id,
					file,
					isCover: index === 0 && response.product.images.length === 0,
					sortOrder: response.product.images.length + index,
					altText: `${values.title} image ${index + 1}`,
				});
			}

			return response;
		},
		onSuccess: async (response) => {
			await queryClient.invalidateQueries({ queryKey: ['partner-products'] });
			toast.success(isEdit ? 'Listing updated.' : 'Listing created.', {
				description: 'Your listing has been sent for admin review.',
			});
			router.push(`/partner/listings/${response.product.id}`);
		},
		onError: (error) => {
			const message =
				error instanceof ApiRequestError
					? error.message
					: 'The listing could not be saved. Please try again.';

			toast.error('Listing was not saved', {
				description: message,
			});
		},
	});
	const selectedStep = steps[currentStep];
	const StepIcon = selectedStep.icon;
	const imageSummary = useMemo(
		() =>
			imageFiles.length
				? `${imageFiles.length} new image${imageFiles.length === 1 ? '' : 's'} selected`
				: 'Images are optional, but strong photos speed up review.',
		[imageFiles.length],
	);

	function updateField<K extends keyof ListingFormValues>(
		field: K,
		value: ListingFormValues[K],
	) {
		setValues((current) => ({ ...current, [field]: value }));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function goToStep(index: number) {
		if (index <= currentStep || validateStep(currentStep)) {
			setCurrentStep(index);
		}
	}

	function handleNext() {
		if (validateStep(currentStep)) {
			setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
		}
	}

	function handleFiles(event: ChangeEvent<HTMLInputElement>) {
		const files = Array.from(event.target.files ?? []);
		const imageFilesOnly = files.filter(
			(file) => isImageFile(file) && file.size <= maxImageSize,
		);

		if (imageFilesOnly.length !== files.length) {
			setErrors((current) => ({
				...current,
				images:
					'Upload image files only, with each file under 8 MB. Video, audio, and documents are not accepted.',
			}));
		}

		setImageFiles((current) => [...current, ...imageFilesOnly].slice(0, 8));
		event.target.value = '';
	}

	function removeImage(index: number) {
		setImageFiles((current) =>
			current.filter((_, fileIndex) => fileIndex !== index),
		);
	}

	function validateStep(step: number) {
		const nextErrors = validateValues(values, step);

		setErrors((current) => ({ ...current, ...nextErrors }));

		return Object.keys(nextErrors).length === 0;
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const nextErrors = validateValues(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			setCurrentStep(getFirstErrorStep(nextErrors));
			return;
		}

		mutation.mutate();
	}

	return (
		<form className={styles.formShell} onSubmit={handleSubmit}>
			<aside className={styles.stepSidebar} aria-label="Listing form steps">
				<div className={styles.stepIntro}>
					<span>
						<ShieldCheck aria-hidden="true" />
						Review workflow
					</span>
					<h2>{isEdit ? 'Update listing' : 'Create listing'}</h2>
					<p>
						Every saved change returns the listing to admin review before it
						reaches customers.
					</p>
				</div>

				<div className={styles.stepList}>
					{steps.map((step, index) => {
						const Icon = step.icon;

						return (
							<button
								key={step.key}
								type="button"
								data-active={index === currentStep}
								data-complete={index < currentStep}
								onClick={() => goToStep(index)}
							>
								<span>
									{index < currentStep ? (
										<CheckCircle2 aria-hidden="true" />
									) : (
										<Icon aria-hidden="true" />
									)}
								</span>
								<strong>{step.title}</strong>
								<small>{step.description}</small>
							</button>
						);
					})}
				</div>
			</aside>

			<section className={styles.formPanel}>
				<div className={styles.formHeader}>
					<span>
						<StepIcon aria-hidden="true" />
						Step {currentStep + 1} of {steps.length}
					</span>
					<h1>{selectedStep.title}</h1>
					<p>{selectedStep.description}</p>
				</div>

				{currentStep === 0 ? (
					<ListingStoryStep
						values={values}
						errors={errors}
						onChange={updateField}
					/>
				) : null}

				{currentStep === 1 ? (
					<VehicleStep values={values} errors={errors} onChange={updateField} />
				) : null}

				{currentStep === 2 ? (
					<PricingMediaStep
						values={values}
						errors={errors}
						imageFiles={imageFiles}
						imageSummary={imageSummary}
						onChange={updateField}
						onFiles={handleFiles}
						onRemoveImage={removeImage}
					/>
				) : null}

				<div className={styles.formActions}>
					<Button
						type="button"
						variant="outline"
						disabled={currentStep === 0 || mutation.isPending}
						onClick={() => setCurrentStep((step) => Math.max(step - 1, 0))}
					>
						<ArrowLeft aria-hidden="true" />
						Back
					</Button>
					{currentStep < steps.length - 1 ? (
						<Button type="button" onClick={handleNext}>
							Next
							<ArrowRight aria-hidden="true" />
						</Button>
					) : (
						<Button type="submit" disabled={mutation.isPending}>
							{mutation.isPending ? (
								<LoaderCircle className={styles.spinner} aria-hidden="true" />
							) : (
								<>
									<BadgeCheck aria-hidden="true" />
									{isEdit ? 'Save changes' : 'Submit listing'}
								</>
							)}
						</Button>
					)}
				</div>
			</section>
		</form>
	);
}

function ListingStoryStep({ values, errors, onChange }: StepProps) {
	return (
		<div className={styles.fieldGrid}>
			<FormField label="Listing title" required error={errors.title}>
				<Input
					value={values.title}
					onChange={(event) => onChange('title', event.target.value)}
					placeholder="Toyota RAV4 for Kigali trips"
					icon={<Text aria-hidden="true" />}
					aria-invalid={Boolean(errors.title)}
				/>
			</FormField>
			<FormField label="City" required error={errors.city}>
				<Input
					value={values.city}
					onChange={(event) => onChange('city', event.target.value)}
					placeholder="Kigali"
					icon={<MapPin aria-hidden="true" />}
					aria-invalid={Boolean(errors.city)}
				/>
			</FormField>
			<FormField label="Country" required error={errors.country}>
				<CountrySelect
					value={values.country}
					error={errors.country}
					onChange={(country) => onChange('country', country)}
				/>
			</FormField>
			<FormField
				label="Short description"
				optional
				error={errors.shortDescription}
				wide
			>
				<Input
					value={values.shortDescription}
					onChange={(event) => onChange('shortDescription', event.target.value)}
					placeholder="Comfortable SUV with flexible daily pricing."
					icon={<Info aria-hidden="true" />}
					aria-invalid={Boolean(errors.shortDescription)}
				/>
			</FormField>
			<FormField
				label="Full description"
				required
				error={errors.description}
				wide
			>
				<Textarea
					value={values.description}
					onChange={(event) => onChange('description', event.target.value)}
					placeholder="Describe the customer experience, pickup details, included services, and important booking notes."
					className={styles.textarea}
					aria-invalid={Boolean(errors.description)}
				/>
			</FormField>
		</div>
	);
}

function VehicleStep({ values, errors, onChange }: StepProps) {
	return (
		<div className={styles.fieldGrid}>
			<FormField label="Brand" required error={errors.brand}>
				<Input
					value={values.brand}
					onChange={(event) => onChange('brand', event.target.value)}
					placeholder="Toyota"
					icon={<CarFront aria-hidden="true" />}
					aria-invalid={Boolean(errors.brand)}
				/>
			</FormField>
			<FormField label="Model" required error={errors.model}>
				<Input
					value={values.model}
					onChange={(event) => onChange('model', event.target.value)}
					placeholder="RAV4"
					icon={<CarFront aria-hidden="true" />}
					aria-invalid={Boolean(errors.model)}
				/>
			</FormField>
			<FormField label="Year" required error={errors.year}>
				<Input
					type="number"
					value={values.year}
					onChange={(event) => onChange('year', event.target.value)}
					placeholder="2022"
					icon={<CarFront aria-hidden="true" />}
					aria-invalid={Boolean(errors.year)}
				/>
			</FormField>
			<FormField label="Plate number" optional error={errors.plateNumber}>
				<Input
					value={values.plateNumber}
					onChange={(event) => onChange('plateNumber', event.target.value)}
					placeholder="RAC123A"
					icon={<CarFront aria-hidden="true" />}
					aria-invalid={Boolean(errors.plateNumber)}
				/>
			</FormField>
			<FormField label="Transmission" required error={errors.transmission}>
				<Input
					value={values.transmission}
					onChange={(event) => onChange('transmission', event.target.value)}
					placeholder="Automatic"
					icon={<CarFront aria-hidden="true" />}
					aria-invalid={Boolean(errors.transmission)}
				/>
			</FormField>
			<FormField label="Fuel type" required error={errors.fuelType}>
				<Input
					value={values.fuelType}
					onChange={(event) => onChange('fuelType', event.target.value)}
					placeholder="Petrol"
					icon={<CarFront aria-hidden="true" />}
					aria-invalid={Boolean(errors.fuelType)}
				/>
			</FormField>
			<FormField label="Seats" required error={errors.seats}>
				<Input
					type="number"
					value={values.seats}
					onChange={(event) => onChange('seats', event.target.value)}
					placeholder="5"
					icon={<CarFront aria-hidden="true" />}
					aria-invalid={Boolean(errors.seats)}
				/>
			</FormField>
			<FormField label="Doors" required error={errors.doors}>
				<Input
					type="number"
					value={values.doors}
					onChange={(event) => onChange('doors', event.target.value)}
					placeholder="4"
					icon={<CarFront aria-hidden="true" />}
					aria-invalid={Boolean(errors.doors)}
				/>
			</FormField>
		</div>
	);
}

function PricingMediaStep({
	values,
	errors,
	imageFiles,
	imageSummary,
	onChange,
	onFiles,
	onRemoveImage,
}: StepProps & {
	imageFiles: File[];
	imageSummary: string;
	onFiles: (event: ChangeEvent<HTMLInputElement>) => void;
	onRemoveImage: (index: number) => void;
}) {
	return (
		<div className={styles.fieldGrid}>
			<FormField label="Base price" required error={errors.basePrice}>
				<Input
					inputMode="decimal"
					value={values.basePrice}
					onChange={(event) => onChange('basePrice', event.target.value)}
					placeholder="45000.00"
					icon={<CircleDollarSign aria-hidden="true" />}
					aria-invalid={Boolean(errors.basePrice)}
				/>
			</FormField>
			<FormField label="Currency" optional error={errors.currency}>
				<Input
					value={values.currency}
					onChange={(event) => onChange('currency', event.target.value)}
					placeholder="RWF"
					icon={<CircleDollarSign aria-hidden="true" />}
					aria-invalid={Boolean(errors.currency)}
				/>
			</FormField>
			<FormField label="Pricing unit" required error={errors.pricingUnit}>
				<Select
					value={values.pricingUnit}
					onValueChange={(value) =>
						onChange('pricingUnit', value as PricingUnit)
					}
				>
					<SelectTrigger
						className={styles.selectTrigger}
						aria-invalid={Boolean(errors.pricingUnit)}
					>
						<SelectValue>
							<CircleDollarSign aria-hidden="true" />
							{
								pricingUnits.find((unit) => unit.value === values.pricingUnit)
									?.label
							}
						</SelectValue>
					</SelectTrigger>
					<SelectContent align="start" alignItemWithTrigger={false}>
						{pricingUnits.map((unit) => (
							<SelectItem key={unit.value} value={unit.value}>
								{unit.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</FormField>
			<FormField
				label="Luggage capacity"
				optional
				error={errors.luggageCapacity}
			>
				<Input
					type="number"
					value={values.luggageCapacity}
					onChange={(event) => onChange('luggageCapacity', event.target.value)}
					placeholder="3"
					icon={<CarFront aria-hidden="true" />}
					aria-invalid={Boolean(errors.luggageCapacity)}
				/>
			</FormField>
			<FormField
				label="Mileage limit per day"
				optional
				error={errors.mileageLimitPerDay}
			>
				<Input
					type="number"
					value={values.mileageLimitPerDay}
					onChange={(event) =>
						onChange('mileageLimitPerDay', event.target.value)
					}
					placeholder="200"
					icon={<CarFront aria-hidden="true" />}
					aria-invalid={Boolean(errors.mileageLimitPerDay)}
				/>
			</FormField>
			<FormField
				label="Minimum driver age"
				optional
				error={errors.minimumDriverAge}
			>
				<Input
					type="number"
					value={values.minimumDriverAge}
					onChange={(event) => onChange('minimumDriverAge', event.target.value)}
					placeholder="23"
					icon={<ShieldCheck aria-hidden="true" />}
					aria-invalid={Boolean(errors.minimumDriverAge)}
				/>
			</FormField>

			<div className={styles.toggleGrid}>
				<ToggleField
					label="Air conditioning"
					checked={values.airConditioning}
					onChange={(checked) => onChange('airConditioning', checked)}
				/>
				<ToggleField
					label="Driver included"
					checked={values.driverIncluded}
					onChange={(checked) => onChange('driverIncluded', checked)}
				/>
				<ToggleField
					label="Insurance included"
					checked={values.insuranceIncluded}
					onChange={(checked) => onChange('insuranceIncluded', checked)}
				/>
				<ToggleField
					label="Requires deposit"
					checked={values.requiresDeposit}
					onChange={(checked) => onChange('requiresDeposit', checked)}
				/>
			</div>

			{values.requiresDeposit ? (
				<FormField label="Deposit amount" required error={errors.depositAmount}>
					<Input
						inputMode="decimal"
						value={values.depositAmount}
						onChange={(event) => onChange('depositAmount', event.target.value)}
						placeholder="100000.00"
						icon={<CircleDollarSign aria-hidden="true" />}
						aria-invalid={Boolean(errors.depositAmount)}
					/>
				</FormField>
			) : null}

			<div className={styles.dropzone} data-invalid={Boolean(errors.images)}>
				<input
					id="listing-images"
					type="file"
					accept={imageAccept}
					multiple
					onChange={onFiles}
				/>
				<label htmlFor="listing-images">
					<UploadCloud aria-hidden="true" />
					<strong>Upload listing images</strong>
					<span>{imageSummary}</span>
				</label>
				{errors.images ? <small>{errors.images}</small> : null}
			</div>

			{imageFiles.length ? (
				<ul className={styles.fileList} aria-label="Selected images">
					{imageFiles.map((file, index) => (
						<li key={`${file.name}-${index}`}>
							<FileImage aria-hidden="true" />
							<span>
								<strong>{file.name}</strong>
								<small>{formatFileSize(file.size)}</small>
							</span>
							<button
								type="button"
								onClick={() => onRemoveImage(index)}
								aria-label={`Remove ${file.name}`}
							>
								<X aria-hidden="true" />
							</button>
						</li>
					))}
				</ul>
			) : null}
		</div>
	);
}

type StepProps = {
	values: ListingFormValues;
	errors: ListingFormErrors;
	onChange: <K extends keyof ListingFormValues>(
		field: K,
		value: ListingFormValues[K],
	) => void;
};

function FormField({
	label,
	required,
	optional,
	error,
	wide,
	children,
}: {
	label: string;
	required?: boolean;
	optional?: boolean;
	error?: string;
	wide?: boolean;
	children: ReactNode;
}) {
	return (
		<div className={styles.fieldGroup} data-wide={wide}>
			<Label>
				<span>{label}</span>
				<em>{required ? 'Required' : optional ? 'Optional' : null}</em>
			</Label>
			{children}
			{error ? <p className={styles.inlineError}>{error}</p> : null}
		</div>
	);
}

function ToggleField({
	label,
	checked,
	onChange,
}: {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}) {
	return (
		<button
			type="button"
			className={styles.toggleField}
			data-active={checked}
			aria-pressed={checked}
			onClick={() => onChange(!checked)}
		>
			<span>
				<Plus aria-hidden="true" />
			</span>
			{label}
		</button>
	);
}

function CountrySelect({
	value,
	error,
	onChange,
}: {
	value: string;
	error?: string;
	onChange: (country: string) => void;
}) {
	const selectedCountry =
		countryOptions.find((country) => country.name === value) ??
		countryOptions.find((country) => country.code === 'RW') ??
		countryOptions[0];

	return (
		<Select
			value={selectedCountry.name}
			onValueChange={(country) => {
				if (country) {
					onChange(country);
				}
			}}
		>
			<SelectTrigger
				className={styles.selectTrigger}
				aria-label="Listing country"
				aria-invalid={Boolean(error)}
			>
				<SelectValue>
					<MapPin aria-hidden="true" />
					{selectedCountry.name}
				</SelectValue>
			</SelectTrigger>
			<SelectContent
				className={styles.countryMenu}
				align="start"
				alignItemWithTrigger={false}
			>
				{countryOptions.map((country) => (
					<SelectItem key={country.code} value={country.name}>
						<span className={styles.countryOption}>
							<strong>{country.name}</strong>
							<small>{country.code}</small>
						</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

function createInitialValues(product?: Product): ListingFormValues {
	const car = product?.carDetails;

	return {
		title: product?.title ?? '',
		shortDescription: product?.shortDescription ?? '',
		description: product?.description ?? '',
		city: product?.city ?? 'Kigali',
		country: product?.country ?? 'Rwanda',
		basePrice: product?.basePrice ?? '',
		currency: product?.currency ?? 'RWF',
		pricingUnit: product?.pricingUnit ?? 'DAY',
		brand: car?.brand ?? '',
		model: car?.model ?? '',
		year: car?.year ? String(car.year) : '',
		plateNumber: car?.plateNumber ?? '',
		transmission: car?.transmission ?? 'Automatic',
		fuelType: car?.fuelType ?? 'Petrol',
		seats: car?.seats ? String(car.seats) : '',
		doors: car?.doors ? String(car.doors) : '',
		luggageCapacity: car?.luggageCapacity ? String(car.luggageCapacity) : '',
		airConditioning: car?.airConditioning ?? false,
		driverIncluded: car?.driverIncluded ?? false,
		insuranceIncluded: car?.insuranceIncluded ?? false,
		mileageLimitPerDay: car?.mileageLimitPerDay
			? String(car.mileageLimitPerDay)
			: '',
		minimumDriverAge: car?.minimumDriverAge ? String(car.minimumDriverAge) : '',
		requiresDeposit: car?.requiresDeposit ?? false,
		depositAmount: car?.depositAmount ?? '',
	};
}

function validateValues(
	values: ListingFormValues,
	step?: number,
): ListingFormErrors {
	const errors: ListingFormErrors = {};
	const shouldValidate = (targetStep: number) =>
		step === undefined || step === targetStep;

	if (shouldValidate(0)) {
		if (values.title.trim().length < 4)
			errors.title = 'Title must be at least 4 characters.';
		if (values.description.trim().length < 30)
			errors.description = 'Description must be at least 30 characters.';
		if (values.shortDescription && values.shortDescription.length > 220)
			errors.shortDescription =
				'Short description must stay under 220 characters.';
		if (values.city.trim().length < 2) errors.city = 'City is required.';
		if (!values.country.trim()) errors.country = 'Country is required.';
	}

	if (shouldValidate(1)) {
		if (values.brand.trim().length < 2) errors.brand = 'Brand is required.';
		if (!values.model.trim()) errors.model = 'Model is required.';
		if (!isNumberInRange(values.year, 1990, 2035))
			errors.year = 'Enter a valid year between 1990 and 2035.';
		if (values.transmission.trim().length < 3)
			errors.transmission = 'Transmission is required.';
		if (values.fuelType.trim().length < 3)
			errors.fuelType = 'Fuel type is required.';
		if (!isNumberInRange(values.seats, 1, 60))
			errors.seats = 'Enter the number of seats.';
		if (!isNumberInRange(values.doors, 1, 8))
			errors.doors = 'Enter the number of doors.';
	}

	if (shouldValidate(2)) {
		if (!isPositiveDecimal(values.basePrice))
			errors.basePrice = 'Base price must be a valid positive amount.';
		if (!values.currency.trim()) errors.currency = 'Currency is required.';
		if (
			values.luggageCapacity &&
			!isNumberInRange(values.luggageCapacity, 0, 20)
		)
			errors.luggageCapacity = 'Luggage capacity must be between 0 and 20.';
		if (
			values.mileageLimitPerDay &&
			!isNumberInRange(values.mileageLimitPerDay, 0, 5000)
		)
			errors.mileageLimitPerDay = 'Mileage limit must be between 0 and 5000.';
		if (
			values.minimumDriverAge &&
			!isNumberInRange(values.minimumDriverAge, 18, 80)
		)
			errors.minimumDriverAge = 'Minimum driver age must be between 18 and 80.';
		if (values.requiresDeposit && !isPositiveDecimal(values.depositAmount))
			errors.depositAmount =
				'Deposit amount is required when deposits are enabled.';
	}

	return errors;
}

function getFirstErrorStep(errors: ListingFormErrors) {
	const stepOneFields = [
		'title',
		'description',
		'shortDescription',
		'city',
		'country',
	];
	const stepTwoFields = [
		'brand',
		'model',
		'year',
		'transmission',
		'fuelType',
		'seats',
		'doors',
	];

	if (Object.keys(errors).some((key) => stepOneFields.includes(key))) return 0;
	if (Object.keys(errors).some((key) => stepTwoFields.includes(key))) return 1;

	return 2;
}

function toListingPayload(values: ListingFormValues) {
	return {
		title: values.title.trim(),
		description: values.description.trim(),
		shortDescription: values.shortDescription.trim() || undefined,
		city: values.city.trim(),
		country: values.country.trim() || 'Rwanda',
		basePrice: values.basePrice.trim(),
		currency: values.currency.trim().toUpperCase() || 'RWF',
		pricingUnit: values.pricingUnit,
		brand: values.brand.trim(),
		model: values.model.trim(),
		year: Number(values.year),
		plateNumber: values.plateNumber.trim() || undefined,
		transmission: values.transmission.trim(),
		fuelType: values.fuelType.trim(),
		seats: Number(values.seats),
		doors: Number(values.doors),
		luggageCapacity: optionalNumber(values.luggageCapacity),
		airConditioning: values.airConditioning,
		driverIncluded: values.driverIncluded,
		insuranceIncluded: values.insuranceIncluded,
		mileageLimitPerDay: optionalNumber(values.mileageLimitPerDay),
		minimumDriverAge: optionalNumber(values.minimumDriverAge),
		requiresDeposit: values.requiresDeposit,
		depositAmount: values.requiresDeposit
			? values.depositAmount.trim()
			: undefined,
	};
}

function optionalNumber(value: string) {
	return value.trim() ? Number(value) : undefined;
}

function isNumberInRange(value: string, min: number, max: number) {
	const number = Number(value);

	return Number.isInteger(number) && number >= min && number <= max;
}

function isPositiveDecimal(value: string) {
	const number = Number(value);

	return Number.isFinite(number) && number > 0;
}

function formatFileSize(size: number) {
	if (size < 1024 * 1024) {
		return `${Math.max(1, Math.round(size / 1024))} KB`;
	}

	return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function isImageFile(file: File) {
	if (file.type.startsWith('image/')) {
		return true;
	}

	const fileName = file.name.toLowerCase();

	return imageFileExtensions.some((extension) => fileName.endsWith(extension));
}
