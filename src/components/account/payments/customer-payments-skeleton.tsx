import { Skeleton } from "@/components/ui/skeleton";
import styles from "./customer-payments-page.module.css";

export function CustomerPaymentsSkeleton() {
	return (
		<section className={styles.page} aria-label="Loading payments">
			<div className={styles.skeletonHeader}>
				<Skeleton className={styles.skeletonEyebrow} />
				<Skeleton className={styles.skeletonTitle} />
				<Skeleton className={styles.skeletonText} />
			</div>
			<div className={styles.skeletonToolbar}>
				<Skeleton className={styles.skeletonText} />
				<Skeleton className={styles.skeletonControl} />
			</div>
			<div className={styles.grid}>
				{Array.from({ length: 4 }, (_, index) => (
					<div className={styles.skeletonCard} key={index}>
						<Skeleton className={styles.skeletonEyebrow} />
						<Skeleton className={styles.skeletonAmount} />
						<Skeleton className={styles.skeletonText} />
						<Skeleton className={styles.skeletonButton} />
					</div>
				))}
			</div>
		</section>
	);
}
