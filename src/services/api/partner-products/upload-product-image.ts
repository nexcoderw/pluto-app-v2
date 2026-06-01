import { apiClient } from '../client';
import { normalizeApiError } from '../errors';
import { PARTNER_PRODUCT_ROUTES } from './routes';
import type {
	PartnerProductResponse,
	UploadProductImageRequest,
} from './types';

// Request: uploads one listing image as multipart form data.
export async function uploadProductImage({
	productId,
	file,
	altText,
	isCover,
	sortOrder,
}: UploadProductImageRequest): Promise<PartnerProductResponse> {
	const formData = new FormData();

	formData.append('file', file);

	if (altText) {
		formData.append('altText', altText);
	}

	if (isCover !== undefined) {
		formData.append('isCover', String(isCover));
	}

	if (sortOrder !== undefined) {
		formData.append('sortOrder', String(sortOrder));
	}

	try {
		const response = await apiClient.post<PartnerProductResponse>(
			PARTNER_PRODUCT_ROUTES.images(productId),
			formData,
		);

		return response.data;
	} catch (error) {
		// Upload errors are normalized for toast or inline upload feedback.
		throw normalizeApiError(error);
	}
}
