import { Skeleton } from '@/components/ui/skeleton';
import styles from './portal-shell.module.css';

export function PortalSkeleton() {
	return (
		<main className={styles.portalPage} aria-label="Loading portal">
			<section className={styles.portalFrame}>
				<aside className={styles.sidebar} aria-hidden="true">
					<Skeleton className={styles.skeletonBrand} />
					<Skeleton className={styles.skeletonNav} />
				</aside>
				<div className={styles.portalShell}>
					<Skeleton className={styles.skeletonTopbar} />
					<Skeleton className={styles.skeletonHero} />
					<div className={styles.skeletonGrid}>
						<Skeleton />
						<Skeleton />
						<Skeleton />
					</div>
				</div>
			</section>
		</main>
	);
}
