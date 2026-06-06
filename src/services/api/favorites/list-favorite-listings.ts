import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { FAVORITE_ROUTES } from "./routes";
import type { FavoriteListingsResponse } from "./types";

export async function listFavoriteListings(): Promise<FavoriteListingsResponse> {
	try {
		const response = await apiClient.get<FavoriteListingsResponse>(
			FAVORITE_ROUTES.list,
		);

		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
