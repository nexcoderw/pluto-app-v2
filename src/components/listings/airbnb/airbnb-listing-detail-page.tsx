"use client";

import { useMemo, useState } from "react";
import {
	Bath,
	BedDouble,
	CheckCircle2,
	House,
	MousePointer,
	Users,
} from "lucide-react";
import {
	addDays,
	differenceInCalendarDays,
	format,
	startOfDay,
} from "date-fns";
import type { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { NotFoundState } from "@/components/shared/not-found-state";
import { isApiNotFoundError } from "@/services/api/errors";
import { getAirbnbListing, type PublicListing } from "@/services/api/listings";
import {
	buildListingGallery,
	formatMoney,
	formatOptional,
} from "../listing-formatters";
import {
	ListingBookingSidebar,
	ListingBookingSidebarSkeleton,
} from "../listing-booking-sidebar";
import {
	ListingDatePlanner,
	ListingDatePlannerSkeleton,
} from "../listing-date-planner";
import { ListingAmenitiesSection } from "../listing-amenities-section";
import { ListingDetailErrorState } from "../listing-detail-error-state";
import {
	ListingLocationMap,
	ListingLocationMapSkeleton,
} from "../listing-location-map";
import {
	ListingStayDetailShell,
	ListingStayDetailShellSkeleton,
} from "../listing-stay-detail-shell";
import {
	ListingStayGallery,
	ListingStayGallerySkeleton,
} from "../listing-stay-gallery";
import { AirbnbReviewSection } from "./airbnb-review-section";
import styles from "./airbnb-listing-detail-page.module.css";

type AirbnbDetailTab = "overview" | "space" | "amenities" | "rules";

const detailTabs: Array<{ value: AirbnbDetailTab; label: string }> = [
	{ value: "overview", label: "Overview" },
	{ value: "space", label: "Space details" },
	{ value: "amenities", label: "Amenities" },
	{ value: "rules", label: "House rules" },
];

export function AirbnbListingDetailPage({ listingId }: { listingId: string }) {
	const listingQuery = useQuery({
		queryKey: ["public-airbnb-listing-detail", listingId],
		queryFn: () => getAirbnbListing(listingId),
	});

	if (listingQuery.isPending) {
		return <AirbnbListingDetailSkeleton />;
	}

	if (
		isApiNotFoundError(listingQuery.error) ||
		(!listingQuery.isError && !listingQuery.data?.product)
	) {
		return (
			<NotFoundState
				title="Listing not found"
				description="This Airbnb listing may have moved, expired, or is no longer available on Pluto Booking."
			/>
		);
	}

	if (listingQuery.isError) {
		return (
			<ListingDetailErrorState
				title="Airbnb stay unavailable"
				description="This stay may have been removed, paused, or moved to another category."
				backHref="/listings/airbnb"
				backLabel="Back to Airbnb homes"
				onRetry={() => listingQuery.refetch()}
			/>
		);
	}

	return <AirbnbListingDetail listing={listingQuery.data.product} />;
}

function AirbnbListingDetail({ listing }: { listing: PublicListing }) {
	const [activeTab, setActiveTab] = useState<AirbnbDetailTab>("overview");
	const gallery = useMemo(
		() => buildListingGallery(listing, "Pluto Booking Airbnb stay"),
		[listing],
	);
	const today = useMemo(() => startOfDay(new Date()), []);
	const [dateRange, setDateRange] = useState<DateRange | undefined>(() => ({
		from: addDays(today, 1),
		to: addDays(today, 4),
	}));
	const details = listing.airbnbDetails;
	const locationLabel =
		listing.location?.addressLine ?? `${listing.city}, ${listing.country}`;
	const fromDate = dateRange?.from;
	const toDate = dateRange?.to;
	const stayNights =
		fromDate && toDate
			? Math.max(1, differenceInCalendarDays(toDate, fromDate))
			: 1;
	const totalPrice = Number(listing.basePrice) * stayNights;
	const formattedRange =
		fromDate && toDate
			? `${format(fromDate, "MMM d, yyyy")} - ${format(toDate, "MMM d, yyyy")}`
			: "Select your check-in and checkout dates";
	const facts = useMemo(
		() => [
			{
				label: "Home type",
				value: formatOptional(details?.houseType),
				icon: House,
			},
			{
				label: "Bedrooms",
				value: details ? String(details.bedrooms) : "Not listed",
				icon: BedDouble,
			},
			{
				label: "Bathrooms",
				value: details ? String(details.bathrooms) : "Not listed",
				icon: Bath,
			},
			{
				label: "Guests",
				value: details ? String(details.maxGuests) : "Not listed",
				icon: Users,
			},
		],
		[details],
	);
	const spaceSetup = [
		{
			label: "Cleaning fee",
			value: details?.cleaningFee
				? formatMoney(details.cleaningFee, listing.currency)
				: "Not listed",
			icon: MousePointer,
		},
		{
			label: "Review status",
			value: listing.ratingAverage
				? `${listing.ratingAverage.toFixed(1)} from ${listing.ratingCount ?? 0} reviews`
				: "New listing",
			icon: CheckCircle2,
		},
	];
	const houseRules = [
		{
			label: "House notes",
			value: details?.houseRules ? "Provided" : "Not listed",
		},
	];

	return (
		<ListingStayDetailShell
			title={listing.title}
			locationLabel={locationLabel}
			metricsLabel="Airbnb highlights"
			metrics={[
				`${details?.bedrooms ?? "..."} Bedrooms`,
				`${details?.maxGuests ?? "..."} Guests`,
				`${listing.ratingAverage ? listing.ratingAverage.toFixed(1) : "New"} Rating`,
			]}
			sidebar={
				<ListingBookingSidebar
					listing={listing}
					fromDate={fromDate}
					toDate={toDate}
					durationCount={stayNights}
					durationSingular="night"
					durationPlural="nights"
					totalPrice={totalPrice}
					formattedRange={formattedRange}
					fromLabel="Check-in"
					toLabel="Checkout"
					eyebrow="Private stay booking"
					ctaLabel="Reserve stay"
					loginLabel="Sign in to reserve"
					footerNote="You will review the final booking details before paying."
					ctaIcon="door"
				/>
			}
		>
			<ListingStayGallery images={gallery} />

			<section className={styles.storyPanel}>
				<div className={styles.tabs} role="tablist" aria-label="Airbnb details">
					{detailTabs.map((tab) => (
						<button
							key={tab.value}
							type="button"
							role="tab"
							aria-selected={activeTab === tab.value}
							data-active={activeTab === tab.value}
							onClick={() => setActiveTab(tab.value)}
						>
							{tab.label}
						</button>
					))}
				</div>

				{activeTab === "overview" ? (
					<section className={styles.tabPanel}>
						<div className={styles.sectionHeader}>
							<span>Private stay overview</span>
						</div>
						<p>
							{listing.description ??
								listing.shortDescription ??
								"This approved Pluto Booking Airbnb-style stay is ready for customer review."}
						</p>
						<div className={styles.factGrid}>
							{facts.map((fact) => (
								<div key={fact.label} className={styles.factItem}>
									<fact.icon aria-hidden="true" />
									<span>{fact.label}</span>
									<strong>{fact.value}</strong>
								</div>
							))}
						</div>
					</section>
				) : null}

				{activeTab === "space" ? (
					<section className={styles.tabPanel}>
						<div className={styles.sectionHeader}>
							<span>Space setup</span>
						</div>
						<div className={styles.amenityGrid}>
							{spaceSetup.map((item) => (
								<div key={item.label}>
									<item.icon aria-hidden="true" />
									<span>{item.label}</span>
									<strong>{item.value}</strong>
								</div>
							))}
						</div>
					</section>
				) : null}

				{activeTab === "amenities" ? (
					<section className={styles.tabPanel}>
						<ListingAmenitiesSection
							amenities={listing.amenities}
							title="Stay amenities"
							description="Comfort, access, and house features selected by the host."
						/>
					</section>
				) : null}

				{activeTab === "rules" ? (
					<section className={styles.tabPanel}>
						<div className={styles.sectionHeader}>
							<span>House rules</span>
						</div>
						<div className={styles.amenityGrid}>
							{houseRules.map((rule) => (
								<div key={rule.label}>
									<CheckCircle2 aria-hidden="true" />
									<span>{rule.label}</span>
									<strong>{rule.value}</strong>
								</div>
							))}
						</div>
						{details?.houseRules ? (
							<p className={styles.ruleCopy}>{details.houseRules}</p>
						) : null}
					</section>
				) : null}
			</section>

			<ListingDatePlanner
				eyebrow="Stay dates"
				fromLabel="Check-in"
				toLabel="Checkout"
				today={today}
				dateRange={dateRange}
				fromDate={fromDate}
				toDate={toDate}
				formattedRange={formattedRange}
				resetRange={{ from: addDays(today, 1), to: addDays(today, 4) }}
				onDateRangeChange={setDateRange}
			/>

			<AirbnbReviewSection listing={listing} />

			<ListingLocationMap
				listing={listing}
				locationLabel={locationLabel}
				ariaLabel="Airbnb map location"
				unavailableDescription="The partner has not attached exact coordinates to this stay yet. Confirm arrival details before check-in."
			/>
		</ListingStayDetailShell>
	);
}

function AirbnbListingDetailSkeleton() {
	return (
		<ListingStayDetailShellSkeleton sidebar={<ListingBookingSidebarSkeleton />}>
			<ListingStayGallerySkeleton />
			<section className={styles.storyPanel}>
				<div className={styles.tabs}>
					<Skeleton className={styles.skeletonTab} />
					<Skeleton className={styles.skeletonTab} />
					<Skeleton className={styles.skeletonTab} />
				</div>
				<section className={styles.tabPanel}>
					<Skeleton className={styles.skeletonSectionLabel} />
					<Skeleton className={styles.skeletonParagraph} />
					<Skeleton className={styles.skeletonParagraphShort} />
					<div className={styles.factGrid}>
						{Array.from({ length: 4 }).map((_, index) => (
							<div key={index} className={styles.skeletonFeatureCard}>
								<Skeleton className={styles.skeletonIcon} />
								<Skeleton className={styles.skeletonMiniLine} />
								<Skeleton className={styles.skeletonFeatureTitle} />
							</div>
						))}
					</div>
				</section>
			</section>
			<ListingDatePlannerSkeleton />
			<section className={styles.skeletonReviewPanel}>
				<Skeleton className={styles.skeletonReviewScore} />
				<div className={styles.skeletonReviewMetrics}>
					{Array.from({ length: 6 }).map((_, index) => (
						<Skeleton key={index} />
					))}
				</div>
				<div className={styles.skeletonReviewList}>
					{Array.from({ length: 4 }).map((_, index) => (
						<div key={index}>
							<Skeleton className={styles.skeletonReviewer} />
							<Skeleton className={styles.skeletonReviewLine} />
							<Skeleton className={styles.skeletonReviewLineShort} />
						</div>
					))}
				</div>
			</section>
			<ListingLocationMapSkeleton />
		</ListingStayDetailShellSkeleton>
	);
}
