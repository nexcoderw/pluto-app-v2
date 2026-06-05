import { apiClient } from "../client";
import { withFreshUserSession } from "../auth/ensure-user-session";
import { normalizeApiError } from "../errors";
import { PARTNER_PRODUCT_ROUTES } from "./routes";
import type { PartnerProductResponse } from "./types";

export async function getPartnerProduct(
	productId: string,
): Promise<PartnerProductResponse> {
	return withFreshUserSession(async () => {
		try {
			const response = await apiClient.get<PartnerProductResponse>(
				PARTNER_PRODUCT_ROUTES.detail(productId),
			);

			return response.data;
		} catch (error) {
			throw normalizeApiError(error);
		}
	});
}
