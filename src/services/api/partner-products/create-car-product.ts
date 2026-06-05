import { apiClient } from "../client";
import { withFreshUserSession } from "../auth/ensure-user-session";
import { normalizeApiError } from "../errors";
import { PARTNER_PRODUCT_ROUTES } from "./routes";
import type { CreateCarProductRequest, PartnerProductResponse } from "./types";

export async function createCarProduct(
	payload: CreateCarProductRequest,
): Promise<PartnerProductResponse> {
	return withFreshUserSession(async () => {
		try {
			const response = await apiClient.post<PartnerProductResponse>(
				PARTNER_PRODUCT_ROUTES.createCar,
				payload,
			);

			return response.data;
		} catch (error) {
			throw normalizeApiError(error);
		}
	});
}
