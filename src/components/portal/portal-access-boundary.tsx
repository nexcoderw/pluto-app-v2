'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
	refreshUserSession,
	type UserAuthProfile,
	type UserRole,
} from '@/services/api/auth';
import { ApiRequestError } from '@/services/api/errors';
import { PortalForbidden, PortalSessionUnavailable } from './portal-forbidden';
import { PortalSkeleton } from './portal-skeleton';

type PortalAccessBoundaryProps = {
	allowedRole: UserRole;
	loadingFallback?: ReactNode;
	children: (user: UserAuthProfile) => ReactNode;
};

type AccessState =
	| { status: 'loading'; user: null }
	| { status: 'allowed'; user: UserAuthProfile }
	| { status: 'forbidden'; user: UserAuthProfile | null }
	| { status: 'unavailable'; user: null; message: string };

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
			.catch((error) => {
				if (!isActive) {
					return;
				}

				if (
					error instanceof ApiRequestError &&
					(error.isNetworkError || error.statusCode === 0)
				) {
					setAccessState({
						status: 'unavailable',
						user: null,
						message:
							'The system is currently unreachable. Please check your connection and try again.',
					});
					return;
				}

				setAccessState({ status: 'forbidden', user: null });
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

	if (accessState.status === 'unavailable') {
		return <PortalSessionUnavailable message={accessState.message} />;
	}

	return children(accessState.user);
}
