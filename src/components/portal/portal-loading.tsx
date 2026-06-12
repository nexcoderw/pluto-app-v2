import Image from 'next/image';
import { LoaderCircle, ShieldCheck } from 'lucide-react';
import styles from './portal-loading.module.css';

export function PortalLoading() {
	return (
		<main
			className={styles.page}
			role="status"
			aria-live="polite"
			aria-busy="true"
			aria-label="Loading your portal"
		>
			<section className={styles.panel}>
				<div className={styles.brandMark} aria-hidden="true">
					<span className={styles.loaderRing}>
						<LoaderCircle />
					</span>
					<span className={styles.logo}>
						<Image src="/logo-b.png" alt="" width={88} height={44} priority />
					</span>
				</div>

				<div className={styles.copy}>
					<span className={styles.eyebrow}>
						<ShieldCheck aria-hidden="true" />
						Secure portal access
					</span>
					<h1>Preparing your workspace</h1>
					<p>Confirming your session and loading your account.</p>
				</div>

				<div className={styles.progress} aria-hidden="true">
					<span />
				</div>
			</section>
		</main>
	);
}
