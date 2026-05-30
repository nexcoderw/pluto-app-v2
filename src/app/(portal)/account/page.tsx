import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Search, UserRound } from 'lucide-react';
import styles from './portal-placeholder.module.css';

export const metadata: Metadata = {
	title: 'Account',
	description: 'Your Pluto Booking customer account.',
	robots: {
		index: false,
		follow: false,
	},
};

export default function AccountPage() {
	return (
		<main className={styles.page}>
			<section className={styles.panel}>
				<UserRound aria-hidden="true" />
				<h1>Your account is ready</h1>
				<p>
					The customer portal will hold bookings, saved listings, profile details,
					and secure account settings.
				</p>
				<Link href="/" className={styles.action}>
					<Search aria-hidden="true" />
					Explore Pluto Booking
					<ArrowRight aria-hidden="true" />
				</Link>
			</section>
		</main>
	);
}
