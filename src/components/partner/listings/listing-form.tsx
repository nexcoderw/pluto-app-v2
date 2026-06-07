"use client";

import {
	type ChangeEvent,
	type FormEvent,
	type ReactNode,
	useEffect,
	useMemo,
	useState,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getCountries } from "libphonenumber-js";
import {
	ArrowLeft,
	ArrowRight,
	BadgeCheck,
	BedDouble,
	Building2,
	CarFront,
	CheckCircle2,
	CircleDollarSign,
	Clock3,
	DoorOpen,
	FileImage,
	Hotel,
	House,
	Info,
	LoaderCircle,
	MapPin,
	Plus,
	ShieldCheck,
	Store,
	Text,
	UploadCloud,
	UtensilsCrossed,
	X,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useListingOptions } from "@/hooks/use-listing-options";
import type {
	PricingUnit,
	Product,
	ProductCategory,
	ProductImage,
} from "@/services/api/products";
import {
	normalizeAirbnbPropertyType,
	normalizeBedType,
	normalizeCarFuelType,
	normalizeCarTransmission,
	normalizeCurrencyCode,
	normalizeHotelRoomType,
	type ListingAmenityOption,
	type ListingOptionsResponse,
} from "@/services/api/listing-options";
import {
	createListing,
	deleteProductImage,
	updateListing,
	uploadProductImage,
	type CreateListingRequest,
	type UpdateListingRequest,
} from "@/services/api/partner-products";
import { ApiRequestError } from "@/services/api/errors";
import {
	GooglePlacePicker,
	type ListingPlaceValue,
} from "./google-place-picker";
import {
	ListingSaveProgressDialog,
	type ListingSaveProgressState,
} from "./listing-save-progress-dialog";
import styles from "./listing-form.module.css";

type ListingFormMode = "create" | "edit";
type ListingFormValues = {
	category: ProductCategory;
	title: string;
	shortDescription: string;
	description: string;
	city: string;
	country: string;
	locationName: string;
	locationAddress: string;
	locationLatitude: string;
	locationLongitude: string;
	basePrice: string;
	currency: string;
	pricingUnit: PricingUnit;
	amenityIds: string[];
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
	bedrooms: string;
	bathrooms: string;
	kitchens: string;
	livingRooms: string;
	furnished: boolean;
	wifi: boolean;
	parking: boolean;
	floorNumber: string;
	maxGuests: string;
	hasBalcony: boolean;
	hasSecurity: boolean;
	hotelName: string;
	roomType: string;
	bedType: string;
	roomSizeSqm: string;
	breakfastIncluded: boolean;
	checkInTime: string;
	checkOutTime: string;
	roomNumber: string;
	hasAirConditioning: boolean;
	hasPrivateBathroom: boolean;
	houseType: string;
	entirePlace: boolean;
	selfCheckIn: boolean;
	houseRules: string;
	cleaningFee: string;
	allowPets: boolean;
	allowSmoking: boolean;
	allowParties: boolean;
};
type ListingFormErrors = Partial<
	Record<keyof ListingFormValues | "images", string>
>;

const steps = [
	{
		key: "category",
		title: "Listing category",
		description: "Choose the public listings category this listing belongs to.",
		icon: Store,
	},
	{
		key: "story",
		title: "Listing story",
		description: "Customer-facing title, location, and description.",
		icon: Text,
	},
	{
		key: "details",
		title: "Category details",
		description: "Required specifications for the selected listing type.",
		icon: BadgeCheck,
	},
	{
		key: "amenities",
		title: "Amenities",
		description: "Select the useful features customers should see.",
		icon: CheckCircle2,
	},
	{
		key: "location",
		title: "Map location",
		description: "Select the exact Google Maps place customers will visit.",
		icon: MapPin,
	},
	{
		key: "pricing",
		title: "Pricing and media",
		description: "Rates, booking options, and optional images.",
		icon: CircleDollarSign,
	},
] as const;
type ListingFormStepKey = (typeof steps)[number]["key"];

const categoryOptions: Array<{
	value: ProductCategory;
	title: string;
	description: string;
	icon: typeof CarFront;
}> = [
	{
		value: "CAR",
		title: "Car",
		description: "Vehicles for hourly, daily, or weekly rental.",
		icon: CarFront,
	},
	{
		value: "APARTMENT",
		title: "Apartment",
		description: "Serviced or long-stay apartment inventory.",
		icon: Building2,
	},
	{
		value: "HOTEL_ROOM",
		title: "Hotel room",
		description: "Managed rooms inside a hotel or guest house.",
		icon: Hotel,
	},
	{
		value: "AIRBNB_HOUSE",
		title: "Airbnb house",
		description: "Homes, villas, or private stays for short bookings.",
		icon: House,
	},
];

const pricingUnits: Array<{ label: string; value: PricingUnit }> = [
	{ label: "Per hour", value: "HOUR" },
	{ label: "Per day", value: "DAY" },
	{ label: "Per night", value: "NIGHT" },
	{ label: "Per week", value: "WEEK" },
	{ label: "Per month", value: "MONTH" },
];
const maxListingImages = 12;
const maxImageSize = 8 * 1024 * 1024;
const minimumVehicleYear = 2000;
const maximumVehicleYear = new Date().getFullYear();
const imageFileExtensions = [
	".apng",
	".avif",
	".bmp",
	".dib",
	".gif",
	".heic",
	".heif",
	".ico",
	".jfif",
	".jpe",
	".jpeg",
	".jpg",
	".pjp",
	".pjpeg",
	".png",
	".tif",
	".tiff",
	".webp",
] as const;
const imageAccept = ["image/*", ...imageFileExtensions].join(",");
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
const countryOptions = getCountries()
	.map((code) => ({
		code,
		name: regionNames.of(code) ?? code,
	}))
	.sort((first, second) => {
		if (first.code === "RW") return -1;
		if (second.code === "RW") return 1;

		return first.name.localeCompare(second.name);
	});
const initialProgressState: ListingSaveProgressState = {
	phase: "preparing",
	progress: 0,
	mediaCompleted: 0,
	mediaTotal: 0,
};

