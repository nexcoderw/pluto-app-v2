import type { ReactNode } from "react";
import { MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import styles from "./listing-stay-detail-shell.module.css";

type ListingStayDetailShellProps = {
	title: string;
	locationLabel: string;
	metricsLabel: string;
	metrics: ReactNode[];
	children: ReactNode;
	sidebar: ReactNode;
};

export function ListingStayDetailShell({
	title,
	locationLabel,
	metricsLabel,
	metrics,
	children,
	sidebar,
}: ListingStayDetailShellProps) {
	return (
		<main className={styles.page}>
			<header className={styles.hero}>
				<div className={styles.heroCopy}>
					<h1>{title}</h1>
					<p>
						<MapPin aria-hidden="true" />
						{locationLabel}
					</p>
				</div>
				<div className={styles.heroMetrics} aria-label={metricsLabel}>
					{metrics.map((metric, index) => (
						<span key={index}>{metric}</span>
					))}
				</div>
			</header>

			<section className={styles.layout}>
				<div className={styles.mainColumn}>{children}</div>
				{sidebar}
			</section>
		</main>
	);
}

export function ListingStayDetailShellSkeleton({
	children,
	sidebar,
}: {
	children: ReactNode;
	sidebar: ReactNode;
}) {
	return (
		<main className={styles.page} aria-busy="true">
			<header className={styles.hero}>
				<div className={styles.heroCopy}>
					<Skeleton className={styles.skeletonTitle} />
					<Skeleton className={styles.skeletonLocation} />
				</div>
				<div className={styles.heroMetrics}>
					<Skeleton className={styles.skeletonMetric} />
					<Skeleton className={styles.skeletonMetric} />
					<Skeleton className={styles.skeletonMetric} />
				</div>
			</header>

			<section className={styles.layout}>
				<div className={styles.mainColumn}>{children}</div>
				{sidebar}
			</section>
		</main>
	);
}
