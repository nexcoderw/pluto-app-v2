import type {
	PricingUnit,
	Product,
	ProductCategory,
	ProductListRequest,
	ProductListResponse,
	ProductStatus,
} from "../products";
import type {
	AirbnbPropertyType,
	BedType,
	CarFuelType,
	CarTransmission,
	CurrencyCode,
	HotelRoomType,
} from "../listing-options";

export type CreateCarProductRequest = {
	title: string;
	description: string;
	shortDescription?: string;
	city: string;
	country?: string;
	basePrice: string;
	currency?: CurrencyCode;
	pricingUnit?: PricingUnit;
	amenityIds?: string[];
	brand: string;
	model: string;
	year: number;
	plateNumber?: string;
	transmission: CarTransmission;
	fuelType: CarFuelType;
	seats: number;
	doors: number;
	luggageCapacity?: number;
	mileageLimitPerDay?: number;
	minimumDriverAge?: number;
};

export type ListingLocationRequest = {
	locationName?: string;
	locationAddress?: string;
	locationLatitude: number;
	locationLongitude: number;
};

export type CreateApartmentProductRequest =
	ProductBaseRequest & {} & ListingLocationRequest & {
			bedrooms: number;
			bathrooms: number;
			kitchens?: number;
			livingRooms?: number;
			floorNumber?: number;
			maxGuests: number;
		};

export type CreateHotelRoomProductRequest =
	ProductBaseRequest & {} & ListingLocationRequest & {
			hotelName: string;
			roomType: HotelRoomType;
			bedType: BedType;
			roomSizeSqm?: number;
			checkInTime: string;
			checkOutTime: string;
			maxGuests: number;
			roomNumber?: string;
		};

export type CreateAirbnbHouseProductRequest =
	ProductBaseRequest & {} & ListingLocationRequest & {
			houseType: AirbnbPropertyType;
			houseRules?: string;
			cleaningFee?: string;
			bedrooms: number;
			bathrooms: number;
			maxGuests: number;
		};

export type ProductBaseRequest = {
	title: string;
	description: string;
	shortDescription?: string;
	city: string;
	country?: string;
	basePrice: string;
	currency?: CurrencyCode;
	pricingUnit?: PricingUnit;
	amenityIds?: string[];
};

export type CreateListingRequest = (
	| CreateCarProductRequest
	| CreateApartmentProductRequest
	| CreateHotelRoomProductRequest
	| CreateAirbnbHouseProductRequest
) & {
	category: ProductCategory;
};

export type UpdateListingRequest = Partial<
	CreateListingRequest & {
		category?: ProductCategory;
	}
>;

export type DeleteListingRequest = {
	confirmationTitle: string;
};

export type PartnerProductListRequest = ProductListRequest & {
	status?: ProductStatus;
	limit?: number;
};
export type PartnerProductListResponse = ProductListResponse;

export type PartnerProductResponse = {
	message?: string;
	product: Product;
};

export type UploadProductImageRequest = {
	productId: string;
	file: File;
	altText?: string;
	isCover?: boolean;
	sortOrder?: number;
};

export type ProductImageUploadSignatureRequest = {
	productId: string;
	file: File;
};

export type ProductImageUploadSignatureResponse = {
	message?: string;
	cloudName: string;
	apiKey: string;
	publicId: string;
	uploadUrl: string;
	timestamp: number;
	signature: string;
	uploadParameters: Record<string, string | number>;
	expiresAt: string;
};

export type CompleteProductImageUploadRequest = {
	productId: string;
	publicId: string;
	originalName: string;
	mimeType: string;
	sizeBytes: number;
	altText?: string;
	isCover?: boolean;
	sortOrder?: number;
};

export type UpdateProductImageRequest = {
	productId: string;
	imageId: string;
	altText?: string;
	isCover?: boolean;
	sortOrder?: number;
};

export type DeleteProductImageRequest = {
	productId: string;
	imageId: string;
};
