import { apiClient } from "../client";
import { withFreshUserSession } from "../auth/ensure-user-session";
import { normalizeApiError } from "../errors";
import { PARTNER_PRODUCT_ROUTES } from "./routes";
import type {
	CompleteProductImageUploadRequest,
	PartnerProductResponse,
} from "./types";

// Request: verifies an already-uploaded Cloudinary image and attaches it to the listing.
export async function completeProductImageUpload({
	productId,
	publicId,
	originalName,
	mimeType,
	sizeBytes,
	altText,
	isCover,
	sortOrder,
}: CompleteProductImageUploadRequest): Promise<PartnerProductResponse> {
	return withFreshUserSession(async () => {
		try {
			const response = await apiClient.post<PartnerProductResponse>(
				PARTNER_PRODUCT_ROUTES.completeImageUpload(productId),
				{
					publicId,
					originalName,
					mimeType,
					sizeBytes,
					altText,
					isCover,
					sortOrder,
				},
			);

			return response.data;
		} catch (error) {
			throw normalizeApiError(error);
		}
	});
}
