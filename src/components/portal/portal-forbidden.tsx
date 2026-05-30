'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Home, ShieldAlert } from 'lucide-react';
import type { UserAuthProfile, UserRole } from '@/services/api/auth';
import styles from './portal-shell.module.css';

const REDIRECT_DELAY_SECONDS = 5;

type PortalForbiddenProps = {
	expectedRole: UserRole;
	user: UserAuthProfile | null;
};

export function PortalForbidden({ expectedRole, user }: PortalForbiddenProps) {
	const router = useRouter();
	const [secondsLeft, setSecondsLeft] = useState(REDIRECT_DELAY_SECONDS);
	const portalLabel = expectedRole === 'PARTNER' ? 'partner' : 'customer';
	const reason = user
		? `Your current ${user.role.toLowerCase()} account cannot open this ${portalLabel} portal.`
		: `You must sign in with a ${portalLabel} account before opening this portal.`;

	// Redirect timer: unauthorized users get a clear 403 state before returning home.
	useEffect(() => {
		const redirectTimer = window.setTimeout(() => {
			router.replace('/');
		}, REDIRECT_DELAY_SECONDS * 1000);

		const countdownTimer = window.setInterval(() => {
			setSecondsLeft((value) => Math.max(0, value - 1));
		}, 1000);

		return () => {
			window.clearTimeout(redirectTimer);
			window.clearInterval(countdownTimer);
		};
	}, [router]);

	return (
		<main className={styles.forbiddenPage}>
			<section className={styles.forbiddenPanel} aria-live="polite">
				<div className={styles.forbiddenCode}>403</div>
				<div className={styles.forbiddenIcon}>
					<ShieldAlert aria-hidden="true" />
				</div>
				<h1>Access restricted</h1>
				<p>{reason}</p>
				<div className={styles.redirectNotice}>
					<Home aria-hidden="true" />
					<span>Redirecting to homepage in {secondsLeft}s.</span>
				</div>
				<Link href="/" className={styles.primaryAction}>
					<Home aria-hidden="true" />
					Go home now
					<ArrowRight aria-hidden="true" />
				</Link>
			</section>
		</main>
	);
}

