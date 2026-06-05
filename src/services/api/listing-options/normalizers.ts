import type {
	AirbnbPropertyType,
	BedType,
	CarFuelType,
	CarTransmission,
	CurrencyCode,
	HotelRoomType,
	ListingOption,
} from "./types";
import {
	fallbackAirbnbPropertyTypeOptions,
	fallbackBedTypeOptions,
	fallbackCarFuelTypeOptions,
	fallbackCarTransmissionOptions,
	fallbackCurrencyOptions,
	fallbackHotelRoomTypeOptions,
} from "./fallbacks";

export function normalizeCurrencyCode(value: string): CurrencyCode {
	return normalizeListingOptionValue(value, fallbackCurrencyOptions, "RWF");
}

export function normalizeCarTransmission(value: string): CarTransmission {
	return normalizeListingOptionValue(
		value,
		fallbackCarTransmissionOptions,
		"AUTOMATIC",
	);
}

export function normalizeCarFuelType(value: string): CarFuelType {
	return normalizeListingOptionValue(
		value,
		fallbackCarFuelTypeOptions,
		"PETROL",
	);
}

export function normalizeHotelRoomType(value: string): HotelRoomType {
	return normalizeListingOptionValue(
		value,
		fallbackHotelRoomTypeOptions,
		"STANDARD",
	);
}

export function normalizeBedType(value: string): BedType {
	return normalizeListingOptionValue(value, fallbackBedTypeOptions, "QUEEN");
}

export function normalizeAirbnbPropertyType(value: string): AirbnbPropertyType {
	return normalizeListingOptionValue(
		value,
		fallbackAirbnbPropertyTypeOptions,
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
