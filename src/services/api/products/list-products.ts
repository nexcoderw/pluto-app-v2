import { apiClient } from '../client';
import { normalizeApiError } from '../errors';
import { PRODUCT_ROUTES } from './routes';
import type { ProductListRequest, ProductListResponse } from './types';

export async function listProducts(
	params: ProductListRequest = {},
): Promise<ProductListResponse> {
	try {
		const response = await apiClient.get<ProductListResponse>(
			PRODUCT_ROUTES.list,
			{ params },
		);

		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
