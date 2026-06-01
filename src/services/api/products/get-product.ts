import { apiClient } from '../client';
import { normalizeApiError } from '../errors';
import { PRODUCT_ROUTES } from './routes';
import type { ProductDetailResponse } from './types';

export async function getProduct(
	productId: string,
): Promise<ProductDetailResponse> {
	try {
		const response = await apiClient.get<ProductDetailResponse>(
			PRODUCT_ROUTES.detail(productId),
		);

		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
