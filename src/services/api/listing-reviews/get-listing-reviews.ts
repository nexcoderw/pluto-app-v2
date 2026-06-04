import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { LISTING_REVIEW_ROUTES } from "./routes";
import type { ListingReviewsRequest, ListingReviewsResponse } from "./types";

export async function getListingReviews(
	listingId: string,
	params: ListingReviewsRequest = {},
): Promise<ListingReviewsResponse> {
	try {
		const response = await apiClient.get<ListingReviewsResponse>(
			LISTING_REVIEW_ROUTES.list(listingId),
			{ params },
		);

		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
