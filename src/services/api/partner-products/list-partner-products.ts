import { apiClient } from "../client";
import { withFreshUserSession } from "../auth/ensure-user-session";
import { normalizeApiError } from "../errors";
import { PARTNER_PRODUCT_ROUTES } from "./routes";
import type {
	PartnerProductListRequest,
	PartnerProductListResponse,
} from "./types";

export async function listPartnerProducts(
	params: PartnerProductListRequest = {},
): Promise<PartnerProductListResponse> {
	return withFreshUserSession(async () => {
		try {
			const response = await apiClient.get<PartnerProductListResponse>(
				PARTNER_PRODUCT_ROUTES.list,
				{ params },
			);

			return response.data;
		} catch (error) {
			throw normalizeApiError(error);
		}
	});
}
