"use client";

import {
	type ChangeEvent,
	type FormEvent,
	type ReactNode,
	useEffect,
	useMemo,
	useState,
} from "react";
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
import type {
	PricingUnit,
	Product,
	ProductCategory,
	ProductImage,
} from "@/services/api/products";
import {
	createListing,
	deleteProductImage,
	updateListing,
	uploadProductImage,
	type CreateListingRequest,
	type UpdateListingRequest,
} from "@/services/api/partner-products";
import { ApiRequestError } from "@/services/api/errors";
import styles from "./listing-form.module.css";

type ListingFormMode = "create" | "edit";
type ListingFormValues = {
	category: ProductCategory;
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
		key: "pricing",
		title: "Pricing and media",
		description: "Rates, booking options, and optional images.",
		icon: CircleDollarSign,
	},
] as const;

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
const maxImageSize = 8 * 1024 * 1024;
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
	const [existingImages, setExistingImages] = useState<ProductImage[]>(() =>
		sortImages(product?.images ?? []),
	);
	const [imageFiles, setImageFiles] = useState<File[]>([]);
	const isEdit = mode === "edit" && Boolean(product);
	const mutation = useMutation({
		mutationFn: async () => {
			const payload = toListingPayload(values);
			const response =
				isEdit && product
					? await updateListing(product.id, payload as UpdateListingRequest)
					: await createListing(payload as CreateListingRequest);

			for (const [index, file] of imageFiles.entries()) {
				await uploadProductImage({
					productId: response.product.id,
					file,
					isCover: index === 0 && existingImages.length === 0,
					sortOrder: existingImages.length + index,
					altText: `${values.title} image ${index + 1}`,
				});
			}

			return response;
		},
		onSuccess: async (response) => {
			await queryClient.invalidateQueries({ queryKey: ["partner-products"] });
			toast.success(isEdit ? "Listing updated." : "Listing created.", {
				description: "Your listing has been sent for admin review.",
			});
			router.push(`/partner/listings/${response.product.id}`);
		},
		onError: (error) => {
			const message =
				error instanceof ApiRequestError
					? error.message
					: "The listing could not be saved. Please try again.";

			toast.error("Listing was not saved", {
				description: message,
			});
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
	const selectedStep = steps[currentStep];
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
		setExistingImages(sortImages(product?.images ?? []));
	}, [product?.images]);

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
					"Upload image files only, with each file under 8 MB. Video, audio, and documents are not accepted.",
			}));
		}

		setImageFiles((current) => [...current, ...imageFilesOnly].slice(0, 8));
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
						Step {currentStep + 1} of {steps.length}
					</span>
					<h1>{selectedStep.title}</h1>
					<p>{selectedStep.description}</p>
				</div>

				{currentStep === 0 ? (
					<CategoryStep
						values={values}
						error={errors.category}
						isEdit={isEdit}
						onChange={updateField}
					/>
				) : null}

				{currentStep === 1 ? (
					<ListingStoryStep
						values={values}
						errors={errors}
						onChange={updateField}
					/>
				) : null}

				{currentStep === 2 ? (
					<CategoryDetailsStep
						values={values}
						errors={errors}
						onChange={updateField}
					/>
				) : null}

				{currentStep === 3 ? (
					<PricingMediaStep
						values={values}
						errors={errors}
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
									{isEdit ? "Save changes" : "Submit listing"}
								</>
							)}
						</Button>
					)}
				</div>
			</section>
		</form>
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

function CategoryDetailsStep({ values, errors, onChange }: StepProps) {
	if (values.category === "APARTMENT") {
		return (
			<ApartmentStep values={values} errors={errors} onChange={onChange} />
		);
	}

	if (values.category === "HOTEL_ROOM") {
		return (
			<HotelRoomStep values={values} errors={errors} onChange={onChange} />
		);
	}

	if (values.category === "AIRBNB_HOUSE") {
		return (
			<AirbnbHouseStep values={values} errors={errors} onChange={onChange} />
		);
	}

	return <VehicleStep values={values} errors={errors} onChange={onChange} />;
}

