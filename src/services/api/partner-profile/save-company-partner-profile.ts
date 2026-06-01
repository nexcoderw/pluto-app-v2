import { apiClient } from '../client';
import { normalizeApiError } from '../errors';
import { cachePartnerProfileStatus } from './cache-partner-profile';
import { PARTNER_PROFILE_ROUTES } from './routes';
import type {
	PartnerProfileResponse,
	SaveCompanyPartnerProfileRequest,
} from './types';

// Draft endpoint: saves company verification details before admin review.
export async function saveCompanyPartnerProfile(
	payload: SaveCompanyPartnerProfileRequest,
): Promise<PartnerProfileResponse> {
	try {
		const response = await apiClient.patch<PartnerProfileResponse>(
			PARTNER_PROFILE_ROUTES.saveCompany,
			payload,
		);

		return cachePartnerProfileStatus(response.data);
	} catch (error) {
		throw normalizeApiError(error);
	}
}
