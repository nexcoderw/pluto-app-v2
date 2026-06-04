import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { LISTING_REVIEW_ROUTES } from "./routes";
import type { ListingReviewSummary } from "./types";

export async function getListingReviewSummary(
	listingId: string,
): Promise<ListingReviewSummary> {
	try {
		const response = await apiClient.get<ListingReviewSummary>(
			LISTING_REVIEW_ROUTES.summary(listingId),
		);

		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
