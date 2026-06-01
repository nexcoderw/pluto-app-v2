import { setCachedPartnerProfileStatus } from '../token-store';
import type { PartnerProfileResponse } from './types';

// Cache only routing-safe status metadata; full partner profile stays in API/query state.
export function cachePartnerProfileStatus(
	response: PartnerProfileResponse,
): PartnerProfileResponse {
	setCachedPartnerProfileStatus(response.profile.status);

	return response;
}
