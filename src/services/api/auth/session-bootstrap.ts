import { getPartnerProfile } from '../partner-profile';
import { storeUserSession } from '../token-store';
import type { UserAuthProfile } from './types';

// Session bootstrap: cache only safe profile metadata needed for instant portal routing.
export async function storeAuthenticatedUserSession(
	user: UserAuthProfile,
): Promise<void> {
	if (user.role !== 'PARTNER') {
		storeUserSession(user, null);
		return;
	}

	try {
		const response = await getPartnerProfile();
		storeUserSession(user, response.profile.status);
	} catch {
		// Login must not fail just because the partner status prefetch is unavailable.
		storeUserSession(user, null);
	}
}
