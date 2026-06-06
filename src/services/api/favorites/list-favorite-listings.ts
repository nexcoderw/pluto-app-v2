import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { FAVORITE_ROUTES } from "./routes";
import type {
	FavoriteListingsRequest,
	FavoriteListingsResponse,
} from "./types";

export async function listFavoriteListings(
	params: FavoriteListingsRequest = {},
): Promise<FavoriteListingsResponse> {
	try {
		const response = await apiClient.get<FavoriteListingsResponse>(
			FAVORITE_ROUTES.list,
			{ params },
		);

		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
