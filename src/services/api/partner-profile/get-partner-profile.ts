import { apiClient } from '../client';
import { normalizeApiError } from '../errors';
import { PARTNER_PROFILE_ROUTES } from './routes';
import type { PartnerProfileResponse } from './types';

// Read endpoint: returns the authenticated partner profile and submission history.
export async function getPartnerProfile(): Promise<PartnerProfileResponse> {
	try {
		const response = await apiClient.get<PartnerProfileResponse>(
			PARTNER_PROFILE_ROUTES.detail,
		);

		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
