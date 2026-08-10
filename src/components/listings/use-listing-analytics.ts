'use client';

import {
	useEffect,
	useRef,
	useSyncExternalStore,
} from 'react';
import {
	getAnalyticsConsent,
	getServerAnalyticsConsent,
	subscribeToAnalyticsConsent,
} from '@/lib/analytics/consent';
import {
	trackListingListViewed,
	trackListingSearch,
	trackListingSelected,
	trackListingViewed,
	type PlutoListingCategory,
	type PlutoListingListContext,
} from '@/lib/analytics/events';
import type { AnalyticsDispatchStatus } from '@/lib/analytics/types';
import type {
	ListingCategorySlug,
	PublicListing,
} from '@/services/api/listings';

const categoryBySlug: Record<
	ListingCategorySlug,
	PlutoListingCategory
> = {
	cars: 'CAR',
	apartments: 'APARTMENT',
	'hotel-rooms': 'HOTEL_ROOM',
	airbnb: 'AIRBNB_HOUSE',
};

function wasAccepted(
	status: AnalyticsDispatchStatus,
): boolean {
	return status === 'sent' || status === 'queued';
}

function getListingPrice(
	listing: PublicListing,
): number | undefined {
	const price = Number(listing.basePrice);

	return Number.isFinite(price) && price >= 0
		? price
		: undefined;
}

function useAnalyticsConsent() {
	return useSyncExternalStore(
		subscribeToAnalyticsConsent,
		getAnalyticsConsent,
		getServerAnalyticsConsent,
	);
}

export function trackListingSelection(
	listing: PublicListing,
	list: PlutoListingListContext,
	index: number,
): AnalyticsDispatchStatus {
	const price = getListingPrice(listing);

	return trackListingSelected({
		list,
		item: {
			itemId: listing.id,
			category: listing.category,
			price,
			index,
		},
		currency:
			price === undefined
				? undefined
				: listing.currency,
	});
}

export function useListingViewAnalytics(
	listing: PublicListing,
): void {
	const consent = useAnalyticsConsent();
	const trackedListingIdRef =
		useRef<string | undefined>(undefined);

	useEffect(() => {
		if (
			consent !== 'granted' ||
			trackedListingIdRef.current === listing.id
		) {
			return;
		}

		const price = getListingPrice(listing);

		const status = trackListingViewed({
			item: {
				itemId: listing.id,
				category: listing.category,
				price,
			},
			currency:
				price === undefined
					? undefined
					: listing.currency,
		});

		if (wasAccepted(status)) {
			trackedListingIdRef.current = listing.id;
		}
	}, [
		consent,
		listing.basePrice,
		listing.category,
		listing.currency,
		listing.id,
	]);
}

export function useListingListAnalytics({
	list,
	listings,
	startIndex = 0,
	enabled = true,
}: {
	list: PlutoListingListContext;
	listings: readonly PublicListing[];
	startIndex?: number;
	enabled?: boolean;
}): void {
	const consent = useAnalyticsConsent();
	const lastSignatureRef =
		useRef<string | undefined>(undefined);

	const signature = `${list}:${startIndex}:${listings
		.map((listing) => listing.id)
		.join('|')}`;

	useEffect(() => {
		if (
			!enabled ||
			consent !== 'granted' ||
			listings.length === 0 ||
			lastSignatureRef.current === signature
		) {
			return;
		}

		/*
		 * Prices are intentionally omitted here because a result
		 * collection may contain listings with different currencies.
		 * The selected listing carries its own price/currency.
		 */
		const status = trackListingListViewed({
			list,
			items: listings.map((listing, index) => ({
				itemId: listing.id,
				category: listing.category,
				index: startIndex + index,
			})),
		});

		if (wasAccepted(status)) {
			lastSignatureRef.current = signature;
		}
	}, [
		consent,
		enabled,
		list,
		listings,
		signature,
		startIndex,
	]);
}

export function useListingSearchAnalytics({
	searchTerm,
	categorySlug,
	enabled = true,
}: {
	searchTerm: string;
	categorySlug: ListingCategorySlug;
	enabled?: boolean;
}): void {
	const consent = useAnalyticsConsent();
	const lastSignatureRef =
		useRef<string | undefined>(undefined);

	const normalizedSearchTerm = searchTerm
		.trim()
		.replace(/\s+/g, ' ');

	const signature = `${categorySlug}:${normalizedSearchTerm}`;

	useEffect(() => {
		if (!normalizedSearchTerm) {
			lastSignatureRef.current = undefined;
			return;
		}

		if (
			!enabled ||
			consent !== 'granted' ||
			lastSignatureRef.current === signature
		) {
			return;
		}

		const timer = window.setTimeout(() => {
			const status = trackListingSearch({
				searchTerm: normalizedSearchTerm,
				category: categoryBySlug[categorySlug],
			});

			if (wasAccepted(status)) {
				lastSignatureRef.current = signature;
			}
		}, 750);

		return () => {
			window.clearTimeout(timer);
		};
	}, [
		categorySlug,
		consent,
		enabled,
		normalizedSearchTerm,
		signature,
	]);
}