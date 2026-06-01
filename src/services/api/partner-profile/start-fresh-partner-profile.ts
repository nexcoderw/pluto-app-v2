import { apiClient } from '../client';
import { normalizeApiError } from '../errors';
import { PARTNER_PROFILE_ROUTES } from './routes';
import type { PartnerProfileResponse } from './types';

// Recovery endpoint: archives the current rejected/draft data and opens a clean draft.
export async function startFreshPartnerProfile(): Promise<PartnerProfileResponse> {
	try {
		const response = await apiClient.post<PartnerProfileResponse>(
			PARTNER_PROFILE_ROUTES.startFresh,
		);

		return response.data;
	} catch (error) {
		throw normalizeApiError(error);
	}
}
