import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Building2, Mail, ShieldCheck } from 'lucide-react';
import styles from './public-footer.module.css';

export function PublicFooter() {
	return (
		<footer className={styles.footer}>
			<div className={styles.inner}>
				<div className={styles.brandBlock}>
					<Image src="/logo-b.png" alt="Pluto Booking" width={630} height={185} />
					<p>
						A calm, secure marketplace for trusted bookings, partner onboarding,
						and customer travel accounts.
					</p>
				</div>

				<div className={styles.linkColumns}>
					<div>
						<h2>Customers</h2>
						<Link href="/register">
							<ArrowRight aria-hidden="true" />
							Create account
						</Link>
						<Link href="/login">
							<ShieldCheck aria-hidden="true" />
							Sign in
						</Link>
					</div>
					<div>
						<h2>Partners</h2>
						<Link href="/partner-register">
							<Building2 aria-hidden="true" />
							List with Pluto
						</Link>
						<Link href="mailto:support@plutobooking.com">
							<Mail aria-hidden="true" />
							Contact support
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
