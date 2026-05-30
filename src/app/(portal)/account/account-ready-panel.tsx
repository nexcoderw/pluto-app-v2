'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
	ArrowRight,
	CalendarCheck2,
	Heart,
	Search,
	ShieldCheck,
	UserRound,
} from 'lucide-react';
import { refreshUserSession, type UserAuthProfile } from '@/services/api/auth';
import styles from './portal-placeholder.module.css';

const REDIRECT_DELAY_SECONDS = 5;

export function AccountReadyPanel() {
	const router = useRouter();
	const [secondsLeft, setSecondsLeft] = useState(REDIRECT_DELAY_SECONDS);
	const [currentUser, setCurrentUser] = useState<UserAuthProfile | null>(null);

	// Redirect timer: keep the success state visible before moving users home.
	useEffect(() => {
		let isActive = true;
		const redirectTimer = window.setTimeout(() => {
			if (isActive) {
				router.replace('/');
			}
		}, REDIRECT_DELAY_SECONDS * 1000);

		const countdownTimer = window.setInterval(() => {
			setSecondsLeft((value) => Math.max(0, value - 1));
		}, 1000);

		return () => {
			isActive = false;
			window.clearTimeout(redirectTimer);
			window.clearInterval(countdownTimer);
		};
	}, [router]);

	// Session snapshot: use safe profile data only for personalized confirmation copy.
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
		<section className={styles.panel} aria-live="polite">
			<div className={styles.iconOrbit}>
				<span>
					<UserRound aria-hidden="true" />
				</span>
				<i aria-hidden="true" />
			</div>

			<div className={styles.copyBlock}>
				<p className={styles.eyebrow}>Account created</p>
				<h1>
					{currentUser?.fullName
						? `Welcome, ${currentUser.fullName}`
						: 'Your account is ready'}
				</h1>
				<p>
					Your Pluto Booking profile is active. You can start exploring trusted
					stays, rentals, saved listings, and secure booking tools.
				</p>
			</div>

			<div className={styles.featureGrid} aria-label="Account highlights">
				<span>
					<Search aria-hidden="true" />
					Discover listings
				</span>
				<span>
					<Heart aria-hidden="true" />
					Save favorites
				</span>
				<span>
					<CalendarCheck2 aria-hidden="true" />
					Manage bookings
				</span>
			</div>

			<div className={styles.redirectCard}>
				<ShieldCheck aria-hidden="true" />
				<span>
					<strong>Redirecting in {secondsLeft}s</strong>
					<small>You will be taken to the homepage automatically.</small>
				</span>
			</div>

			<Link href="/" className={styles.action}>
				<Search aria-hidden="true" />
				Explore Pluto Booking
				<ArrowRight aria-hidden="true" />
			</Link>
		</section>
	);
}

