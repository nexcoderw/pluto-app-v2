import { withFreshUserSession } from "../auth/ensure-user-session";
import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { PAYMENT_ROUTES } from "./routes";
import type {
	CreateListingQuotePayload,
	CreateListingQuoteResponse,
} from "./types";

// Creates the authoritative amount and inventory hold. Browser estimates are
// intentionally absent from the request.
export async function createListingQuote(
	payload: CreateListingQuotePayload,
): Promise<CreateListingQuoteResponse> {
	return withFreshUserSession(async () => {
		try {
			const response = await apiClient.post<CreateListingQuoteResponse>(
				PAYMENT_ROUTES.listingQuotes,
				payload,
			);

			return response.data;
		} catch (error) {
			throw normalizeApiError(error);
		}
	});
}
