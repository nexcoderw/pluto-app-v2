import { apiClient } from "../client";
import { withFreshUserSession } from "../auth/ensure-user-session";
import { normalizeApiError } from "../errors";
import { PARTNER_PRODUCT_ROUTES } from "./routes";
import type {
	ProductImageUploadSignatureRequest,
	ProductImageUploadSignatureResponse,
} from "./types";

// Request: creates a short-lived signed Cloudinary upload target for one image.
export async function createProductImageUploadSignature({
	productId,
	file,
}: ProductImageUploadSignatureRequest): Promise<ProductImageUploadSignatureResponse> {
	return withFreshUserSession(async () => {
		try {
			const response =
				await apiClient.post<ProductImageUploadSignatureResponse>(
					PARTNER_PRODUCT_ROUTES.imageUploadSignature(productId),
					{
						originalName: file.name,
						mimeType: file.type || "application/octet-stream",
						sizeBytes: file.size,
					},
				);

			return response.data;
		} catch (error) {
			throw normalizeApiError(error);
		}
	});
}
