import type {
	AirbnbPropertyType,
	BedType,
	CarFuelType,
	CarTransmission,
	CurrencyCode,
	HotelRoomType,
	ListingOption,
	ListingOptionsResponse,
	NumericListingOption,
} from "./types";

const currentYear = new Date().getFullYear();

export const fallbackCurrencyOptions = [
	{ value: "RWF", label: "Rwandan franc" },
	{ value: "USD", label: "US dollar" },
] satisfies ListingOption<CurrencyCode>[];

export const fallbackCarTransmissionOptions = [
	{ value: "AUTOMATIC", label: "Automatic" },
	{ value: "MANUAL", label: "Manual" },
] satisfies ListingOption<CarTransmission>[];

export const fallbackCarFuelTypeOptions = [
	{ value: "PETROL", label: "Petrol" },
	{ value: "DIESEL", label: "Diesel" },
	{ value: "HYBRID", label: "Hybrid" },
	{ value: "ELECTRIC", label: "Electric" },
] satisfies ListingOption<CarFuelType>[];

export const fallbackHotelRoomTypeOptions = [
	{ value: "STANDARD", label: "Standard" },
	{ value: "DELUXE", label: "Deluxe" },
	{ value: "SUITE", label: "Suite" },
	{ value: "FAMILY", label: "Family" },
	{ value: "EXECUTIVE", label: "Executive" },
] satisfies ListingOption<HotelRoomType>[];

export const fallbackBedTypeOptions = [
	{ value: "SINGLE", label: "Single" },
	{ value: "DOUBLE", label: "Double" },
	{ value: "QUEEN", label: "Queen" },
	{ value: "KING", label: "King" },
	{ value: "TWIN", label: "Twin" },
] satisfies ListingOption<BedType>[];

export const fallbackAirbnbPropertyTypeOptions = [
	{ value: "ENTIRE_HOME", label: "Entire home" },
	{ value: "APARTMENT", label: "Apartment" },
	{ value: "VILLA", label: "Villa" },
	{ value: "STUDIO", label: "Studio" },
	{ value: "GUEST_SUITE", label: "Guest suite" },
] satisfies ListingOption<AirbnbPropertyType>[];

export const fallbackNumberOptions = createNumberOptions();

export const fallbackListingOptions: ListingOptionsResponse = {
	version: "fallback-2026-06-05",
	currencies: fallbackCurrencyOptions,
	numbers: {
		oneToTenPlus: fallbackNumberOptions,
		bedrooms: fallbackNumberOptions,
		bathrooms: fallbackNumberOptions,
		guests: fallbackNumberOptions,
		doors: createNumberOptions(8),
	},
	years: Array.from({ length: currentYear - 2000 + 1 }, (_, index) => {
		return currentYear - index;
	}),
	cars: {
		transmissions: fallbackCarTransmissionOptions,
		fuelTypes: fallbackCarFuelTypeOptions,
		seats: createNumberOptions(10),
	},
	hotelRooms: {
		roomTypes: fallbackHotelRoomTypeOptions,
		bedTypes: fallbackBedTypeOptions,
	},
	airbnb: {
		propertyTypes: fallbackAirbnbPropertyTypeOptions,
	},
	amenities: {
		CAR: [],
		APARTMENT: [],
		HOTEL_ROOM: [],
		AIRBNB_HOUSE: [],
	},
};

function createNumberOptions(maximum = 10): NumericListingOption[] {
	return Array.from({ length: maximum }, (_, index) => {
		const value = index + 1;

		return {
			value,
			label: value === maximum ? `${value}+` : String(value),
		};
	});
}
