"use client";

import { useState, useSyncExternalStore } from "react";
import { CalendarCheck, CalendarDays, DoorOpen, Tag } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserAuthProfile } from "@/services/api/auth";
import type { PublicListing } from "@/services/api/listings";
import {
	getCachedUserProfile,
	hasKnownUserSession,
	subscribeToUserSession,
} from "@/services/api/token-store";
import { formatMoney } from "./listing-formatters";
import { ListingLoginDialog } from "./listing-login-dialog";
import {
	ListingVerifiedPartnerCard,
	ListingVerifiedPartnerCardSkeleton,
} from "./listing-verified-partner-card";
import styles from "./listing-booking-sidebar.module.css";

type ListingBookingSidebarProps = {
	listing: PublicListing;
	fromDate?: Date;
	toDate?: Date;
	totalPrice: number;
	durationCount: number;
	durationSingular: string;
	durationPlural: string;
	formattedRange: string;
	fromLabel: string;
	toLabel: string;
	ctaLabel: string;
	loginLabel: string;
	footerNote: string;
	ctaIcon: "calendar" | "door";
	eyebrow?: string;
	notice?: string;
};

export function ListingBookingSidebar({
	listing,
	fromDate,
	toDate,
	totalPrice,
	durationCount,
	durationSingular,
	durationPlural,
	formattedRange,
	fromLabel,
	toLabel,
	ctaLabel,
	loginLabel,
	footerNote,
	ctaIcon,
	eyebrow,
	notice,
}: ListingBookingSidebarProps) {
	const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
	const currentUser = useSyncExternalStore(
		(onStoreChange) => subscribeToUserSession(() => onStoreChange()),
		getUserSessionSnapshot,
		() => null,
	);
	const ActionIcon = ctaIcon === "calendar" ? CalendarDays : DoorOpen;

	return (
		<aside className={styles.sidebar}>
			{notice ? (
				<section className={styles.notice}>
					<Tag aria-hidden="true" />
					<span>{notice}</span>
				</section>
			) : null}

			<section className={styles.panel}>
				{eyebrow ? (
					<span className={styles.eyebrow}>
						<CalendarCheck aria-hidden="true" />
						{eyebrow}
					</span>
				) : null}
				<div className={styles.priceLine}>
					<strong>
						{formatMoney(
							Number.isFinite(totalPrice)
								? String(totalPrice)
								: listing.basePrice,
							listing.currency,
						)}
					</strong>
					<small>
						for {durationCount}{" "}
						{durationCount === 1 ? durationSingular : durationPlural}
					</small>
				</div>
				<p className={styles.rangeSummary}>{formattedRange}</p>
				<div className={styles.datePreview}>
					<div>
						<span>{fromLabel}</span>
						<strong>
							{fromDate ? format(fromDate, "M/d/yyyy") : "Add date"}
						</strong>
					</div>
					<div>
						<span>{toLabel}</span>
						<strong>{toDate ? format(toDate, "M/d/yyyy") : "Add date"}</strong>
					</div>
				</div>
				{currentUser ? (
					<Button type="button" className={styles.actionButton}>
						<ActionIcon aria-hidden="true" />
						{ctaLabel}
					</Button>
				) : (
					<button
						type="button"
						className={styles.loginPrompt}
						onClick={() => setIsLoginDialogOpen(true)}
					>
						{loginLabel}
						<ActionIcon aria-hidden="true" />
					</button>
				)}
				<p>{footerNote}</p>
			</section>

			<ListingVerifiedPartnerCard owner={listing.owner} />
			<ListingLoginDialog
				open={isLoginDialogOpen}
				onOpenChange={setIsLoginDialogOpen}
				listingTitle={listing.title}
			/>
		</aside>
	);
}

export function ListingBookingSidebarSkeleton({
	hasNotice = false,
}: {
	hasNotice?: boolean;
}) {
	return (
		<aside className={styles.sidebar} aria-busy="true">
			{hasNotice ? (
				<section className={styles.notice}>
					<Skeleton className={styles.skeletonIcon} />
					<Skeleton className={styles.skeletonNoticeText} />
				</section>
			) : null}
			<section className={styles.panel}>
				<Skeleton className={styles.skeletonSectionLabel} />
				<Skeleton className={styles.skeletonPrice} />
				<Skeleton className={styles.skeletonDateText} />
				<div className={styles.datePreview}>
					<div>
						<Skeleton className={styles.skeletonMiniLine} />
						<Skeleton className={styles.skeletonDateValue} />
					</div>
					<div>
						<Skeleton className={styles.skeletonMiniLine} />
						<Skeleton className={styles.skeletonDateValue} />
					</div>
				</div>
				<Skeleton className={styles.skeletonButton} />
				<Skeleton className={styles.skeletonChargeNote} />
			</section>
			<ListingVerifiedPartnerCardSkeleton />
		</aside>
	);
}

function getUserSessionSnapshot(): UserAuthProfile | null {
	return hasKnownUserSession() ? getCachedUserProfile() : null;
}
