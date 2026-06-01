import { apiClient } from '../client';
import { normalizeApiError } from '../errors';
import { PARTNER_PRODUCT_ROUTES } from './routes';
import type {
	PartnerProductResponse,
	UpdateProductImageRequest,
} from './types';

// Request: updates image metadata without re-uploading the image file.
export async function updateProductImage({
	productId,
	imageId,
	altText,
	isCover,
	sortOrder,
}: UpdateProductImageRequest): Promise<PartnerProductResponse> {
	try {
		const response = await apiClient.patch<PartnerProductResponse>(
			PARTNER_PRODUCT_ROUTES.image(productId, imageId),
			{ altText, isCover, sortOrder },
		);

		return response.data;
	} catch (error) {
		// Metadata update errors remain stable for UI notification patterns.
		throw normalizeApiError(error);
	}
}
