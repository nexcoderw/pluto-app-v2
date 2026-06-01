import { apiClient } from '../client';
import { normalizeApiError } from '../errors';
import { PARTNER_PROFILE_ROUTES } from './routes';
import type { PartnerProfileResponse } from './types';

// Workflow endpoint: locks the draft and sends it to admin review.
export async function submitPartnerProfile(): Promise<PartnerProfileResponse> {
	try {
		const response = await apiClient.post<PartnerProfileResponse>(
			PARTNER_PROFILE_ROUTES.submit,
		);

		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