function VehicleStep({ values, errors, onChange }: StepProps) {
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
				<Input
					type="number"
					value={values.year}
					onChange={(event) => onChange("year", event.target.value)}
					placeholder="2022"
					icon={<CarFront aria-hidden="true" />}
					aria-invalid={Boolean(errors.year)}
				/>
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
				<Input
					value={values.transmission}
					onChange={(event) => onChange("transmission", event.target.value)}
					placeholder="Automatic"
					icon={<CarFront aria-hidden="true" />}
					aria-invalid={Boolean(errors.transmission)}
				/>
			</FormField>
			<FormField label="Fuel type" required error={errors.fuelType}>
				<Input
					value={values.fuelType}
					onChange={(event) => onChange("fuelType", event.target.value)}
					placeholder="Petrol"
					icon={<CarFront aria-hidden="true" />}
					aria-invalid={Boolean(errors.fuelType)}
				/>
			</FormField>
			<FormField label="Seats" required error={errors.seats}>
				<Input
					type="number"
					value={values.seats}
					onChange={(event) => onChange("seats", event.target.value)}
					placeholder="5"
					icon={<CarFront aria-hidden="true" />}
					aria-invalid={Boolean(errors.seats)}
				/>
			</FormField>
			<FormField label="Doors" required error={errors.doors}>
				<Input
					type="number"
					value={values.doors}
					onChange={(event) => onChange("doors", event.target.value)}
					placeholder="4"
					icon={<CarFront aria-hidden="true" />}
					aria-invalid={Boolean(errors.doors)}
				/>
			</FormField>
		</div>
	);
}

