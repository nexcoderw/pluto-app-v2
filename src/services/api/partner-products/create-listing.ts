import { apiClient } from '../client';
import { normalizeApiError } from '../errors';
import { PARTNER_PRODUCT_ROUTES } from './routes';
import type { CreateListingRequest, PartnerProductResponse } from './types';

// Request: creates a review-ready listing for the authenticated approved partner.
export async function createListing(
	payload: CreateListingRequest,
): Promise<PartnerProductResponse> {
	try {
		const response = await apiClient.post<PartnerProductResponse>(
			PARTNER_PRODUCT_ROUTES.create,
			payload,
		);

		return response.data;
	} catch (error) {
		// Errors are normalized so forms can show inline or toast feedback safely.
		throw normalizeApiError(error);
	}
}
