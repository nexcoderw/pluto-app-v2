export type ListingOption<Value extends string = string> = {
	value: Value;
	label: string;
};

export type NumericListingOption = {
	value: number;
	label: string;
};

export type CurrencyCode = "RWF" | "USD";
export type CarTransmission = "AUTOMATIC" | "MANUAL";
export type CarFuelType = "PETROL" | "DIESEL" | "HYBRID" | "ELECTRIC";
export type HotelRoomType =
	| "STANDARD"
	| "DELUXE"
	| "SUITE"
	| "FAMILY"
	| "EXECUTIVE";
export type BedType = "SINGLE" | "DOUBLE" | "QUEEN" | "KING" | "TWIN";
export type AirbnbPropertyType =
	| "ENTIRE_HOME"
	| "APARTMENT"
	| "VILLA"
	| "STUDIO"
	| "GUEST_SUITE";

export type ListingOptionsResponse = {
	version: string;
	currencies: ListingOption<CurrencyCode>[];
	numbers: {
		oneToTenPlus: NumericListingOption[];
		bedrooms: NumericListingOption[];
		bathrooms: NumericListingOption[];
		guests: NumericListingOption[];
		doors: NumericListingOption[];
	};
	years: number[];
	cars: {
		transmissions: ListingOption<CarTransmission>[];
		fuelTypes: ListingOption<CarFuelType>[];
		seats: NumericListingOption[];
	};
	hotelRooms: {
		roomTypes: ListingOption<HotelRoomType>[];
		bedTypes: ListingOption<BedType>[];
	};
	airbnb: {
		propertyTypes: ListingOption<AirbnbPropertyType>[];
	};
};
