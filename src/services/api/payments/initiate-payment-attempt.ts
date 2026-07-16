import { withFreshUserSession } from "../auth/ensure-user-session";
import { apiClient } from "../client";
import { normalizeApiError } from "../errors";
import { PAYMENT_ROUTES } from "./routes";
import type {
	InitiatePaymentAttemptPayload,
	PaymentIntentResponse,
} from "./types";

// Starts one idempotent mobile-money attempt for the canonical intent amount.
export async function initiatePaymentAttempt(
	paymentIntentId: string,
	payload: InitiatePaymentAttemptPayload,
): Promise<PaymentIntentResponse> {
	return withFreshUserSession(async () => {
		try {
			const response = await apiClient.post<PaymentIntentResponse>(
				PAYMENT_ROUTES.attempts(paymentIntentId),
				payload,
			);

			return response.data;
		} catch (error) {
			throw normalizeApiError(error);
		}
	});
}
