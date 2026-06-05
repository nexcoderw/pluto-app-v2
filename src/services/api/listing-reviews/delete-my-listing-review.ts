import { apiClient } from "../client";
import { withFreshUserSession } from "../auth/ensure-user-session";
import { normalizeApiError } from "../errors";
import { LISTING_REVIEW_ROUTES } from "./routes";

export type DeleteMyListingReviewResponse = {
	deleted: true;
};

export async function deleteMyListingReview(
	listingId: string,
): Promise<DeleteMyListingReviewResponse> {
	return withFreshUserSession(async () => {
		try {
			const response = await apiClient.delete<DeleteMyListingReviewResponse>(
				LISTING_REVIEW_ROUTES.me(listingId),
			);

			return response.data;
		} catch (error) {
			throw normalizeApiError(error);
		}
	});
}
