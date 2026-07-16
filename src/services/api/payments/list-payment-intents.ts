import { withFreshUserSession } from "../auth/ensure-user-session";
import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { PAYMENT_ROUTES } from "./routes";
import type {
	ListPaymentIntentsRequest,
	ListPaymentIntentsResponse,
} from "./types";

// Lists only customer-owned canonical payment records with bounded pagination.
export async function listPaymentIntents(
	params: ListPaymentIntentsRequest,
): Promise<ListPaymentIntentsResponse> {
	return withFreshUserSession(async () => {
		try {
			const response = await apiClient.get<ListPaymentIntentsResponse>(
				PAYMENT_ROUTES.intents,
				{ params },
			);

			return response.data;
		} catch (error) {
			throw normalizeApiError(error);
		}
	});
}
