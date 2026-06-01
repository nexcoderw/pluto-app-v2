import type { UserAuthProfile } from '@/services/api/auth';
import type { PartnerProfileStatus } from '@/services/api/partner-profile';

// Portal routing: keep role-based redirects in one reusable place.
export function getUserPortalPath(
	user: Pick<UserAuthProfile, 'role'>,
	partnerProfileStatus?: PartnerProfileStatus | null,
) {
	if (user.role !== 'PARTNER') {
		return '/account';
	}

	return partnerProfileStatus === 'APPROVED'
		? '/partner/dashboard'
		: '/partner-onboarding';
}
