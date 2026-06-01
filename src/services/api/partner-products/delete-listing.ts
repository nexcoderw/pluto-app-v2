import { apiClient } from '../client';
import { normalizeApiError } from '../errors';
import { PARTNER_PRODUCT_ROUTES } from './routes';
import type { DeleteListingRequest, PartnerProductResponse } from './types';

// Request: archives one listing after the partner confirms its exact title.
export async function deleteListing(
	productId: string,
	payload: DeleteListingRequest,
): Promise<PartnerProductResponse> {
	try {
		const response = await apiClient.delete<PartnerProductResponse>(
			PARTNER_PRODUCT_ROUTES.delete(productId),
			{ data: payload },
		);

		return response.data;
	} catch (error) {
		// Delete failures stay user-safe and avoid leaking backend internals.
		throw normalizeApiError(error);
	}
}
