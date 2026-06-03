export type ProductCategory =
	| "CAR"
	| "APARTMENT"
	| "HOTEL_ROOM"
	| "AIRBNB_HOUSE";
export type ProductStatus =
	| "DRAFT"
	| "PENDING_REVIEW"
	| "APPROVED"
	| "REJECTED"
	| "SUSPENDED"
	| "ARCHIVED";
export type ProductVisibility = "PUBLIC" | "PRIVATE";
export type PricingUnit = "HOUR" | "DAY" | "NIGHT" | "WEEK" | "MONTH";

export type ProductImage = {
	id: string;
	altText: string | null;
	sortOrder: number;
	isCover: boolean;
	file: {
		id: string;
		originalName: string;
		publicUrl: string | null;
		key: string;
		storageProvider: "CLOUDINARY" | "LOCAL";
		syncStatus: "SYNCED" | "PENDING" | "FAILED";
	};
};

export type ProductLocation = {
	id: string;
	name: string | null;
	addressLine: string | null;
	city: string;
	district: string | null;
	province: string | null;
	country: string;
	latitude: string | null;
	longitude: string | null;
	createdAt?: string;
	updatedAt?: string;
};

export type CarDetails = {
	id: string;
	productId: string;
	brand: string;
	model: string;
	year: number;
	plateNumber: string | null;
	transmission: string;
	fuelType: string;
	seats: number;
	doors: number;
	luggageCapacity: number | null;
	airConditioning: boolean;
	driverIncluded: boolean;
	insuranceIncluded: boolean;
	mileageLimitPerDay: number | null;
	minimumDriverAge: number | null;
	requiresDeposit: boolean;
	depositAmount: string | null;
};

export type ApartmentDetails = {
	id: string;
	productId: string;
	bedrooms: number;
	bathrooms: number;
	kitchens: number;
	livingRooms: number;
	furnished: boolean;
	wifi: boolean;
	parking: boolean;
	floorNumber: number | null;
	maxGuests: number;
	hasBalcony: boolean;
	hasSecurity: boolean;
};

export type HotelRoomDetails = {
	id: string;
	productId: string;
	hotelName: string;
	roomType: string;
	bedType: string;
	roomSizeSqm: number | null;
	breakfastIncluded: boolean;
	checkInTime: string;
	checkOutTime: string;
	maxGuests: number;
	roomNumber: string | null;
	hasAirConditioning: boolean;
	hasPrivateBathroom: boolean;
};

export type AirbnbHouseDetails = {
	id: string;
	productId: string;
	houseType: string;
	entirePlace: boolean;
	selfCheckIn: boolean;
	houseRules: string | null;
	cleaningFee: string | null;
	bedrooms: number;
	bathrooms: number;
	maxGuests: number;
	allowPets: boolean;
	allowSmoking: boolean;
	allowParties: boolean;
};

export type Product = {
	id: string;
	productNo: string;
	ownerId?: string;
	category: ProductCategory;
	status?: ProductStatus;
	visibility?: ProductVisibility;
	title: string;
	slug: string;
	description?: string;
	shortDescription: string | null;
	city: string;
	country: string;
	location?: ProductLocation | null;
	basePrice: string;
	currency: string;
	pricingUnit: PricingUnit;
	isAvailable?: boolean;
	rejectionReason?: string | null;
	adminNotes?: string | null;
	publishedAt: string | null;
	ratingAverage?: number | null;
	ratingCount?: number;
	reviewedAt?: string | null;
	createdAt?: string;
	updatedAt?: string;
	images: ProductImage[];
	owner: {
		id: string;
		fullName: string;
		imageKey: string | null;
		email?: string;
	};
	carDetails?: CarDetails | null;
	apartmentDetails?: ApartmentDetails | null;
	hotelRoomDetails?: HotelRoomDetails | null;
	airbnbDetails?: AirbnbHouseDetails | null;
};

export type ProductListRequest = {
	page?: number;
	category?: ProductCategory;
	city?: string;
	country?: string;
	search?: string;
	orderBy?: "createdAt" | "basePrice" | "title";
	order?: "asc" | "desc";
};

export type ProductListResponse = {
	items: Product[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
		orderBy: string;
		order: "asc" | "desc";
	};
};

export type ProductDetailResponse = {
	product: Product;
};
