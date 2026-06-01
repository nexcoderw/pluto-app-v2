import type {
	PricingUnit,
	Product,
	ProductCategory,
	ProductListRequest,
	ProductListResponse,
	ProductStatus,
} from '../products';

export type CreateCarProductRequest = {
	title: string;
	description: string;
	shortDescription?: string;
	city: string;
	country?: string;
	basePrice: string;
	currency?: string;
	pricingUnit?: PricingUnit;
	brand: string;
	model: string;
	year: number;
	plateNumber?: string;
	transmission: string;
	fuelType: string;
	seats: number;
	doors: number;
	luggageCapacity?: number;
	airConditioning?: boolean;
	driverIncluded?: boolean;
	insuranceIncluded?: boolean;
	mileageLimitPerDay?: number;
	minimumDriverAge?: number;
	requiresDeposit?: boolean;
	depositAmount?: string;
};

export type CreateListingRequest = CreateCarProductRequest & {
	category: ProductCategory;
};

export type UpdateListingRequest = Partial<CreateCarProductRequest>;

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
