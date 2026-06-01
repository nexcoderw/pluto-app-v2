import { apiClient } from '../client';
import { normalizeApiError } from '../errors';
import { PARTNER_PRODUCT_ROUTES } from './routes';
import type {
	PartnerProductListRequest,
	PartnerProductListResponse,
} from './types';

export async function listPartnerProducts(
	params: PartnerProductListRequest = {},
): Promise<PartnerProductListResponse> {
	try {
		const response = await apiClient.get<PartnerProductListResponse>(
			PARTNER_PRODUCT_ROUTES.list,
			{ params },
		);

		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
