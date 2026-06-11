import { apiClient } from "../client";
import { withFreshUserSession } from "../auth/ensure-user-session";
import { normalizeApiError } from "../errors";
import { FAVORITE_ROUTES } from "./routes";
import type { FavoriteListingMutationResponse } from "./types";

export async function saveFavoriteListing(
	productId: string,
): Promise<FavoriteListingMutationResponse> {
	return withFreshUserSession(async () => {
		try {
			const response = await apiClient.post<FavoriteListingMutationResponse>(
				FAVORITE_ROUTES.item(productId),
			);

			return response.data;
		} catch (error) {
			throw normalizeApiError(error);
		}
	});
}