export function ListingForm({
	mode,
	product,
}: {
	mode: ListingFormMode;
	product?: Product;
}) {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { options: listingOptions } = useListingOptions();
	const [currentStep, setCurrentStep] = useState(0);
	const [values, setValues] = useState<ListingFormValues>(() =>
		createInitialValues(product),
	);
	const [errors, setErrors] = useState<ListingFormErrors>({});
	const [existingImages, setExistingImages] = useState<ProductImage[]>(() =>
		sortImages(product?.images ?? []),
	);
	const [imageFiles, setImageFiles] = useState<File[]>([]);
	const [progressOpen, setProgressOpen] = useState(false);
	const [progressState, setProgressState] =
		useState<ListingSaveProgressState>(initialProgressState);
	const isEdit = mode === "edit" && Boolean(product);
	const mutation = useMutation({
		mutationFn: async () => {
			setProgressState({
				phase: "preparing",
				progress: 8,
				mediaCompleted: 0,
				mediaTotal: imageFiles.length,
			});
			const payload = toListingPayload(values);
			setProgressState({
				phase: "saving",
				progress: 24,
				mediaCompleted: 0,
				mediaTotal: imageFiles.length,
			});
			const response =
				isEdit && product
					? await updateListing(product.id, payload as UpdateListingRequest)
					: await createListing(payload as CreateListingRequest);

			if (imageFiles.length > 0) {
				setProgressState({
					phase: "uploading",
					progress: 48,
					mediaCompleted: 0,
					mediaTotal: imageFiles.length,
				});

				await Promise.all(
					imageFiles.map(async (file, index) => {
						const uploadedImage = await uploadProductImage({
							productId: response.product.id,
							file,
							isCover: index === 0 && existingImages.length === 0,
							sortOrder: existingImages.length + index,
							altText: `${values.title} image ${index + 1}`,
						});

						setProgressState((current) => {
							const nextCompleted = Math.min(
								current.mediaCompleted + 1,
								imageFiles.length,
							);
							const mediaProgress =
								48 + Math.round((nextCompleted / imageFiles.length) * 34);

							return {
								...current,
								phase: "uploading",
								progress: mediaProgress,
								mediaCompleted: nextCompleted,
								mediaTotal: imageFiles.length,
							};
						});

						return uploadedImage;
					}),
				);
			}

			setProgressState({
				phase: "finalizing",
				progress: 92,
				mediaCompleted: imageFiles.length,
				mediaTotal: imageFiles.length,
			});

			return response;
		},
		onSuccess: async (response) => {
			setProgressState({
				phase: "success",
				progress: 100,
				mediaCompleted: imageFiles.length,
				mediaTotal: imageFiles.length,
				message: "Your listing has been saved and prepared for admin review.",
			});
			await queryClient.invalidateQueries({ queryKey: ["partner-products"] });
			toast.success(isEdit ? "Listing updated." : "Listing created.", {
				description: "Your listing has been sent for admin review.",
			});
			await wait(700);
			setProgressOpen(false);
			router.push(`/partner/listings/${response.product.id}`);
		},
		onError: async (error) => {
			const message =
				error instanceof ApiRequestError
					? error.message
					: "The listing could not be saved. Please try again.";

			setProgressState((current) => ({
				...current,
				phase: "error",
				progress: 100,
				message,
			}));
			toast.error("Listing was not saved", {
				description: message,
			});
			await wait(1400);
			setProgressOpen(false);
		},
	});
	const deleteImageMutation = useMutation({
		mutationFn: deleteProductImage,
		onSuccess: async (response) => {
			setExistingImages(sortImages(response.product.images));
			await queryClient.invalidateQueries({ queryKey: ["partner-products"] });
			await queryClient.invalidateQueries({
				queryKey: ["partner-product", response.product.id],
			});
			toast.success("Image deleted.", {
				description: "The listing gallery was updated for review.",
			});
		},
		onError: (error) => {
			const message =
				error instanceof ApiRequestError
					? error.message
					: "The image could not be deleted. Please try again.";

			toast.error("Image was not deleted", {
				description: message,
			});
		},
	});
	const visibleSteps = useMemo(
		() =>
			values.category === "CAR"
				? steps.filter((step) => step.key !== "location")
				: steps,
		[values.category],
	);
	const selectedStep = visibleSteps[currentStep] ?? visibleSteps[0];
	const StepIcon = selectedStep.icon;
	const selectedCategory = categoryOptions.find(
		(category) => category.value === values.category,
	);
	const imageSummary = useMemo(
		() =>
			[`${existingImages.length} current`, `${imageFiles.length} new`].join(
				" / ",
			),
		[existingImages.length, imageFiles.length],
	);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- Product images can change after upload/delete responses and must resync local gallery state.
		setExistingImages(sortImages(product?.images ?? []));
	}, [product?.images]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- Category changes can remove the location step, so the active wizard index must stay in range.
		setCurrentStep((step) => Math.min(step, visibleSteps.length - 1));
	}, [visibleSteps.length]);

	function updateField<K extends keyof ListingFormValues>(
		field: K,
		value: ListingFormValues[K],
	) {
		setValues((current) => ({
			...current,
			[field]: value,
			...(field === "category" && { amenityIds: [] }),
		}));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function goToStep(index: number) {
		if (index <= currentStep || validateStep(currentStep)) {
			setCurrentStep(index);
		}
	}

	function handleNext() {
		if (validateStep(currentStep)) {
			setCurrentStep((step) => Math.min(step + 1, visibleSteps.length - 1));
		}
	}

	function handleFiles(event: ChangeEvent<HTMLInputElement>) {
		const files = Array.from(event.target.files ?? []);
		const remainingSlots = Math.max(
			maxListingImages - existingImages.length - imageFiles.length,
			0,
		);

		if (!remainingSlots) {
			setErrors((current) => ({
				...current,
				images: "A listing can have a maximum of 12 images.",
			}));
			event.target.value = "";
			return;
		}

		const imageFilesOnly = files.filter(
			(file) => isImageFile(file) && file.size <= maxImageSize,
		);

		if (imageFilesOnly.length !== files.length) {
			setErrors((current) => ({
				...current,
				images:
					"Upload image files only, with each file under 8 MB. Video, audio, and documents are not accepted.",
			}));
		}

		if (imageFilesOnly.length > remainingSlots) {
			setErrors((current) => ({
				...current,
				images: `Only ${remainingSlots} more image${
					remainingSlots === 1 ? "" : "s"
				} can be added to this listing.`,
			}));
		}

		setImageFiles((current) => [
			...current,
			...imageFilesOnly.slice(0, remainingSlots),
		]);
		event.target.value = "";
	}

	function removeImage(index: number) {
		setImageFiles((current) =>
			current.filter((_, fileIndex) => fileIndex !== index),
		);
	}

	function deleteExistingImage(image: ProductImage) {
		if (!product || deleteImageMutation.isPending) {
			return;
		}

		deleteImageMutation.mutate({
			productId: product.id,
			imageId: image.id,
		});
	}

	function validateStep(step: number) {
		const nextErrors = validateValues(values, visibleSteps[step]?.key);

		setErrors((current) => ({ ...current, ...nextErrors }));

		return Object.keys(nextErrors).length === 0;
	}

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const nextErrors = validateValues(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			setCurrentStep(getFirstErrorStep(nextErrors, values.category));
			return;
		}

		setProgressState({
			phase: "preparing",
			progress: 4,
			mediaCompleted: 0,
			mediaTotal: imageFiles.length,
		});
		setProgressOpen(true);
		mutation.mutate();
	}

	return (
		<>
			<ListingSaveProgressDialog
				open={progressOpen}
				mode={mode}
				{...progressState}
			/>
			<form className={styles.formShell} onSubmit={handleSubmit}>
				<aside className={styles.stepSidebar} aria-label="Listing form steps">
					<div className={styles.stepIntro}>
						<span>
							<ShieldCheck aria-hidden="true" />
							Review workflow
						</span>
					</div>

					<div className={styles.stepList}>
						{visibleSteps.map((step, index) => {
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
											<CheckCircle2 aria-hidden="true" className="h-5" />
										) : (
											<Icon aria-hidden="true" className="h-5" />
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
							Step {currentStep + 1} of {visibleSteps.length}
						</span>
						<h1>{selectedStep.title}</h1>
						<p>{selectedStep.description}</p>
					</div>

					{selectedStep.key === "category" ? (
						<CategoryStep
							values={values}
							error={errors.category}
							isEdit={isEdit}
							onChange={updateField}
						/>
					) : null}

					{selectedStep.key === "story" ? (
						<ListingStoryStep
							values={values}
							errors={errors}
							listingOptions={listingOptions}
							onChange={updateField}
						/>
					) : null}

					{selectedStep.key === "details" ? (
						<CategoryDetailsStep
							values={values}
							errors={errors}
							listingOptions={listingOptions}
							onChange={updateField}
						/>
					) : null}

					{selectedStep.key === "amenities" ? (
						<AmenitiesStep
							values={values}
							errors={errors}
							listingOptions={listingOptions}
							onChange={updateField}
						/>
					) : null}

					{selectedStep.key === "location" ? (
						<ListingLocationStep
							values={values}
							errors={errors}
							listingOptions={listingOptions}
							onChange={updateField}
						/>
					) : null}

					{selectedStep.key === "pricing" ? (
						<PricingMediaStep
							values={values}
							errors={errors}
							listingOptions={listingOptions}
							selectedCategoryTitle={selectedCategory?.title ?? "Listing"}
							existingImages={existingImages}
							imageFiles={imageFiles}
							imageSummary={imageSummary}
							deletingImageId={deleteImageMutation.variables?.imageId}
							isDeletingImage={deleteImageMutation.isPending}
							onChange={updateField}
							onFiles={handleFiles}
							onDeleteExistingImage={deleteExistingImage}
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
						{currentStep < visibleSteps.length - 1 ? (
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
										{isEdit ? "Save changes" : "Submit listing"}
									</>
								)}
							</Button>
						)}
					</div>
				</section>
			</form>
		</>
	);
}

function CategoryStep({
	values,
	error,
	isEdit,
	onChange,
}: {
	values: ListingFormValues;
	error?: string;
	isEdit: boolean;
	onChange: StepProps["onChange"];
}) {
	return (
		<div className={styles.categoryGrid}>
			{categoryOptions.map((category) => {
				const Icon = category.icon;
				const isActive = values.category === category.value;

				return (
					<button
						key={category.value}
						type="button"
						className={styles.categoryCard}
						data-active={isActive}
						disabled={isEdit}
						onClick={() => onChange("category", category.value)}
					>
						<span>
							<Icon aria-hidden="true" />
						</span>
						<strong>{category.title}</strong>
						<small>{category.description}</small>
						<em>{isActive ? "Selected" : "Choose category"}</em>
					</button>
				);
			})}
			<p className={styles.categoryNote}>
				{isEdit
					? "The category is locked after creation because each listing type uses a different review schema."
					: "Choose carefully. Category cannot be changed after the listing is created."}
			</p>
			{error ? <p className={styles.inlineError}>{error}</p> : null}
		</div>
	);
}

function ListingStoryStep({ values, errors, onChange }: StepProps) {
	const selectedCategory = categoryOptions.find(
		(category) => category.value === values.category,
	);

	return (
		<div className={styles.fieldGrid}>
			<FormField label="Listing title" required error={errors.title}>
				<Input
					value={values.title}
					onChange={(event) => onChange("title", event.target.value)}
					placeholder={getTitlePlaceholder(values.category)}
					icon={<Text aria-hidden="true" />}
					aria-invalid={Boolean(errors.title)}
				/>
			</FormField>
			<FormField label="City" required error={errors.city}>
				<Input
					value={values.city}
					onChange={(event) => onChange("city", event.target.value)}
					placeholder="Kigali"
					icon={<MapPin aria-hidden="true" />}
					aria-invalid={Boolean(errors.city)}
				/>
			</FormField>
			<FormField label="Country" required error={errors.country}>
				<CountrySelect
					value={values.country}
					error={errors.country}
					onChange={(country) => onChange("country", country)}
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
					onChange={(event) => onChange("shortDescription", event.target.value)}
					placeholder={`${selectedCategory?.title ?? "Listing"} summary for customer search results.`}
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
					onChange={(event) => onChange("description", event.target.value)}
					placeholder="Describe the customer experience, arrival details, included services, house rules, and important booking notes."
					className={styles.textarea}
					aria-invalid={Boolean(errors.description)}
				/>
			</FormField>
		</div>
	);
}

function CategoryDetailsStep({
	values,
	errors,
	listingOptions,
	onChange,
}: StepProps) {
	if (values.category === "APARTMENT") {
		return (
			<ApartmentStep
				values={values}
				errors={errors}
				listingOptions={listingOptions}
				onChange={onChange}
			/>
		);
	}

	if (values.category === "HOTEL_ROOM") {
		return (
			<HotelRoomStep
				values={values}
				errors={errors}
				listingOptions={listingOptions}
				onChange={onChange}
			/>
		);
	}

	if (values.category === "AIRBNB_HOUSE") {
		return (
			<AirbnbHouseStep
				values={values}
				errors={errors}
				listingOptions={listingOptions}
				onChange={onChange}
			/>
		);
	}

	return (
		<VehicleStep
			values={values}
			errors={errors}
			listingOptions={listingOptions}
			onChange={onChange}
		/>
	);
}

function AmenitiesStep({ values, listingOptions, onChange }: StepProps) {
	const amenities = listingOptions.amenities?.[values.category] ?? [];
	const selectedAmenityIds = new Set(values.amenityIds);
	const groupedAmenities = groupAmenitiesByGroup(amenities);
	const selectedCategory = categoryOptions.find(
		(category) => category.value === values.category,
	);

	function toggleAmenity(amenityId: string) {
		const nextAmenityIds = selectedAmenityIds.has(amenityId)
			? values.amenityIds.filter((selectedAmenityId) => selectedAmenityId !== amenityId)
			: [...values.amenityIds, amenityId];

		onChange("amenityIds", nextAmenityIds);
	}

	if (!amenities.length) {
		return (
			<div className={styles.amenitiesStep}>
				<div className={styles.pricingNote}>
					<Info aria-hidden="true" />
					<p>
						<strong>No amenities configured for this category yet</strong>
						<span>
							You can still submit this listing. Amenities will become available
							after the category catalog is seeded.
						</span>
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.amenitiesStep}>
			<div className={styles.amenitiesSummary}>
				<span>
					<CheckCircle2 aria-hidden="true" />
					{selectedCategory?.title ?? "Listing"} amenities
				</span>
				<strong>{values.amenityIds.length} selected</strong>
			</div>

			<div className={styles.amenityGroupList}>
				{groupedAmenities.map((group) => (
					<section className={styles.amenityGroup} key={group.name}>
						<header className={styles.amenityGroupHeader}>
							<div>
								<strong>{group.name}</strong>
								<small>{group.items.length} options</small>
							</div>
						</header>

						<div className={styles.amenityOptionGrid}>
							{group.items.map((amenity) => {
								const isSelected = selectedAmenityIds.has(amenity.id);

								return (
									<button
										key={amenity.id}
										type="button"
										className={styles.amenityOption}
										data-selected={isSelected}
										onClick={() => toggleAmenity(amenity.id)}
									>
										<span>
											<CheckCircle2 aria-hidden="true" />
										</span>
										<strong>{amenity.name}</strong>
										{amenity.description ? (
											<small>{amenity.description}</small>
										) : null}
									</button>
								);
							})}
						</div>
					</section>
				))}
			</div>
		</div>
	);
}

function ListingLocationStep({ values, errors, onChange }: StepProps) {
	const selectedPlace: ListingPlaceValue = {
		name: values.locationName,
		address: values.locationAddress,
		latitude: values.locationLatitude,
		longitude: values.locationLongitude,
		city: values.city,
		country: values.country,
	};

	return (
		<div className={styles.locationStep}>
			<div className={styles.pricingNote}>
				<MapPin aria-hidden="true" />
				<p>
					<strong>Select the exact customer arrival point</strong>
					<span>
						Search with Google Places, then choose the correct suggestion. Pluto
						Booking stores the selected latitude and longitude for this listing.
					</span>
				</p>
			</div>
			<GooglePlacePicker
				value={selectedPlace}
				error={
					errors.locationAddress ??
					errors.locationLatitude ??
					errors.locationLongitude
				}
				onChange={(place) => {
					onChange("locationName", place.name);
					onChange("locationAddress", place.address);
					onChange("locationLatitude", place.latitude);
					onChange("locationLongitude", place.longitude);
					if (place.city) onChange("city", place.city);
					if (place.country) onChange("country", place.country);
				}}
			/>
		</div>
	);
}

function VehicleStep({ values, errors, listingOptions, onChange }: StepProps) {
	return (
		<div className={styles.fieldGrid}>
			<FormField label="Brand" required error={errors.brand}>
				<Input
					value={values.brand}
					onChange={(event) => onChange("brand", event.target.value)}
					placeholder="Toyota"
					icon={<CarFront aria-hidden="true" />}
					aria-invalid={Boolean(errors.brand)}
				/>
			</FormField>
			<FormField label="Model" required error={errors.model}>
				<Input
					value={values.model}
					onChange={(event) => onChange("model", event.target.value)}
					placeholder="RAV4"
					icon={<CarFront aria-hidden="true" />}
					aria-invalid={Boolean(errors.model)}
				/>
			</FormField>
			<FormField label="Year" required error={errors.year}>
				<Select
					value={values.year}
					onValueChange={(value) => {
						if (value) onChange("year", value);
					}}
				>
					<SelectTrigger
						className={styles.selectTrigger}
						aria-invalid={Boolean(errors.year)}
					>
						<SelectValue>
							<CarFront aria-hidden="true" />
							{values.year || "Select year"}
						</SelectValue>
					</SelectTrigger>
					<SelectContent align="start" alignItemWithTrigger={false}>
						{listingOptions.years.map((year) => (
							<SelectItem key={year} value={String(year)}>
								{year}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</FormField>
			<FormField label="Plate number" optional error={errors.plateNumber}>
				<Input
					value={values.plateNumber}
					onChange={(event) => onChange("plateNumber", event.target.value)}
					placeholder="RAC123A"
					icon={<CarFront aria-hidden="true" />}
					aria-invalid={Boolean(errors.plateNumber)}
				/>
			</FormField>
			<FormField label="Transmission" required error={errors.transmission}>
				<Select
					value={values.transmission}
					onValueChange={(value) => {
						if (value) onChange("transmission", value);
					}}
				>
					<SelectTrigger
						className={styles.selectTrigger}
						aria-invalid={Boolean(errors.transmission)}
					>
						<SelectValue>
							<CarFront aria-hidden="true" />
							{getOptionLabel(
								listingOptions.cars.transmissions,
								values.transmission,
								"Transmission",
							)}
						</SelectValue>
					</SelectTrigger>
					<SelectContent align="start" alignItemWithTrigger={false}>
						{listingOptions.cars.transmissions.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</FormField>
			<FormField label="Fuel type" required error={errors.fuelType}>
				<Select
					value={values.fuelType}
					onValueChange={(value) => {
						if (value) onChange("fuelType", value);
					}}
				>
					<SelectTrigger
						className={styles.selectTrigger}
						aria-invalid={Boolean(errors.fuelType)}
					>
						<SelectValue>
							<CarFront aria-hidden="true" />
							{getOptionLabel(
								listingOptions.cars.fuelTypes,
								values.fuelType,
								"Fuel type",
							)}
						</SelectValue>
					</SelectTrigger>
					<SelectContent align="start" alignItemWithTrigger={false}>
						{listingOptions.cars.fuelTypes.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</FormField>
			<FormField label="Seats" required error={errors.seats}>
				<Select
					value={values.seats}
					onValueChange={(value) => {
						if (value) onChange("seats", value);
					}}
				>
					<SelectTrigger
						className={styles.selectTrigger}
						aria-invalid={Boolean(errors.seats)}
					>
						<SelectValue>
							<CarFront aria-hidden="true" />
							{values.seats ? `${values.seats} seats` : "Seats"}
						</SelectValue>
					</SelectTrigger>
					<SelectContent align="start" alignItemWithTrigger={false}>
						{listingOptions.cars.seats.map((option) => (
							<SelectItem key={option.value} value={String(option.value)}>
								{option.label} seats
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</FormField>
			<FormField label="Doors" required error={errors.doors}>
				<Select
					value={values.doors}
					onValueChange={(value) => {
						if (value) onChange("doors", value);
					}}
				>
					<SelectTrigger
						className={styles.selectTrigger}
						aria-invalid={Boolean(errors.doors)}
					>
						<SelectValue>
							<CarFront aria-hidden="true" />
							{values.doors ? `${values.doors} doors` : "Doors"}
						</SelectValue>
					</SelectTrigger>
					<SelectContent align="start" alignItemWithTrigger={false}>
						{listingOptions.numbers.doors.map((option) => (
							<SelectItem key={option.value} value={String(option.value)}>
								{option.label} doors
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</FormField>
		</div>
	);
}

function ApartmentStep({
	values,
	errors,
	listingOptions,
	onChange,
}: StepProps) {
	return (
		<div className={styles.fieldGrid}>
			<FormField label="Bedrooms" required error={errors.bedrooms}>
				<NumberOptionSelect
					value={values.bedrooms}
					options={listingOptions.numbers.bedrooms}
					placeholder="Bedrooms"
					icon={<BedDouble aria-hidden="true" />}
					aria-invalid={Boolean(errors.bedrooms)}
					onChange={(value) => onChange("bedrooms", value)}
				/>
			</FormField>
			<FormField label="Bathrooms" required error={errors.bathrooms}>
				<NumberOptionSelect
					value={values.bathrooms}
					options={listingOptions.numbers.bathrooms}
					placeholder="Bathrooms"
					icon={<DoorOpen aria-hidden="true" />}
					aria-invalid={Boolean(errors.bathrooms)}
					onChange={(value) => onChange("bathrooms", value)}
				/>
			</FormField>
			<FormField label="Maximum guests" required error={errors.maxGuests}>
				<NumberOptionSelect
					value={values.maxGuests}
					options={listingOptions.numbers.guests}
					placeholder="Maximum guests"
					icon={<Building2 aria-hidden="true" />}
					aria-invalid={Boolean(errors.maxGuests)}
					onChange={(value) => onChange("maxGuests", value)}
				/>
			</FormField>
			<FormField label="Floor number" optional error={errors.floorNumber}>
				<Input
					type="number"
					value={values.floorNumber}
					onChange={(event) => onChange("floorNumber", event.target.value)}
					placeholder="3"
					icon={<Building2 aria-hidden="true" />}
					aria-invalid={Boolean(errors.floorNumber)}
				/>
			</FormField>
			<FormField label="Kitchens" optional error={errors.kitchens}>
				<NumberOptionSelect
					value={values.kitchens}
					options={listingOptions.numbers.oneToTenPlus}
					placeholder="Kitchens"
					icon={<UtensilsCrossed aria-hidden="true" />}
					aria-invalid={Boolean(errors.kitchens)}
					onChange={(value) => onChange("kitchens", value)}
				/>
			</FormField>
			<FormField label="Living rooms" optional error={errors.livingRooms}>
				<NumberOptionSelect
					value={values.livingRooms}
					options={listingOptions.numbers.oneToTenPlus}
					placeholder="Living rooms"
					icon={<House aria-hidden="true" />}
					aria-invalid={Boolean(errors.livingRooms)}
					onChange={(value) => onChange("livingRooms", value)}
				/>
			</FormField>
			<div className={styles.toggleGrid}>
				<ToggleField
					label="Furnished"
					checked={values.furnished}
					onChange={(checked) => onChange("furnished", checked)}
				/>
				<ToggleField
					label="Wi-Fi"
					checked={values.wifi}
					onChange={(checked) => onChange("wifi", checked)}
				/>
				<ToggleField
					label="Parking"
					checked={values.parking}
					onChange={(checked) => onChange("parking", checked)}
				/>
				<ToggleField
					label="Balcony"
					checked={values.hasBalcony}
					onChange={(checked) => onChange("hasBalcony", checked)}
				/>
				<ToggleField
					label="Security"
					checked={values.hasSecurity}
					onChange={(checked) => onChange("hasSecurity", checked)}
				/>
			</div>
		</div>
	);
}

function HotelRoomStep({
	values,
	errors,
	listingOptions,
	onChange,
}: StepProps) {
	return (
		<div className={styles.fieldGrid}>
			<FormField label="Hotel name" required error={errors.hotelName}>
				<Input
					value={values.hotelName}
					onChange={(event) => onChange("hotelName", event.target.value)}
					placeholder="Pluto Suites Kigali"
					icon={<Hotel aria-hidden="true" />}
					aria-invalid={Boolean(errors.hotelName)}
				/>
			</FormField>
			<FormField label="Room type" required error={errors.roomType}>
				<Select
					value={values.roomType}
					onValueChange={(value) => {
						if (value) onChange("roomType", value);
					}}
				>
					<SelectTrigger
						className={styles.selectTrigger}
						aria-invalid={Boolean(errors.roomType)}
					>
						<SelectValue>
							<DoorOpen aria-hidden="true" />
							{getOptionLabel(
								listingOptions.hotelRooms.roomTypes,
								values.roomType,
								"Room type",
							)}
						</SelectValue>
					</SelectTrigger>
					<SelectContent align="start" alignItemWithTrigger={false}>
						{listingOptions.hotelRooms.roomTypes.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</FormField>
			<FormField label="Bed type" required error={errors.bedType}>
				<Select
					value={values.bedType}
					onValueChange={(value) => {
						if (value) onChange("bedType", value);
					}}
				>
					<SelectTrigger
						className={styles.selectTrigger}
						aria-invalid={Boolean(errors.bedType)}
					>
						<SelectValue>
							<BedDouble aria-hidden="true" />
							{getOptionLabel(
								listingOptions.hotelRooms.bedTypes,
								values.bedType,
								"Bed type",
							)}
						</SelectValue>
					</SelectTrigger>
					<SelectContent align="start" alignItemWithTrigger={false}>
						{listingOptions.hotelRooms.bedTypes.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</FormField>
			<FormField label="Maximum guests" required error={errors.maxGuests}>
				<NumberOptionSelect
					value={values.maxGuests}
					options={listingOptions.numbers.guests}
					placeholder="Maximum guests"
					icon={<Hotel aria-hidden="true" />}
					aria-invalid={Boolean(errors.maxGuests)}
					onChange={(value) => onChange("maxGuests", value)}
				/>
			</FormField>
			<FormField label="Check-in time" required error={errors.checkInTime}>
				<Input
					value={values.checkInTime}
					onChange={(event) => onChange("checkInTime", event.target.value)}
					placeholder="14:00"
					icon={<Clock3 aria-hidden="true" />}
					aria-invalid={Boolean(errors.checkInTime)}
				/>
			</FormField>
			<FormField label="Check-out time" required error={errors.checkOutTime}>
				<Input
					value={values.checkOutTime}
					onChange={(event) => onChange("checkOutTime", event.target.value)}
					placeholder="11:00"
					icon={<Clock3 aria-hidden="true" />}
					aria-invalid={Boolean(errors.checkOutTime)}
				/>
			</FormField>
			<FormField label="Room size" optional error={errors.roomSizeSqm}>
				<Input
					type="number"
					value={values.roomSizeSqm}
					onChange={(event) => onChange("roomSizeSqm", event.target.value)}
					placeholder="32"
					icon={<Hotel aria-hidden="true" />}
					aria-invalid={Boolean(errors.roomSizeSqm)}
				/>
			</FormField>
			<FormField label="Room number" optional error={errors.roomNumber}>
				<Input
					value={values.roomNumber}
					onChange={(event) => onChange("roomNumber", event.target.value)}
					placeholder="204"
					icon={<DoorOpen aria-hidden="true" />}
					aria-invalid={Boolean(errors.roomNumber)}
				/>
			</FormField>
			<div className={styles.toggleGrid}>
				<ToggleField
					label="Breakfast"
					checked={values.breakfastIncluded}
					onChange={(checked) => onChange("breakfastIncluded", checked)}
				/>
				<ToggleField
					label="Air conditioning"
					checked={values.hasAirConditioning}
					onChange={(checked) => onChange("hasAirConditioning", checked)}
				/>
				<ToggleField
					label="Private bathroom"
					checked={values.hasPrivateBathroom}
					onChange={(checked) => onChange("hasPrivateBathroom", checked)}
				/>
			</div>
		</div>
	);
}

function AirbnbHouseStep({
	values,
	errors,
	listingOptions,
	onChange,
}: StepProps) {
	return (
		<div className={styles.fieldGrid}>
			<FormField label="House type" required error={errors.houseType}>
				<Select
					value={values.houseType}
					onValueChange={(value) => {
						if (value) onChange("houseType", value);
					}}
				>
					<SelectTrigger
						className={styles.selectTrigger}
						aria-invalid={Boolean(errors.houseType)}
					>
						<SelectValue>
							<House aria-hidden="true" />
							{getOptionLabel(
								listingOptions.airbnb.propertyTypes,
								values.houseType,
								"House type",
							)}
						</SelectValue>
					</SelectTrigger>
					<SelectContent align="start" alignItemWithTrigger={false}>
						{listingOptions.airbnb.propertyTypes.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</FormField>
			<FormField label="Bedrooms" required error={errors.bedrooms}>
				<NumberOptionSelect
					value={values.bedrooms}
					options={listingOptions.numbers.bedrooms}
					placeholder="Bedrooms"
					icon={<BedDouble aria-hidden="true" />}
					aria-invalid={Boolean(errors.bedrooms)}
					onChange={(value) => onChange("bedrooms", value)}
				/>
			</FormField>
			<FormField label="Bathrooms" required error={errors.bathrooms}>
				<NumberOptionSelect
					value={values.bathrooms}
					options={listingOptions.numbers.bathrooms}
					placeholder="Bathrooms"
					icon={<DoorOpen aria-hidden="true" />}
					aria-invalid={Boolean(errors.bathrooms)}
					onChange={(value) => onChange("bathrooms", value)}
				/>
			</FormField>
			<FormField label="Maximum guests" required error={errors.maxGuests}>
				<NumberOptionSelect
					value={values.maxGuests}
					options={listingOptions.numbers.guests}
					placeholder="Maximum guests"
					icon={<House aria-hidden="true" />}
					aria-invalid={Boolean(errors.maxGuests)}
					onChange={(value) => onChange("maxGuests", value)}
				/>
			</FormField>
			<FormField label="Cleaning fee" optional error={errors.cleaningFee}>
				<Input
					inputMode="decimal"
					value={values.cleaningFee}
					onChange={(event) => onChange("cleaningFee", event.target.value)}
					placeholder="15000.00"
					icon={<CircleDollarSign aria-hidden="true" />}
					aria-invalid={Boolean(errors.cleaningFee)}
				/>
			</FormField>
			<FormField label="House rules" optional error={errors.houseRules} wide>
				<Textarea
					value={values.houseRules}
					onChange={(event) => onChange("houseRules", event.target.value)}
					placeholder="Add quiet hours, visitor rules, smoking policy, and check-out expectations."
					className={styles.textarea}
					aria-invalid={Boolean(errors.houseRules)}
				/>
			</FormField>
			<div className={styles.toggleGrid}>
				<ToggleField
					label="Entire place"
					checked={values.entirePlace}
					onChange={(checked) => onChange("entirePlace", checked)}
				/>
				<ToggleField
					label="Self check-in"
					checked={values.selfCheckIn}
					onChange={(checked) => onChange("selfCheckIn", checked)}
				/>
				<ToggleField
					label="Pets allowed"
					checked={values.allowPets}
					onChange={(checked) => onChange("allowPets", checked)}
				/>
				<ToggleField
					label="Smoking allowed"
					checked={values.allowSmoking}
					onChange={(checked) => onChange("allowSmoking", checked)}
				/>
				<ToggleField
					label="Parties allowed"
					checked={values.allowParties}
					onChange={(checked) => onChange("allowParties", checked)}
				/>
			</div>
		</div>
	);
}

function PricingMediaStep({
	values,
	errors,
	listingOptions,
	selectedCategoryTitle,
	existingImages,
	imageFiles,
	imageSummary,
	deletingImageId,
	isDeletingImage,
	onChange,
	onFiles,
	onDeleteExistingImage,
	onRemoveImage,
}: StepProps & {
	selectedCategoryTitle: string;
	existingImages: ProductImage[];
	imageFiles: File[];
	imageSummary: string;
	deletingImageId?: string;
	isDeletingImage: boolean;
	onFiles: (event: ChangeEvent<HTMLInputElement>) => void;
	onDeleteExistingImage: (image: ProductImage) => void;
	onRemoveImage: (index: number) => void;
}) {
	return (
		<div className={styles.fieldGrid}>
			<FormField label="Base price" required error={errors.basePrice}>
				<Input
					inputMode="decimal"
					value={values.basePrice}
					onChange={(event) => onChange("basePrice", event.target.value)}
					placeholder="45000.00"
					icon={<CircleDollarSign aria-hidden="true" />}
					aria-invalid={Boolean(errors.basePrice)}
				/>
			</FormField>
			<FormField label="Currency" optional error={errors.currency}>
				<Select
					value={values.currency}
					onValueChange={(value) => {
						if (value) onChange("currency", value);
					}}
				>
					<SelectTrigger
						className={styles.selectTrigger}
						aria-invalid={Boolean(errors.currency)}
					>
						<SelectValue>
							<CircleDollarSign aria-hidden="true" />
							{getOptionLabel(
								listingOptions.currencies,
								values.currency,
								"Currency",
							)}
						</SelectValue>
					</SelectTrigger>
					<SelectContent align="start" alignItemWithTrigger={false}>
						{listingOptions.currencies.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</FormField>
			<FormField label="Pricing unit" required error={errors.pricingUnit}>
				<Select
					value={values.pricingUnit}
					onValueChange={(value) =>
						onChange("pricingUnit", value as PricingUnit)
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

			{values.category === "CAR" ? (
				<>
					<FormField
						label="Luggage capacity"
						optional
						error={errors.luggageCapacity}
					>
						<Input
							type="number"
							value={values.luggageCapacity}
							onChange={(event) =>
								onChange("luggageCapacity", event.target.value)
							}
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
								onChange("mileageLimitPerDay", event.target.value)
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
							onChange={(event) =>
								onChange("minimumDriverAge", event.target.value)
							}
							placeholder="23"
							icon={<ShieldCheck aria-hidden="true" />}
							aria-invalid={Boolean(errors.minimumDriverAge)}
						/>
					</FormField>

					<div className={styles.toggleGrid}>
						<ToggleField
							label="Air conditioning"
							checked={values.airConditioning}
							onChange={(checked) => onChange("airConditioning", checked)}
						/>
						<ToggleField
							label="Driver included"
							checked={values.driverIncluded}
							onChange={(checked) => onChange("driverIncluded", checked)}
						/>
						<ToggleField
							label="Insurance included"
							checked={values.insuranceIncluded}
							onChange={(checked) => onChange("insuranceIncluded", checked)}
						/>
						<ToggleField
							label="Requires deposit"
							checked={values.requiresDeposit}
							onChange={(checked) => onChange("requiresDeposit", checked)}
						/>
					</div>
				</>
			) : (
				<div className={styles.pricingNote}>
					<BadgeCheck aria-hidden="true" />
					<p>
						<strong>{selectedCategoryTitle} pricing</strong>
						<span>
							Use the pricing unit that matches how customers will book this
							listing. Media uploaded here is attached to the selected category
							and sent for admin review.
						</span>
					</p>
				</div>
			)}

			{values.category === "CAR" && values.requiresDeposit ? (
				<FormField label="Deposit amount" required error={errors.depositAmount}>
					<Input
						inputMode="decimal"
						value={values.depositAmount}
						onChange={(event) => onChange("depositAmount", event.target.value)}
						placeholder="100000.00"
						icon={<CircleDollarSign aria-hidden="true" />}
						aria-invalid={Boolean(errors.depositAmount)}
					/>
				</FormField>
			) : null}

			{existingImages.length ? (
				<div className={styles.currentImages}>
					<div className={styles.mediaSectionHeader}>
						<span>
							<FileImage aria-hidden="true" />
							Current gallery
						</span>
						<small>
							Delete images you no longer want customers or admins to review.
						</small>
					</div>
					<ul aria-label="Current listing images">
						{existingImages.map((image) => {
							const isDeleting =
								isDeletingImage && deletingImageId === image.id;

							return (
								<li key={image.id}>
									{image.file.publicUrl ? (
										<Image
											src={image.file.publicUrl}
											alt={image.altText ?? image.file.originalName}
											width={64}
											height={64}
											unoptimized
										/>
									) : (
										<span className={styles.imagePlaceholder}>
											<FileImage aria-hidden="true" />
										</span>
									)}
									<div>
										<strong>
											{image.isCover ? "Cover image" : image.file.originalName}
										</strong>
										<small>
											{image.file.storageProvider === "CLOUDINARY"
												? "Cloudinary image"
												: "Legacy local image"}
										</small>
									</div>
									<button
										type="button"
										disabled={isDeletingImage}
										onClick={() => onDeleteExistingImage(image)}
										aria-label={`Delete ${image.file.originalName}`}
									>
										{isDeleting ? (
											<LoaderCircle
												className={styles.spinner}
												aria-hidden="true"
											/>
										) : (
											<X aria-hidden="true" />
										)}
									</button>
								</li>
							);
						})}
					</ul>
				</div>
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
	listingOptions: ListingOptionsResponse;
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
				<em>{required ? "Required" : optional ? "Optional" : null}</em>
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

function NumberOptionSelect({
	value,
	options,
	placeholder,
	icon,
	"aria-invalid": ariaInvalid,
	onChange,
}: {
	value: string;
	options: ListingOptionsResponse["numbers"]["oneToTenPlus"];
	placeholder: string;
	icon: ReactNode;
	"aria-invalid"?: boolean;
	onChange: (value: string) => void;
}) {
	return (
		<Select
			value={value}
			onValueChange={(nextValue) => {
				if (nextValue) onChange(nextValue);
			}}
		>
			<SelectTrigger
				className={styles.selectTrigger}
				aria-invalid={ariaInvalid}
			>
				<SelectValue>
					{icon}
					{value ? getNumericOptionLabel(options, value) : placeholder}
				</SelectValue>
			</SelectTrigger>
			<SelectContent align="start" alignItemWithTrigger={false}>
				{options.map((option) => (
					<SelectItem key={option.value} value={String(option.value)}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

function getNumericOptionLabel(
	options: ListingOptionsResponse["numbers"]["oneToTenPlus"],
	value: string,
) {
	return (
		options.find((option) => String(option.value) === value)?.label ?? value
	);
}

function getOptionLabel(
	options: ReadonlyArray<{ value: string; label: string }>,
	value: string,
	fallback: string,
) {
	return options.find((option) => option.value === value)?.label ?? fallback;
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
		countryOptions.find((country) => country.code === "RW") ??
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
	const apartment = product?.apartmentDetails;
	const hotelRoom = product?.hotelRoomDetails;
	const airbnb = product?.airbnbDetails;
	const location = product?.location;

	return {
		category: product?.category ?? "CAR",
		title: product?.title ?? "",
		shortDescription: product?.shortDescription ?? "",
		description: product?.description ?? "",
		city: product?.city ?? "Kigali",
		country: product?.country ?? "Rwanda",
		locationName: location?.name ?? "",
		locationAddress: location?.addressLine ?? "",
		locationLatitude: location?.latitude ?? "",
		locationLongitude: location?.longitude ?? "",
		basePrice: product?.basePrice ?? "",
		currency: product?.currency ?? "RWF",
		pricingUnit: product?.pricingUnit ?? "DAY",
		amenityIds:
			product?.amenities?.map((productAmenity) => productAmenity.amenity.id) ??
			[],
		brand: car?.brand ?? "",
		model: car?.model ?? "",
		year: car?.year ? String(car.year) : "",
		plateNumber: car?.plateNumber ?? "",
		transmission: car?.transmission ?? "AUTOMATIC",
		fuelType: car?.fuelType ?? "PETROL",
		seats: car?.seats ? String(car.seats) : "",
		doors: car?.doors ? String(car.doors) : "",
		luggageCapacity: car?.luggageCapacity ? String(car.luggageCapacity) : "",
		airConditioning: car?.airConditioning ?? false,
		driverIncluded: car?.driverIncluded ?? false,
		insuranceIncluded: car?.insuranceIncluded ?? false,
		mileageLimitPerDay: car?.mileageLimitPerDay
			? String(car.mileageLimitPerDay)
			: "",
		minimumDriverAge: car?.minimumDriverAge ? String(car.minimumDriverAge) : "",
		requiresDeposit: car?.requiresDeposit ?? false,
		depositAmount: car?.depositAmount ?? "",
		bedrooms:
			apartment?.bedrooms || airbnb?.bedrooms
				? String(apartment?.bedrooms ?? airbnb?.bedrooms)
				: "",
		bathrooms:
			apartment?.bathrooms || airbnb?.bathrooms
				? String(apartment?.bathrooms ?? airbnb?.bathrooms)
				: "",
		kitchens: apartment?.kitchens ? String(apartment.kitchens) : "1",
		livingRooms: apartment?.livingRooms ? String(apartment.livingRooms) : "1",
		furnished: apartment?.furnished ?? false,
		wifi: apartment?.wifi ?? false,
		parking: apartment?.parking ?? false,
		floorNumber: apartment?.floorNumber ? String(apartment.floorNumber) : "",
		maxGuests:
			apartment?.maxGuests || hotelRoom?.maxGuests || airbnb?.maxGuests
				? String(
						apartment?.maxGuests ?? hotelRoom?.maxGuests ?? airbnb?.maxGuests,
					)
				: "",
		hasBalcony: apartment?.hasBalcony ?? false,
		hasSecurity: apartment?.hasSecurity ?? false,
		hotelName: hotelRoom?.hotelName ?? "",
		roomType: hotelRoom?.roomType ?? "",
		bedType: hotelRoom?.bedType ?? "",
		roomSizeSqm: hotelRoom?.roomSizeSqm ? String(hotelRoom.roomSizeSqm) : "",
		breakfastIncluded: hotelRoom?.breakfastIncluded ?? false,
		checkInTime: hotelRoom?.checkInTime ?? "14:00",
		checkOutTime: hotelRoom?.checkOutTime ?? "11:00",
		roomNumber: hotelRoom?.roomNumber ?? "",
		hasAirConditioning: hotelRoom?.hasAirConditioning ?? false,
		hasPrivateBathroom: hotelRoom?.hasPrivateBathroom ?? true,
		houseType: airbnb?.houseType ?? "",
		entirePlace: airbnb?.entirePlace ?? true,
		selfCheckIn: airbnb?.selfCheckIn ?? false,
		houseRules: airbnb?.houseRules ?? "",
		cleaningFee: airbnb?.cleaningFee ?? "",
		allowPets: airbnb?.allowPets ?? false,
		allowSmoking: airbnb?.allowSmoking ?? false,
		allowParties: airbnb?.allowParties ?? false,
	};
}

function validateValues(
	values: ListingFormValues,
	step?: ListingFormStepKey,
): ListingFormErrors {
	const errors: ListingFormErrors = {};
	const shouldValidate = (targetStep: ListingFormStepKey) =>
		step === undefined || step === targetStep;

	if (shouldValidate("category")) {
		if (!values.category) errors.category = "Choose a listing category.";
	}

	if (shouldValidate("story")) {
		if (values.title.trim().length < 4)
			errors.title = "Title must be at least 4 characters.";
		if (values.description.trim().length < 30)
			errors.description = "Description must be at least 30 characters.";
		if (values.shortDescription && values.shortDescription.length > 220)
			errors.shortDescription =
				"Short description must stay under 220 characters.";
		if (values.city.trim().length < 2) errors.city = "City is required.";
		if (!values.country.trim()) errors.country = "Country is required.";
	}

	if (shouldValidate("details")) {
		if (values.category === "CAR") {
			if (values.brand.trim().length < 2) errors.brand = "Brand is required.";
			if (!values.model.trim()) errors.model = "Model is required.";
			if (!isNumberInRange(values.year, minimumVehicleYear, maximumVehicleYear))
				errors.year = `Enter a valid year between ${minimumVehicleYear} and ${maximumVehicleYear}.`;
			if (values.transmission.trim().length < 3)
				errors.transmission = "Transmission is required.";
			if (values.fuelType.trim().length < 3)
				errors.fuelType = "Fuel type is required.";
			if (!isNumberInRange(values.seats, 1, 60))
				errors.seats = "Enter the number of seats.";
			if (!isNumberInRange(values.doors, 1, 8))
				errors.doors = "Enter the number of doors.";
		}

		if (values.category === "APARTMENT") {
			if (!isNumberInRange(values.bedrooms, 0, 30))
				errors.bedrooms = "Enter the number of bedrooms.";
			if (!isNumberInRange(values.bathrooms, 1, 30))
				errors.bathrooms = "Enter the number of bathrooms.";
			if (!isNumberInRange(values.maxGuests, 1, 100))
				errors.maxGuests = "Enter the guest capacity.";
			if (values.kitchens && !isNumberInRange(values.kitchens, 0, 10))
				errors.kitchens = "Kitchens must be between 0 and 10.";
			if (values.livingRooms && !isNumberInRange(values.livingRooms, 0, 10))
				errors.livingRooms = "Living rooms must be between 0 and 10.";
			if (values.floorNumber && !isNumberInRange(values.floorNumber, -5, 200))
				errors.floorNumber = "Enter a valid floor number.";
		}

		if (values.category === "HOTEL_ROOM") {
			if (values.hotelName.trim().length < 2)
				errors.hotelName = "Hotel name is required.";
			if (values.roomType.trim().length < 2)
				errors.roomType = "Room type is required.";
			if (values.bedType.trim().length < 2)
				errors.bedType = "Bed type is required.";
			if (!isNumberInRange(values.maxGuests, 1, 100))
				errors.maxGuests = "Enter the guest capacity.";
			if (values.checkInTime.trim().length < 4)
				errors.checkInTime = "Check-in time is required.";
			if (values.checkOutTime.trim().length < 4)
				errors.checkOutTime = "Check-out time is required.";
			if (values.roomSizeSqm && !isNumberInRange(values.roomSizeSqm, 1, 1000))
				errors.roomSizeSqm = "Room size must be between 1 and 1000 sqm.";
		}

		if (values.category === "AIRBNB_HOUSE") {
			if (values.houseType.trim().length < 2)
				errors.houseType = "House type is required.";
			if (!isNumberInRange(values.bedrooms, 1, 30))
				errors.bedrooms = "Enter the number of bedrooms.";
			if (!isNumberInRange(values.bathrooms, 1, 30))
				errors.bathrooms = "Enter the number of bathrooms.";
			if (!isNumberInRange(values.maxGuests, 1, 100))
				errors.maxGuests = "Enter the guest capacity.";
			if (values.cleaningFee && !isPositiveDecimal(values.cleaningFee))
				errors.cleaningFee = "Cleaning fee must be a positive amount.";
			if (values.houseRules.length > 1200)
				errors.houseRules = "House rules must stay under 1,200 characters.";
		}
	}

	if (shouldValidate("location") && values.category !== "CAR") {
		if (!values.locationName.trim() && !values.locationAddress.trim())
			errors.locationAddress = "Select a Google Maps place for this listing.";
		if (!isValidCoordinate(values.locationLatitude, -90, 90))
			errors.locationLatitude = "Select a place with a valid latitude.";
		if (!isValidCoordinate(values.locationLongitude, -180, 180))
			errors.locationLongitude = "Select a place with a valid longitude.";
	}

	if (shouldValidate("pricing")) {
		if (!isPositiveDecimal(values.basePrice))
			errors.basePrice = "Base price must be a valid positive amount.";
		if (!values.currency.trim()) errors.currency = "Currency is required.";
		if (values.category === "CAR") {
			if (
				values.luggageCapacity &&
				!isNumberInRange(values.luggageCapacity, 0, 20)
			)
				errors.luggageCapacity = "Luggage capacity must be between 0 and 20.";
			if (
				values.mileageLimitPerDay &&
				!isNumberInRange(values.mileageLimitPerDay, 0, 5000)
			)
				errors.mileageLimitPerDay = "Mileage limit must be between 0 and 5000.";
			if (
				values.minimumDriverAge &&
				!isNumberInRange(values.minimumDriverAge, 18, 80)
			)
				errors.minimumDriverAge =
					"Minimum driver age must be between 18 and 80.";
			if (values.requiresDeposit && !isPositiveDecimal(values.depositAmount))
				errors.depositAmount =
					"Deposit amount is required when deposits are enabled.";
		}
	}

	return errors;
}

function getFirstErrorStep(
	errors: ListingFormErrors,
	category: ProductCategory,
) {
	if (errors.category) return 0;

	const stepOneFields = [
		"title",
		"description",
		"shortDescription",
		"city",
		"country",
	];
	const stepTwoFields = [
		"brand",
		"model",
		"year",
		"transmission",
		"fuelType",
		"seats",
		"doors",
		"bedrooms",
		"bathrooms",
		"kitchens",
		"livingRooms",
		"floorNumber",
		"maxGuests",
		"hotelName",
		"roomType",
		"bedType",
		"roomSizeSqm",
		"checkInTime",
		"checkOutTime",
		"roomNumber",
		"houseType",
		"houseRules",
		"cleaningFee",
	];
	const locationFields = [
		"locationName",
		"locationAddress",
		"locationLatitude",
		"locationLongitude",
	];
	const pricingStep = category === "CAR" ? 4 : 5;

	if (Object.keys(errors).some((key) => stepOneFields.includes(key))) return 1;
	if (Object.keys(errors).some((key) => stepTwoFields.includes(key))) return 2;
	if (
		category !== "CAR" &&
		Object.keys(errors).some((key) => locationFields.includes(key))
	)
		return 3;

	return pricingStep;
}

function toListingPayload(values: ListingFormValues) {
	const basePayload = {
		category: values.category,
		title: values.title.trim(),
		description: values.description.trim(),
		shortDescription: values.shortDescription.trim() || undefined,
		city: values.city.trim(),
		country: values.country.trim() || "Rwanda",
		basePrice: values.basePrice.trim(),
		currency: normalizeCurrencyCode(values.currency),
		pricingUnit: values.pricingUnit,
		amenityIds: values.amenityIds,
	};

	if (values.category === "APARTMENT") {
		return {
			...basePayload,
			...toLocationPayload(values),
			bedrooms: Number(values.bedrooms),
			bathrooms: Number(values.bathrooms),
			kitchens: optionalNumber(values.kitchens),
			livingRooms: optionalNumber(values.livingRooms),
			furnished: values.furnished,
			wifi: values.wifi,
			parking: values.parking,
			floorNumber: optionalNumber(values.floorNumber),
			maxGuests: Number(values.maxGuests),
			hasBalcony: values.hasBalcony,
			hasSecurity: values.hasSecurity,
		};
	}

	if (values.category === "HOTEL_ROOM") {
		return {
			...basePayload,
			...toLocationPayload(values),
			hotelName: values.hotelName.trim(),
			roomType: normalizeHotelRoomType(values.roomType),
			bedType: normalizeBedType(values.bedType),
			roomSizeSqm: optionalNumber(values.roomSizeSqm),
			breakfastIncluded: values.breakfastIncluded,
			checkInTime: values.checkInTime.trim(),
			checkOutTime: values.checkOutTime.trim(),
			maxGuests: Number(values.maxGuests),
			roomNumber: values.roomNumber.trim() || undefined,
			hasAirConditioning: values.hasAirConditioning,
			hasPrivateBathroom: values.hasPrivateBathroom,
		};
	}

	if (values.category === "AIRBNB_HOUSE") {
		return {
			...basePayload,
			...toLocationPayload(values),
			houseType: normalizeAirbnbPropertyType(values.houseType),
			entirePlace: values.entirePlace,
			selfCheckIn: values.selfCheckIn,
			houseRules: values.houseRules.trim() || undefined,
			cleaningFee: values.cleaningFee.trim() || undefined,
			bedrooms: Number(values.bedrooms),
			bathrooms: Number(values.bathrooms),
			maxGuests: Number(values.maxGuests),
			allowPets: values.allowPets,
			allowSmoking: values.allowSmoking,
			allowParties: values.allowParties,
		};
	}

	return {
		...basePayload,
		brand: values.brand.trim(),
		model: values.model.trim(),
		year: Number(values.year),
		plateNumber: values.plateNumber.trim() || undefined,
		transmission: normalizeCarTransmission(values.transmission),
		fuelType: normalizeCarFuelType(values.fuelType),
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

function toLocationPayload(values: ListingFormValues) {
	return {
		locationName: values.locationName.trim() || undefined,
		locationAddress: values.locationAddress.trim() || undefined,
		locationLatitude: Number(values.locationLatitude),
		locationLongitude: Number(values.locationLongitude),
	};
}

function getTitlePlaceholder(category: ProductCategory) {
	switch (category) {
		case "APARTMENT":
			return "Furnished two-bedroom apartment in Kigali";
		case "HOTEL_ROOM":
			return "Deluxe queen room at Pluto Suites";
		case "AIRBNB_HOUSE":
			return "Private villa with garden near Kigali Heights";
		case "CAR":
		default:
			return "Toyota RAV4 for Kigali trips";
	}
}

function optionalNumber(value: string) {
	return value.trim() ? Number(value) : undefined;
}

function groupAmenitiesByGroup(amenities: ListingAmenityOption[]) {
	const groups = new Map<string, ListingAmenityOption[]>();

	for (const amenity of amenities) {
		const group = amenity.group ?? "General";
		groups.set(group, [...(groups.get(group) ?? []), amenity]);
	}

	return Array.from(groups.entries())
		.map(([name, items]) => ({
			name,
			items: [...items].sort((first, second) => {
				if (first.sortOrder !== second.sortOrder) {
					return first.sortOrder - second.sortOrder;
				}

				return first.name.localeCompare(second.name);
			}),
		}))
		.sort((first, second) => first.name.localeCompare(second.name));
}

function isNumberInRange(value: string, min: number, max: number) {
	const number = Number(value);

	return Number.isInteger(number) && number >= min && number <= max;
}

function isPositiveDecimal(value: string) {
	const number = Number(value);

	return Number.isFinite(number) && number > 0;
}

function isValidCoordinate(value: string, min: number, max: number) {
	const number = Number(value);

	return Number.isFinite(number) && number >= min && number <= max;
}

function formatFileSize(size: number) {
	if (size < 1024 * 1024) {
		return `${Math.max(1, Math.round(size / 1024))} KB`;
	}

	return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function isImageFile(file: File) {
	if (file.type.startsWith("image/")) {
		return true;
	}

	const fileName = file.name.toLowerCase();

	return imageFileExtensions.some((extension) => fileName.endsWith(extension));
}

function sortImages(images: ProductImage[]) {
	return [...images].sort((first, second) => {
		if (first.isCover !== second.isCover) {
			return first.isCover ? -1 : 1;
		}

		return first.sortOrder - second.sortOrder;
	});
}

function wait(milliseconds: number) {
	return new Promise((resolve) => {
		window.setTimeout(resolve, milliseconds);
	});
}
