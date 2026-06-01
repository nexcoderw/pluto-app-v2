import { apiClient } from '../client';
import { normalizeApiError } from '../errors';
import { PARTNER_PRODUCT_ROUTES } from './routes';
import type { PartnerProductResponse, UpdateListingRequest } from './types';

// Request: updates one listing owned by the authenticated partner.
export async function updateListing(
	productId: string,
	payload: UpdateListingRequest,
): Promise<PartnerProductResponse> {
	try {
		const response = await apiClient.patch<PartnerProductResponse>(
			PARTNER_PRODUCT_ROUTES.update(productId),
			payload,
		);

		return response.data;
	} catch (error) {
		// Backend validation is converted into a stable frontend error shape.
		throw normalizeApiError(error);
	}
}
