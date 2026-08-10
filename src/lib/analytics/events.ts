import { trackAnalyticsEvent } from './analytics';
import type {
	AnalyticsDispatchStatus,
	AnalyticsItem,
} from './types';

const MAX_ANALYTICS_STRING_LENGTH = 100;
const MAX_ECOMMERCE_ITEMS = 200;

const POTENTIAL_EMAIL_PATTERN =
	/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

const POTENTIAL_PHONE_PATTERN =
	/\+?\d(?:[\s().-]*\d){7,}/;

const POTENTIAL_URL_PATTERN =
	/(?:https?:\/\/|www\.)/i;

const POTENTIAL_SECRET_PATTERN =
	/\b(?:access_token|authorization|password|refresh_token|reset_token|verification_token)\b/i;

export const PLUTO_LISTING_CATEGORIES = [
	'CAR',
	'APARTMENT',
	'HOTEL_ROOM',
	'AIRBNB_HOUSE',
] as const;

export type PlutoListingCategory =
	(typeof PLUTO_LISTING_CATEGORIES)[number];

export const PLUTO_ANALYTICS_EVENTS = {
	listingListViewed: 'view_item_list',
	listingSelected: 'select_item',
	listingViewed: 'view_item',
	listingFavoriteAdded: 'add_to_wishlist',
	listingSearch: 'search',
	login: 'login',
	signUp: 'sign_up',
	checkoutStarted: 'begin_checkout',
	paymentInfoAdded: 'add_payment_info',
	purchase: 'purchase',
} as const;

export const PLUTO_LISTING_LISTS = {
	homepageFeatured: {
		id: 'homepage_featured',
		name: 'Homepage featured listings',
	},
	marketplaceResults: {
		id: 'marketplace_results',
		name: 'Marketplace listings',
	},
	categoryResults: {
		id: 'category_results',
		name: 'Category listings',
	},
	searchResults: {
		id: 'search_results',
		name: 'Search results',
	},
	favorites: {
		id: 'favorites',
		name: 'Favorite listings',
	},
	relatedListings: {
		id: 'related_listings',
		name: 'Related listings',
	},
} as const;

export type PlutoListingListContext =
	keyof typeof PLUTO_LISTING_LISTS;

export type PlutoAuthMethod = 'email' | 'google';

export type PlutoPaymentMethod =
	| 'mobile_money'
	| 'hosted_card';

export type ListingAnalyticsItemInput = {
	itemId: string;
	category: PlutoListingCategory;
	price?: number;
	index?: number;
};

export type ListingListViewedAnalyticsInput = {
	list: PlutoListingListContext;
	items: readonly ListingAnalyticsItemInput[];
	currency?: string;
};

export type ListingSelectedAnalyticsInput = {
	list: PlutoListingListContext;
	item: ListingAnalyticsItemInput;
	currency?: string;
};

export type ListingViewedAnalyticsInput = {
	item: ListingAnalyticsItemInput;
	currency?: string;
};

export type ListingFavoriteAnalyticsInput = {
	item: ListingAnalyticsItemInput;
	currency?: string;
};

export type ListingSearchAnalyticsInput = {
	searchTerm: string;
	category?: PlutoListingCategory;
};

export type AuthAnalyticsInput = {
	method: PlutoAuthMethod;
};

export type ListingCheckoutAnalyticsInput = {
	itemId: string;
	category: PlutoListingCategory;
	currency: string;

	/**
	 * Authoritative listing subtotal from the Pluto API quote.
	 *
	 * Never pass a browser-calculated estimate, provider amount,
	 * collection fee, or tax here.
	 */
	serverSubtotal: number;
};

export type PaymentInfoAnalyticsInput =
	ListingCheckoutAnalyticsInput & {
		paymentMethod: PlutoPaymentMethod;
	};

export type VerifiedPurchaseAnalyticsInput =
	ListingCheckoutAnalyticsInput & {
		/**
		 * Pluto-owned, non-PII transaction identifier.
		 *
		 * Never use a provider token, XentriPay credential,
		 * payment account, phone number, or provider reference.
		 */
		transactionId: string;

		/**
		 * Authoritative tax returned by the Pluto API.
		 */
		serverTax?: number;
	};

function invalidParameters(): AnalyticsDispatchStatus {
	return 'invalid_parameters';
}

