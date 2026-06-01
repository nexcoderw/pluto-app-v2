'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
	refreshUserSession,
	type UserAuthProfile,
	type UserRole,
} from '@/services/api/auth';
import { PortalForbidden } from './portal-forbidden';
import { PortalSkeleton } from './portal-skeleton';

type PortalAccessBoundaryProps = {
	allowedRole: UserRole;
	loadingFallback?: ReactNode;
	children: (user: UserAuthProfile) => ReactNode;
};

type AccessState =
	| { status: 'loading'; user: null }
	| { status: 'allowed'; user: UserAuthProfile }
	| { status: 'forbidden'; user: UserAuthProfile | null };

export function PortalAccessBoundary({
	allowedRole,
	loadingFallback,
	children,
}: PortalAccessBoundaryProps) {
	const [accessState, setAccessState] = useState<AccessState>({
		status: 'loading',
		user: null,
	});

	// Authorization check: refresh uses the secure cookie and never exposes secrets to the UI.
	useEffect(() => {
		let isActive = true;

		refreshUserSession()
			.then((response) => {
				if (!isActive) {
					return;
				}

				setAccessState(
					response.user.role === allowedRole
						? { status: 'allowed', user: response.user }
						: { status: 'forbidden', user: response.user },
				);
			})
			.catch(() => {
				if (isActive) {
					setAccessState({ status: 'forbidden', user: null });
				}
			});

		return () => {
			isActive = false;
		};
	}, [allowedRole]);

	if (accessState.status === 'loading') {
		return loadingFallback ?? <PortalSkeleton />;
	}

	if (accessState.status === 'forbidden') {
		return (
			<PortalForbidden expectedRole={allowedRole} user={accessState.user} />
		);
	}

	return children(accessState.user);
}
