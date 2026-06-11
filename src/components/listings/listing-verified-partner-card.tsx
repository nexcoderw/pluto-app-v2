"use client";

import type { CSSProperties } from "react";
import { ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import styles from "./listing-verified-partner-card.module.css";

type ListingVerifiedPartnerCardProps = {
	owner: {
		fullName: string;
		imageKey?: string | null;
	};
};

export function ListingVerifiedPartnerCard({
	owner,
}: ListingVerifiedPartnerCardProps) {
	const partnerInitials = getInitials(owner.fullName);
	const partnerImageStyle =
		owner.imageKey && owner.imageKey.startsWith("http")
			? ({
					"--partner-avatar-image": `url("${owner.imageKey}")`,
				} as CSSProperties)
			: undefined;

	return (
		<section className={styles.panel}>
			<span className={styles.badge}>
				<ShieldCheck aria-hidden="true" />
				Verified partner
			</span>
			<div className={styles.identity}>
				<i
					className={styles.avatar}
					data-has-image={Boolean(partnerImageStyle)}
					style={partnerImageStyle}
					aria-hidden="true"
				>
					{partnerImageStyle ? null : partnerInitials}
				</i>
				<strong>{owner.fullName}</strong>
			</div>
			<p>This partner completed Pluto Booking review before publishing.</p>
		</section>
	);
}

export function ListingVerifiedPartnerCardSkeleton() {
	return (
		<section className={styles.panel} aria-busy="true">
			<Skeleton className={styles.skeletonBadge} />
			<div className={styles.identity}>
				<Skeleton className={styles.skeletonAvatar} />
				<Skeleton className={styles.skeletonName} />
			</div>
			<Skeleton className={styles.skeletonCopy} />
		</section>
	);
}

function getInitials(value: string) {
	const [first = "P", second = "B"] = value.trim().split(/\s+/).filter(Boolean);

	return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
}
