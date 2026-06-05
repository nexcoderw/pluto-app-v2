import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { LISTING_OPTIONS_ROUTES } from "./routes";
import type { ListingOptionsResponse } from "./types";

export const listingOptionsQueryKey = ["listing-options"] as const;

export async function getListingOptions(): Promise<ListingOptionsResponse> {
	try {
		const response = await apiClient.get<ListingOptionsResponse>(
			LISTING_OPTIONS_ROUTES.getAll,
		);

		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
