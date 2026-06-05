import type {
	AirbnbPropertyType,
	BedType,
	CarFuelType,
	CarTransmission,
	CurrencyCode,
	HotelRoomType,
	ListingOption,
} from "./types";

const currencyOptions = [
	{ value: "RWF", label: "Rwandan franc" },
	{ value: "USD", label: "US dollar" },
] satisfies ListingOption<CurrencyCode>[];

const carTransmissionOptions = [
	{ value: "AUTOMATIC", label: "Automatic" },
	{ value: "MANUAL", label: "Manual" },
] satisfies ListingOption<CarTransmission>[];

const carFuelTypeOptions = [
	{ value: "PETROL", label: "Petrol" },
	{ value: "DIESEL", label: "Diesel" },
	{ value: "HYBRID", label: "Hybrid" },
	{ value: "ELECTRIC", label: "Electric" },
] satisfies ListingOption<CarFuelType>[];

const hotelRoomTypeOptions = [
	{ value: "STANDARD", label: "Standard" },
	{ value: "DELUXE", label: "Deluxe" },
	{ value: "SUITE", label: "Suite" },
	{ value: "FAMILY", label: "Family" },
	{ value: "EXECUTIVE", label: "Executive" },
] satisfies ListingOption<HotelRoomType>[];

const bedTypeOptions = [
	{ value: "SINGLE", label: "Single" },
	{ value: "DOUBLE", label: "Double" },
	{ value: "QUEEN", label: "Queen" },
	{ value: "KING", label: "King" },
	{ value: "TWIN", label: "Twin" },
] satisfies ListingOption<BedType>[];

const airbnbPropertyTypeOptions = [
	{ value: "ENTIRE_HOME", label: "Entire home" },
	{ value: "APARTMENT", label: "Apartment" },
	{ value: "VILLA", label: "Villa" },
	{ value: "STUDIO", label: "Studio" },
	{ value: "GUEST_SUITE", label: "Guest suite" },
] satisfies ListingOption<AirbnbPropertyType>[];

export function normalizeCurrencyCode(value: string): CurrencyCode {
	return normalizeListingOptionValue(value, currencyOptions, "RWF");
}

export function normalizeCarTransmission(value: string): CarTransmission {
	return normalizeListingOptionValue(
		value,
		carTransmissionOptions,
		"AUTOMATIC",
	);
}

export function normalizeCarFuelType(value: string): CarFuelType {
	return normalizeListingOptionValue(value, carFuelTypeOptions, "PETROL");
}

export function normalizeHotelRoomType(value: string): HotelRoomType {
	return normalizeListingOptionValue(value, hotelRoomTypeOptions, "STANDARD");
}

export function normalizeBedType(value: string): BedType {
	return normalizeListingOptionValue(value, bedTypeOptions, "QUEEN");
}

export function normalizeAirbnbPropertyType(value: string): AirbnbPropertyType {
	return normalizeListingOptionValue(
		value,
		airbnbPropertyTypeOptions,
		"ENTIRE_HOME",
	);
}

export function normalizeOptionalCarTransmission(
	value: string | null | undefined,
): CarTransmission | undefined {
	return value ? normalizeCarTransmission(value) : undefined;
}

export function normalizeOptionalCarFuelType(
	value: string | null | undefined,
): CarFuelType | undefined {
	return value ? normalizeCarFuelType(value) : undefined;
}

export function normalizeOptionalHotelRoomType(
	value: string | null | undefined,
): HotelRoomType | undefined {
	return value ? normalizeHotelRoomType(value) : undefined;
}

export function normalizeOptionalBedType(
	value: string | null | undefined,
): BedType | undefined {
	return value ? normalizeBedType(value) : undefined;
}

export function normalizeOptionalAirbnbPropertyType(
	value: string | null | undefined,
): AirbnbPropertyType | undefined {
	return value ? normalizeAirbnbPropertyType(value) : undefined;
}

function normalizeListingOptionValue<Value extends string>(
	value: string,
	options: readonly ListingOption<Value>[],
	fallback: Value,
): Value {
	const comparableValue = normalizeComparableOption(value);
	const option = options.find(
		(item) =>
			normalizeComparableOption(item.value) === comparableValue ||
			normalizeComparableOption(item.label) === comparableValue,
	);

	return option?.value ?? fallback;
}

function normalizeComparableOption(value: string) {
	return value
		.trim()
		.replace(/[\s-]+/g, "_")
		.toUpperCase();
}
