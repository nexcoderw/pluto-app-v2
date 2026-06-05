"use client";

import { useQuery } from "@tanstack/react-query";
import {
	fallbackListingOptions,
	getListingOptions,
	listingOptionsQueryKey,
} from "@/services/api/listing-options";

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

	return {
		...query,
		options: query.data ?? fallbackListingOptions,
	};
}