function normalizeIdentifier(value: string): string | null {
	const normalized = value.trim();

	if (
		normalized.length === 0 ||
		normalized.length > MAX_ANALYTICS_STRING_LENGTH
	) {
		return null;
	}

	return normalized;
}

function normalizeCurrency(value: string): string | null {
	const normalized = value.trim().toUpperCase();

	if (!/^[A-Z]{3}$/.test(normalized)) {
		return null;
	}

	return normalized;
}

function normalizeMoney(value: number): number | null {
	if (!Number.isFinite(value) || value < 0) {
		return null;
	}

	return value;
}

function normalizeIndex(value: number): number | null {
	if (
		!Number.isInteger(value) ||
		value < 0
	) {
		return null;
	}

	return value;
}

function normalizeSearchTerm(value: string): string | null {
	const normalized = value
		.trim()
		.replace(/\s+/g, ' ');

	if (
		normalized.length === 0 ||
		normalized.length > MAX_ANALYTICS_STRING_LENGTH
	) {
		return null;
	}

	if (
		POTENTIAL_EMAIL_PATTERN.test(normalized) ||
		POTENTIAL_PHONE_PATTERN.test(normalized) ||
		POTENTIAL_URL_PATTERN.test(normalized) ||
		POTENTIAL_SECRET_PATTERN.test(normalized)
	) {
		return null;
	}

	return normalized;
}

function createListingItem(
	input: ListingAnalyticsItemInput,
): AnalyticsItem | null {
	const itemId = normalizeIdentifier(input.itemId);

	if (itemId === null) {
		return null;
	}

	const item: Record<string, string | number> = {
		item_id: itemId,
		item_category: input.category,
		quantity: 1,
	};

	if (input.price !== undefined) {
		const price = normalizeMoney(input.price);

		if (price === null) {
			return null;
		}

		item.price = price;
	}

	if (input.index !== undefined) {
		const index = normalizeIndex(input.index);

		if (index === null) {
			return null;
		}

		item.index = index;
	}

	return item;
}

function createListingItems(
	inputs: readonly ListingAnalyticsItemInput[],
): AnalyticsItem[] | null {
	if (
		inputs.length === 0 ||
		inputs.length > MAX_ECOMMERCE_ITEMS
	) {
		return null;
	}

	const items: AnalyticsItem[] = [];

	for (const input of inputs) {
		const item = createListingItem(input);

		if (item === null) {
			return null;
		}

		items.push(item);
	}

	return items;
}

function itemsContainPrice(
	items: readonly AnalyticsItem[],
): boolean {
	return items.some(
		(item) => typeof item.price === 'number',
	);
}

function normalizeOptionalCurrency(
	currency: string | undefined,
	requiresCurrency: boolean,
): string | undefined | null {
	if (currency === undefined) {
		return requiresCurrency ? null : undefined;
	}

	return normalizeCurrency(currency);
}

function createAuthoritativeCheckoutData(
	input: ListingCheckoutAnalyticsInput,
):
	| {
			currency: string;
			value: number;
			items: AnalyticsItem[];
	  }
	| null {
	const itemId = normalizeIdentifier(input.itemId);
	const currency = normalizeCurrency(input.currency);
	const value = normalizeMoney(input.serverSubtotal);

	if (
		itemId === null ||
		currency === null ||
		value === null
	) {
		return null;
	}

	return {
		currency,
		value,
		items: [
			{
				item_id: itemId,
				item_category: input.category,
				price: value,
				quantity: 1,
			},
		],
	};
}

export function trackListingListViewed(
	input: ListingListViewedAnalyticsInput,
): AnalyticsDispatchStatus {
	const items = createListingItems(input.items);

	if (items === null) {
		return invalidParameters();
	}

	const currency = normalizeOptionalCurrency(
		input.currency,
		itemsContainPrice(items),
	);

	if (currency === null) {
		return invalidParameters();
	}

	const list = PLUTO_LISTING_LISTS[input.list];

	return trackAnalyticsEvent(
		PLUTO_ANALYTICS_EVENTS.listingListViewed,
		{
			currency,
			item_list_id: list.id,
			item_list_name: list.name,
			items,
		},
	);
}

