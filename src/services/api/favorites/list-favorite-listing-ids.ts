import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { FAVORITE_ROUTES } from "./routes";
import type { FavoriteListingIdsResponse } from "./types";

export async function listFavoriteListingIds(): Promise<FavoriteListingIdsResponse> {
	try {
		const response = await apiClient.get<FavoriteListingIdsResponse>(
			FAVORITE_ROUTES.ids,
		);

		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
