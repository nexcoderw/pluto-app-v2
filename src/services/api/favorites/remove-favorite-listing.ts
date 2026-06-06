import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { FAVORITE_ROUTES } from "./routes";
import type { FavoriteListingMutationResponse } from "./types";

export async function removeFavoriteListing(
	productId: string,
): Promise<FavoriteListingMutationResponse> {
	try {
		const response = await apiClient.delete<FavoriteListingMutationResponse>(
			FAVORITE_ROUTES.item(productId),
		);

		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
