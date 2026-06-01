import type {
	PricingUnit,
	Product,
	ProductListRequest,
	ProductListResponse,
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

export type PartnerProductListRequest = ProductListRequest;
export type PartnerProductListResponse = ProductListResponse;

export type PartnerProductResponse = {
	message?: string;
	product: Product;
};
