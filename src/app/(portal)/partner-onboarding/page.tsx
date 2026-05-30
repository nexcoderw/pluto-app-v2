import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Building2, ClipboardCheck } from 'lucide-react';
import styles from './partner-onboarding.module.css';

export const metadata: Metadata = {
	title: 'Partner Onboarding',
	description: 'Prepare your Pluto Booking partner profile for review.',
	robots: {
		index: false,
		follow: false,
	},
};

export default function PartnerOnboardingPage() {
	return (
		<main className={styles.page}>
			<section className={styles.panel}>
				<Building2 aria-hidden="true" />
				<h1>Partner onboarding</h1>
				<p>
					Your account is ready. Product listing, document review, and approval
					steps will live in this partner workspace.
				</p>
				<Link href="/account" className={styles.action}>
					<ClipboardCheck aria-hidden="true" />
					Go to account
					<ArrowRight aria-hidden="true" />
				</Link>
			</section>
		</main>
	);
}
