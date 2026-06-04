import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { LISTING_REVIEW_ROUTES } from "./routes";
import type { ListingReview, ListingReviewPayload } from "./types";

export async function updateMyListingReview(
	listingId: string,
	payload: Partial<ListingReviewPayload>,
): Promise<ListingReview> {
	try {
		const response = await apiClient.patch<ListingReview>(
			LISTING_REVIEW_ROUTES.me(listingId),
			payload,
		);

		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
