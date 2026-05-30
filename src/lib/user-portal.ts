import type { UserAuthProfile } from '@/services/api/auth';

// Portal routing: keep role-based redirects in one reusable place.
export function getUserPortalPath(user: Pick<UserAuthProfile, 'role'>) {
	return user.role === 'PARTNER' ? '/partner-onboarding' : '/account';
}

