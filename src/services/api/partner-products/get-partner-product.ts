import { apiClient } from '../client';
import { normalizeApiError } from '../errors';
import { PARTNER_PRODUCT_ROUTES } from './routes';
import type { PartnerProductResponse } from './types';

export async function getPartnerProduct(
	productId: string,
): Promise<PartnerProductResponse> {
	try {
		const response = await apiClient.get<PartnerProductResponse>(
			PARTNER_PRODUCT_ROUTES.detail(productId),
		);

		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
