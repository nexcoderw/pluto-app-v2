'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
	ArrowRight,
	CalendarCheck2,
	Heart,
	MapPin,
	Search,
	Settings,
	ShieldCheck,
	UserRound,
} from 'lucide-react';
import { refreshUserSession, type UserAuthProfile } from '@/services/api/auth';
import { RegistrationSuccessDialog } from './registration-success-dialog';
import styles from './portal-placeholder.module.css';

export function AccountCustomerPortal() {
	return (
		<Suspense fallback={<AccountPortalSkeleton />}>
			<AccountCustomerPortalContent />
		</Suspense>
	);
}

function AccountCustomerPortalContent() {
	const searchParams = useSearchParams();
	const [currentUser, setCurrentUser] = useState<UserAuthProfile | null>(null);
	const showRegistrationDialog = searchParams.get('registered') === 'success';

	// Session snapshot: hydrate the customer portal with safe profile details only.
	useEffect(() => {
		let isActive = true;

		refreshUserSession()
			.then((response) => {
				if (isActive) {
					setCurrentUser(response.user);
				}
			})
			.catch(() => undefined);

		return () => {
			isActive = false;
		};
	}, []);

	return (
		<>
			<section className={styles.portalShell} aria-label="Customer portal">
				<div className={styles.portalHero}>
					<div className={styles.avatarMark} aria-hidden="true">
						<UserRound />
					</div>
					<div>
						<p className={styles.eyebrow}>Customer portal</p>
						<h1>
							{currentUser?.fullName
								? `Welcome back, ${currentUser.fullName}`
								: 'Welcome to your customer portal'}
						</h1>
						<p>
							Manage bookings, saved listings, profile details, and secure
							account preferences from one focused workspace.
						</p>
					</div>
					<Link href="/" className={styles.action}>
						<Search aria-hidden="true" />
						Explore Pluto Booking
						<ArrowRight aria-hidden="true" />
					</Link>
				</div>

				<div className={styles.statusGrid} aria-label="Account overview">
					<article>
						<CalendarCheck2 aria-hidden="true" />
						<strong>Bookings</strong>
						<span>No active booking yet</span>
					</article>
					<article>
						<Heart aria-hidden="true" />
						<strong>Saved listings</strong>
						<span>Start saving places you like</span>
					</article>
					<article>
						<ShieldCheck aria-hidden="true" />
						<strong>Account security</strong>
						<span>Session protected</span>
					</article>
				</div>

				<div className={styles.quickActions}>
					<Link href="/">
						<MapPin aria-hidden="true" />
						<span>
							<strong>Find stays and rentals</strong>
							<small>Browse Pluto Booking listings.</small>
						</span>
						<ArrowRight aria-hidden="true" />
					</Link>
					<Link href="/account">
						<Settings aria-hidden="true" />
						<span>
							<strong>Profile settings</strong>
							<small>Profile tools will appear here as the portal expands.</small>
						</span>
						<ArrowRight aria-hidden="true" />
					</Link>
				</div>
			</section>

			<RegistrationSuccessDialog
				open={showRegistrationDialog}
				user={currentUser}
			/>
		</>
	);
}

function AccountPortalSkeleton() {
	return <section className={styles.portalShell} aria-hidden="true" />;
}

