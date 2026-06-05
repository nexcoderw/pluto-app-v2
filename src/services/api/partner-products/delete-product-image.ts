import { apiClient } from "../client";
import { withFreshUserSession } from "../auth/ensure-user-session";
import { normalizeApiError } from "../errors";
import { PARTNER_PRODUCT_ROUTES } from "./routes";
import type {
	DeleteProductImageRequest,
	PartnerProductResponse,
} from "./types";

// Request: deletes one image from a listing owned by the current partner.
export async function deleteProductImage({
	productId,
	imageId,
}: DeleteProductImageRequest): Promise<PartnerProductResponse> {
	return withFreshUserSession(async () => {
		try {
			const response = await apiClient.delete<PartnerProductResponse>(
				PARTNER_PRODUCT_ROUTES.image(productId, imageId),
			);

			return response.data;
		} catch (error) {
			// Delete errors are normalized before reaching the listing UI.
			throw normalizeApiError(error);
		}
	});
}
