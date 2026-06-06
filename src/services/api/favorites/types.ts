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
		city: string;
		country: string;
		basePrice: string;
		currency: CurrencyCode;
		pricingUnit: PricingUnit;
		images: Array<{
			id: string;
			altText: string | null;
			isCover: boolean;
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

export type FavoriteListingsResponse = {
	items: FavoriteListingSummary[];
};

export type FavoriteListingMutationResponse = {
	message: string;
	productId: string;
	isFavorite: boolean;
};