export function trackListingSelected(
	input: ListingSelectedAnalyticsInput,
): AnalyticsDispatchStatus {
	const item = createListingItem(input.item);

	if (item === null) {
		return invalidParameters();
	}

	const currency = normalizeOptionalCurrency(
		input.currency,
		typeof item.price === 'number',
	);

	if (currency === null) {
		return invalidParameters();
	}

	const list = PLUTO_LISTING_LISTS[input.list];

	return trackAnalyticsEvent(
		PLUTO_ANALYTICS_EVENTS.listingSelected,
		{
			currency,
			item_list_id: list.id,
			item_list_name: list.name,
			items: [item],
		},
	);
}

export function trackListingViewed(
	input: ListingViewedAnalyticsInput,
): AnalyticsDispatchStatus {
	const item = createListingItem(input.item);

	if (item === null) {
		return invalidParameters();
	}

	const hasPrice = typeof item.price === 'number';

	const currency = normalizeOptionalCurrency(
		input.currency,
		hasPrice,
	);

	if (currency === null) {
		return invalidParameters();
	}

	return trackAnalyticsEvent(
		PLUTO_ANALYTICS_EVENTS.listingViewed,
		{
			currency,
			value: hasPrice
				? (item.price as number)
				: undefined,
			items: [item],
		},
	);
}

export function trackListingFavoriteAdded(
	input: ListingFavoriteAnalyticsInput,
): AnalyticsDispatchStatus {
	const item = createListingItem(input.item);

	if (item === null) {
		return invalidParameters();
	}

	const hasPrice = typeof item.price === 'number';

	const currency = normalizeOptionalCurrency(
		input.currency,
		hasPrice,
	);

	if (currency === null) {
		return invalidParameters();
	}

	return trackAnalyticsEvent(
		PLUTO_ANALYTICS_EVENTS.listingFavoriteAdded,
		{
			currency,
			value: hasPrice
				? (item.price as number)
				: undefined,
			items: [item],
		},
	);
}

export function trackListingSearch(
	input: ListingSearchAnalyticsInput,
): AnalyticsDispatchStatus {
	const searchTerm = normalizeSearchTerm(
		input.searchTerm,
	);

	if (searchTerm === null) {
		return invalidParameters();
	}

	return trackAnalyticsEvent(
		PLUTO_ANALYTICS_EVENTS.listingSearch,
		{
			search_term: searchTerm,
			listing_category: input.category,
		},
	);
}

export function trackLogin(
	input: AuthAnalyticsInput,
): AnalyticsDispatchStatus {
	return trackAnalyticsEvent(
		PLUTO_ANALYTICS_EVENTS.login,
		{
			method: input.method,
		},
	);
}

export function trackSignUp(
	input: AuthAnalyticsInput,
): AnalyticsDispatchStatus {
	return trackAnalyticsEvent(
		PLUTO_ANALYTICS_EVENTS.signUp,
		{
			method: input.method,
		},
	);
}

export function trackCheckoutStarted(
	input: ListingCheckoutAnalyticsInput,
): AnalyticsDispatchStatus {
	const checkout =
		createAuthoritativeCheckoutData(input);

	if (checkout === null) {
		return invalidParameters();
	}

	return trackAnalyticsEvent(
		PLUTO_ANALYTICS_EVENTS.checkoutStarted,
		checkout,
	);
}

export function trackPaymentInfoAdded(
	input: PaymentInfoAnalyticsInput,
): AnalyticsDispatchStatus {
	const checkout =
		createAuthoritativeCheckoutData(input);

	if (checkout === null) {
		return invalidParameters();
	}

	const paymentType =
		input.paymentMethod === 'mobile_money'
			? 'Mobile money'
			: 'Hosted card';

	return trackAnalyticsEvent(
		PLUTO_ANALYTICS_EVENTS.paymentInfoAdded,
		{
			...checkout,
			payment_type: paymentType,
		},
	);
}

export function trackVerifiedPurchase(
	input: VerifiedPurchaseAnalyticsInput,
): AnalyticsDispatchStatus {
	const checkout =
		createAuthoritativeCheckoutData(input);

	const transactionId = normalizeIdentifier(
		input.transactionId,
	);

	if (
		checkout === null ||
		transactionId === null
	) {
		return invalidParameters();
	}

	let tax: number | undefined;

	if (input.serverTax !== undefined) {
		const normalizedTax = normalizeMoney(
			input.serverTax,
		);

		if (normalizedTax === null) {
			return invalidParameters();
		}

		tax = normalizedTax;
	}

	return trackAnalyticsEvent(
		PLUTO_ANALYTICS_EVENTS.purchase,
		{
			...checkout,
			transaction_id: transactionId,
			tax,
		},
	);
}