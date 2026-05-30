import { Skeleton } from '@/components/ui/skeleton';
import styles from './auth-form.module.css';

export function AuthFormSkeleton() {
	return (
		<section className={styles.formWrap} aria-label="Authentication form loading">
			<Skeleton className={styles.skeletonTitle} />
			<Skeleton className={styles.skeletonText} />
			<Skeleton className={styles.skeletonInput} />
			<Skeleton className={styles.skeletonInput} />
			<Skeleton className={styles.skeletonButton} />
			<Skeleton className={styles.skeletonSocial} />
		</section>
	);
}
