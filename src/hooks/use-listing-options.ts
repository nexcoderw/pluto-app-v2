"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	fallbackListingOptions,
	getListingOptions,
	listingOptionsQueryKey,
} from "@/services/api/listing-options";
import type { ListingOptionsResponse } from "@/services/api/listing-options";

const listingOptionsStaleTime = 24 * 60 * 60 * 1000;
const listingOptionsGcTime = 7 * listingOptionsStaleTime;

export function useListingOptions() {
	const query = useQuery({
		queryKey: listingOptionsQueryKey,
		queryFn: getListingOptions,
		staleTime: listingOptionsStaleTime,
		gcTime: listingOptionsGcTime,
		retry: 1,
	});
	const options = useMemo(
		() => normalizeListingOptions(query.data),
		[query.data],
	);

	return {
		...query,
		options,
	};
}

function normalizeListingOptions(
	options?: ListingOptionsResponse,
): ListingOptionsResponse {
	if (!options) {
		return fallbackListingOptions;
	}

	return {
		...fallbackListingOptions,
		...options,
		currencies: options.currencies ?? fallbackListingOptions.currencies,
		numbers: {
			...fallbackListingOptions.numbers,
			...options.numbers,
		},
		years: options.years ?? fallbackListingOptions.years,
		cars: {
			...fallbackListingOptions.cars,
			...options.cars,
		},
		hotelRooms: {
			...fallbackListingOptions.hotelRooms,
			...options.hotelRooms,
		},
		airbnb: {
			...fallbackListingOptions.airbnb,
			...options.airbnb,
		},
		amenities: {
			...fallbackListingOptions.amenities,
			...options.amenities,
		},
	};
}
