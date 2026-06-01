import { apiClient } from '../client';
import { normalizeApiError } from '../errors';
import { PARTNER_PRODUCT_ROUTES } from './routes';
import type { CreateCarProductRequest, PartnerProductResponse } from './types';

export async function createCarProduct(
	payload: CreateCarProductRequest,
): Promise<PartnerProductResponse> {
	try {
		const response = await apiClient.post<PartnerProductResponse>(
			PARTNER_PRODUCT_ROUTES.createCar,
			payload,
		);

		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