function ApartmentStep({ values, errors, onChange }: StepProps) {
	return (
		<div className={styles.fieldGrid}>
			<FormField label="Bedrooms" required error={errors.bedrooms}>
				<Input
					type="number"
					value={values.bedrooms}
					onChange={(event) => onChange("bedrooms", event.target.value)}
					placeholder="2"
					icon={<BedDouble aria-hidden="true" />}
					aria-invalid={Boolean(errors.bedrooms)}
				/>
			</FormField>
			<FormField label="Bathrooms" required error={errors.bathrooms}>
				<Input
					type="number"
					value={values.bathrooms}
					onChange={(event) => onChange("bathrooms", event.target.value)}
					placeholder="2"
					icon={<DoorOpen aria-hidden="true" />}
					aria-invalid={Boolean(errors.bathrooms)}
				/>
			</FormField>
			<FormField label="Maximum guests" required error={errors.maxGuests}>
				<Input
					type="number"
					value={values.maxGuests}
					onChange={(event) => onChange("maxGuests", event.target.value)}
					placeholder="4"
					icon={<Building2 aria-hidden="true" />}
					aria-invalid={Boolean(errors.maxGuests)}
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
				<Input
					type="number"
					value={values.kitchens}
					onChange={(event) => onChange("kitchens", event.target.value)}
					placeholder="1"
					icon={<UtensilsCrossed aria-hidden="true" />}
					aria-invalid={Boolean(errors.kitchens)}
				/>
			</FormField>
			<FormField label="Living rooms" optional error={errors.livingRooms}>
				<Input
					type="number"
					value={values.livingRooms}
					onChange={(event) => onChange("livingRooms", event.target.value)}
					placeholder="1"
					icon={<House aria-hidden="true" />}
					aria-invalid={Boolean(errors.livingRooms)}
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

function HotelRoomStep({ values, errors, onChange }: StepProps) {
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
				<Input
					value={values.roomType}
					onChange={(event) => onChange("roomType", event.target.value)}
					placeholder="Deluxe double room"
					icon={<DoorOpen aria-hidden="true" />}
					aria-invalid={Boolean(errors.roomType)}
				/>
			</FormField>
			<FormField label="Bed type" required error={errors.bedType}>
				<Input
					value={values.bedType}
					onChange={(event) => onChange("bedType", event.target.value)}
					placeholder="Queen bed"
					icon={<BedDouble aria-hidden="true" />}
					aria-invalid={Boolean(errors.bedType)}
				/>
			</FormField>
			<FormField label="Maximum guests" required error={errors.maxGuests}>
				<Input
					type="number"
					value={values.maxGuests}
					onChange={(event) => onChange("maxGuests", event.target.value)}
					placeholder="2"
					icon={<Hotel aria-hidden="true" />}
					aria-invalid={Boolean(errors.maxGuests)}
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

function AirbnbHouseStep({ values, errors, onChange }: StepProps) {
	return (
		<div className={styles.fieldGrid}>
			<FormField label="House type" required error={errors.houseType}>
				<Input
					value={values.houseType}
					onChange={(event) => onChange("houseType", event.target.value)}
					placeholder="Entire villa"
					icon={<House aria-hidden="true" />}
					aria-invalid={Boolean(errors.houseType)}
				/>
			</FormField>
			<FormField label="Bedrooms" required error={errors.bedrooms}>
				<Input
					type="number"
					value={values.bedrooms}
					onChange={(event) => onChange("bedrooms", event.target.value)}
					placeholder="3"
					icon={<BedDouble aria-hidden="true" />}
					aria-invalid={Boolean(errors.bedrooms)}
				/>
			</FormField>
			<FormField label="Bathrooms" required error={errors.bathrooms}>
				<Input
					type="number"
					value={values.bathrooms}
					onChange={(event) => onChange("bathrooms", event.target.value)}
					placeholder="2"
					icon={<DoorOpen aria-hidden="true" />}
					aria-invalid={Boolean(errors.bathrooms)}
				/>
			</FormField>
			<FormField label="Maximum guests" required error={errors.maxGuests}>
				<Input
					type="number"
					value={values.maxGuests}
					onChange={(event) => onChange("maxGuests", event.target.value)}
					placeholder="6"
					icon={<House aria-hidden="true" />}
					aria-invalid={Boolean(errors.maxGuests)}
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
				<Input
					value={values.currency}
					onChange={(event) => onChange("currency", event.target.value)}
					placeholder="RWF"
					icon={<CircleDollarSign aria-hidden="true" />}
					aria-invalid={Boolean(errors.currency)}
				/>
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
										<img
											src={image.file.publicUrl}
											alt={image.altText ?? image.file.originalName}
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

	return {
		category: product?.category ?? "CAR",
		title: product?.title ?? "",
		shortDescription: product?.shortDescription ?? "",
		description: product?.description ?? "",
		city: product?.city ?? "Kigali",
		country: product?.country ?? "Rwanda",
		basePrice: product?.basePrice ?? "",
		currency: product?.currency ?? "RWF",
		pricingUnit: product?.pricingUnit ?? "DAY",
		brand: car?.brand ?? "",
		model: car?.model ?? "",
		year: car?.year ? String(car.year) : "",
		plateNumber: car?.plateNumber ?? "",
		transmission: car?.transmission ?? "Automatic",
		fuelType: car?.fuelType ?? "Petrol",
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
	step?: number,
): ListingFormErrors {
	const errors: ListingFormErrors = {};
	const shouldValidate = (targetStep: number) =>
		step === undefined || step === targetStep;

	if (shouldValidate(0)) {
		if (!values.category) errors.category = "Choose a listing category.";
	}

	if (shouldValidate(1)) {
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

	if (shouldValidate(2)) {
		if (values.category === "CAR") {
			if (values.brand.trim().length < 2) errors.brand = "Brand is required.";
			if (!values.model.trim()) errors.model = "Model is required.";
			if (!isNumberInRange(values.year, 1990, 2035))
				errors.year = "Enter a valid year between 1990 and 2035.";
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

	if (shouldValidate(3)) {
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

function getFirstErrorStep(errors: ListingFormErrors) {
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

	if (Object.keys(errors).some((key) => stepOneFields.includes(key))) return 1;
	if (Object.keys(errors).some((key) => stepTwoFields.includes(key))) return 2;

	return 3;
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
		currency: values.currency.trim().toUpperCase() || "RWF",
		pricingUnit: values.pricingUnit,
	};

	if (values.category === "APARTMENT") {
		return {
			...basePayload,
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
			hotelName: values.hotelName.trim(),
			roomType: values.roomType.trim(),
			bedType: values.bedType.trim(),
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
			houseType: values.houseType.trim(),
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
