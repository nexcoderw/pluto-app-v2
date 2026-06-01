'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
	ArrowRight,
	CircleAlert,
	LoaderCircle,
	Phone,
	ShieldCheck,
} from 'lucide-react';
import {
	completeUserGoogleLogin,
	readUserGoogleCallbackStatus,
} from '@/services/api/auth';
import styles from './auth-form.module.css';

export function GoogleCallbackPanel() {
	return (
		<Suspense fallback={<GoogleCallbackFallback />}>
			<GoogleCallbackContent />
		</Suspense>
	);
}

function GoogleCallbackContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackStatus = readUserGoogleCallbackStatus(searchParams);
	const [state, setState] = useState<'loading' | 'success' | 'phone' | 'error'>(
		'loading',
	);
	const displayState =
		callbackStatus === 'success' || callbackStatus === 'phone_required'
			? state
			: 'error';

	// State setup: exchange the backend refresh cookie for an in-memory access token.
	useEffect(() => {
		if (callbackStatus !== 'success' && callbackStatus !== 'phone_required') {
			return;
		}

		completeUserGoogleLogin()
			.then((response) => {
				if (
					callbackStatus === 'phone_required' ||
					response.user.requiresPhoneNumber
				) {
					setState('phone');
					router.replace('/complete-phone');
					return;
				}

				setState('success');
				router.replace('/');
			})
			.catch(() => setState('error'));
	}, [callbackStatus, router]);

	return (
		<section className={styles.formWrap} aria-live="polite">
			{displayState === 'loading' ? (
				<div className={styles.statePanel} data-state="loading">
					<LoaderCircle aria-hidden="true" />
					<h1>Securing your session</h1>
					<p>
						We are confirming your Google sign-in and preparing your account.
					</p>
				</div>
			) : null}

			{displayState === 'success' ? (
				<div className={styles.statePanel}>
					<ShieldCheck aria-hidden="true" />
					<h1>Google sign-in confirmed</h1>
					<p>Your secure Pluto Booking session is ready.</p>
					<Link href="/account" className={styles.secondaryAction}>
						<ArrowRight aria-hidden="true" />
						Continue
					</Link>
				</div>
			) : null}

			{displayState === 'phone' ? (
				<div className={styles.statePanel}>
					<Phone aria-hidden="true" />
					<h1>Phone number required</h1>
					<p>Add your phone number to finish your Google registration.</p>
					<Link href="/complete-phone" className={styles.secondaryAction}>
						<ArrowRight aria-hidden="true" />
						Continue
					</Link>
				</div>
			) : null}

			{displayState === 'error' ? (
				<div className={styles.statePanel} data-state="error">
					<CircleAlert aria-hidden="true" />
					<h1>Google sign-in could not continue</h1>
					<p>Start the secure login again. No provider secrets were exposed.</p>
					<Link href="/login" className={styles.secondaryAction}>
						<ArrowRight aria-hidden="true" />
						Return to login
					</Link>
				</div>
			) : null}
		</section>
	);
}

function GoogleCallbackFallback() {
	return (
		<section className={styles.formWrap}>
			<div className={styles.statePanel} data-state="loading">
				<LoaderCircle aria-hidden="true" />
			</div>
		</section>
	);
}
