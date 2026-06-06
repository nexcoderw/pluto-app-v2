import type { ProductCategory, PricingUnit } from "../products";
import type { CurrencyCode } from "../listing-options";

export type FavoriteListingSummary = {
	id: string;
	userId: string;
	productId: string;
	createdAt: string;
	product: {
		id: string;
		title: string;
		category: ProductCategory;
		shortDescription: string | null;
		city: string;
		country: string;
		basePrice: string;
		currency: CurrencyCode;
		pricingUnit: PricingUnit;
		owner: {
			id: string;
			fullName: string;
			imageKey: string | null;
		};
		images: Array<{
			id: string;
			altText: string | null;
			isCover: boolean;
			sortOrder: number;
			file: {
				id: string;
				publicUrl: string | null;
			};
		}>;
	};
};

export type FavoriteListingIdsResponse = {
	productIds: string[];
};

export type FavoriteListingsOrderBy = "createdAt" | "title" | "basePrice";
export type FavoriteListingsSortOrder = "asc" | "desc";

export type FavoriteListingsRequest = {
	page?: number;
	limit?: number;
	search?: string;
	orderBy?: FavoriteListingsOrderBy;
	order?: FavoriteListingsSortOrder;
	sortBy?: FavoriteListingsOrderBy;
	sortOrder?: FavoriteListingsSortOrder;
};

export type FavoriteListingsResponse = {
	items: FavoriteListingSummary[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
		orderBy: FavoriteListingsOrderBy;
		order: FavoriteListingsSortOrder;
	};
};

export type FavoriteListingMutationResponse = {
	message: string;
	productId: string;
	isFavorite: boolean;
};
