import type { ReactNode } from 'react';
import Image from 'next/image';
import { Building2, CalendarCheck2, CarFront, ShieldCheck, Sparkles } from 'lucide-react';
import styles from './auth-shell.module.css';

type AuthShellProps = {
	children: ReactNode;
	tone?: 'customer' | 'partner' | 'recovery';
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

export function AuthShell({ children, tone = 'customer' }: AuthShellProps) {
	const copy = toneCopy[tone];

	return (
		<section className={styles.shell} aria-label="Pluto Booking authentication">
			<div className={styles.brandPill}>
				<Image
					src="/logo-b.png"
					alt="Pluto Booking"
					width={630}
					height={185}
					priority
					className={styles.brandLogo}
				/>
			</div>

			<div className={styles.formColumn}>{children}</div>

			<aside className={styles.visualColumn} data-tone={tone}>
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
					<Sparkles aria-hidden="true" />
					<div>
						<strong>{copy.metric}</strong>
						<span>Pluto Booking account flow</span>
					</div>
				</div>
			</aside>
		</section>
	);
}
