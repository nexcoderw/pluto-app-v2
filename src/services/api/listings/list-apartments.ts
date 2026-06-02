import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { LISTING_ROUTES } from "./routes";
import type { ListingListRequest, ListingListResponse } from "./types";

export async function listApartmentListings(
	params: ListingListRequest = {},
): Promise<ListingListResponse> {
	try {
		const response = await apiClient.get<ListingListResponse>(
			LISTING_ROUTES.apartments,
			{ params },
		);

		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
