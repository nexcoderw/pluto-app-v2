import { apiClient } from '../client';
import { normalizeApiError } from '../errors';
import { cachePartnerProfileStatus } from './cache-partner-profile';
import { PARTNER_PROFILE_ROUTES } from './routes';
import type {
	PartnerProfileResponse,
	SaveIndividualPartnerProfileRequest,
} from './types';

// Draft endpoint: saves only fields needed for individual partner verification.
export async function saveIndividualPartnerProfile(
	payload: SaveIndividualPartnerProfileRequest,
): Promise<PartnerProfileResponse> {
	try {
		const response = await apiClient.patch<PartnerProfileResponse>(
			PARTNER_PROFILE_ROUTES.saveIndividual,
			payload,
		);

		return cachePartnerProfileStatus(response.data);
	} catch (error) {
		throw normalizeApiError(error);
	}
}
