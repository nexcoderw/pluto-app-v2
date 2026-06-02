import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { LISTING_ROUTES } from "./routes";
import type { ListingDetailResponse } from "./types";

export async function getHotelRoomListing(
	listingId: string,
): Promise<ListingDetailResponse> {
	try {
		const response = await apiClient.get<ListingDetailResponse>(
			LISTING_ROUTES.detail("hotel-rooms", listingId),
		);

		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
