import { apiClient } from "../client";
import { withFreshUserSession } from "../auth/ensure-user-session";
import { normalizeApiError } from "../errors";
import { FAVORITE_ROUTES } from "./routes";
import type {
	FavoriteListingsRequest,
	FavoriteListingsResponse,
} from "./types";

export async function listFavoriteListings(
	params: FavoriteListingsRequest = {},
): Promise<FavoriteListingsResponse> {
	return withFreshUserSession(async () => {
		try {
			const response = await apiClient.get<FavoriteListingsResponse>(
				FAVORITE_ROUTES.list,
				{ params },
			);

			return response.data;
		} catch (error) {
			throw normalizeApiError(error);
		}
	});
}
