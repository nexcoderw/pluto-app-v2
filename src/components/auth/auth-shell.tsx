import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
	Building2,
	CalendarCheck2,
	CarFront,
	Info,
	ShieldCheck,
} from 'lucide-react';
import styles from './auth-shell.module.css';

type AuthShellProps = {
	children: ReactNode;
	tone?: 'customer' | 'partner' | 'recovery';
	showGoogleCustomerNote?: boolean;
};

const toneCopy = {
	customer: {
		label: 'Customer access',
		title: 'Book trusted stays and rentals',
		metric: '4 categories',
	},
	partner: {
		label: 'Partner onboarding',
		title: 'List spaces with a reviewed workflow',
		metric: 'Review ready',
	},
	recovery: {
		label: 'Secure recovery',
		title: 'Restore access without exposing secrets',
		metric: 'Protected',
	},
} as const;

export function AuthShell({
	children,
	tone = 'customer',
	showGoogleCustomerNote = false,
}: AuthShellProps) {
	const copy = toneCopy[tone];

	return (
		<section className={styles.shell} aria-label="Pluto Booking authentication">
			<Link href="/" className={styles.brandPill} aria-label="Go to Pluto Booking home">
				<Image
					src="/logo-b.png"
					alt="Pluto Booking"
					width={630}
					height={185}
					priority
					className={styles.brandLogo}
				/>
			</Link>

			<div className={styles.formColumn}>
				<div className={styles.formStack}>
					{showGoogleCustomerNote ? (
						<aside className={styles.googleCustomerNote}>
							<Info aria-hidden="true" />
							<p>
								Google sign up creates a customer account only. Partners should
								create their account manually first, then they can sign in with
								Google after registration.
							</p>
						</aside>
					) : null}
					{children}
				</div>
			</div>

			<aside className={styles.visualColumn} data-tone={tone}>
				<Image
					src="/auth.jpg"
					alt="Kigali Convention Centre at sunset"
					fill
					priority
					sizes="(max-width: 980px) 0px, (max-width: 1280px) 52vw, 43rem"
					className={styles.visualImage}
				/>

				<div className={styles.visualLogo}>
					<Image src="/logo-w.png" alt="" width={873} height={276} priority />
				</div>

				<div className={styles.statusCard}>
					<div>
						<span>{copy.label}</span>
						<strong>{copy.title}</strong>
					</div>
					<ShieldCheck aria-hidden="true" />
				</div>

				<div className={styles.categoryDeck}>
					<div>
						<CarFront aria-hidden="true" />
						<span>Cars</span>
					</div>
					<div>
						<Building2 aria-hidden="true" />
						<span>Stays</span>
					</div>
					<div>
						<CalendarCheck2 aria-hidden="true" />
						<span>Bookings</span>
					</div>
				</div>

				<div className={styles.metricCard}>
					<div>
						<strong>{copy.metric}</strong>
						<span>Pluto Booking account flow</span>
					</div>
				</div>
			</aside>
		</section>
	);
}
