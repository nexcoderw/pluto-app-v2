import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { LISTING_REVIEW_ROUTES } from "./routes";
import type { ListingReview, ListingReviewPayload } from "./types";

export async function createListingReview(
	listingId: string,
	payload: ListingReviewPayload,
): Promise<ListingReview> {
	try {
		const response = await apiClient.post<ListingReview>(
			LISTING_REVIEW_ROUTES.list(listingId),
			payload,
		);

		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
