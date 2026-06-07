"use client";

import { useMemo, useState } from "react";
import { Bath, BedDouble, CheckCircle2, Home, Users } from "lucide-react";
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
import {
	getApartmentListing,
	type PublicListing,
} from "@/services/api/listings";
import {
	buildListingGallery,
	formatBoolean,
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
import { ApartmentReviewSection } from "./apartment-review-section";
import styles from "./apartment-listing-detail-page.module.css";

type ApartmentDetailTab = "overview" | "amenities";

const detailTabs: Array<{ value: ApartmentDetailTab; label: string }> = [
	{ value: "overview", label: "Overview" },
	{ value: "amenities", label: "Amenities" },
];

export function ApartmentListingDetailPage({
	listingId,
}: {
	listingId: string;
}) {
	const listingQuery = useQuery({
		queryKey: ["public-apartment-listing-detail", listingId],
		queryFn: () => getApartmentListing(listingId),
	});

	if (listingQuery.isPending) {
		return <ApartmentListingDetailSkeleton />;
	}

	if (
		isApiNotFoundError(listingQuery.error) ||
		(!listingQuery.isError && !listingQuery.data?.product)
	) {
		return (
			<NotFoundState
				title="Listing not found"
				description="This apartment listing may have moved, expired, or is no longer available on Pluto Booking."
			/>
		);
	}

	if (listingQuery.isError) {
		return (
			<ListingDetailErrorState
				title="Apartment unavailable"
				description="This apartment may have been removed, paused, or moved to another category."
				backHref="/listings/apartments"
				backLabel="Back to apartments"
				onRetry={() => listingQuery.refetch()}
			/>
		);
	}

	return <ApartmentListingDetail listing={listingQuery.data.product} />;
}

function ApartmentListingDetail({ listing }: { listing: PublicListing }) {
	const [activeTab, setActiveTab] = useState<ApartmentDetailTab>("overview");
	const gallery = useMemo(
		() => buildListingGallery(listing, "Pluto Booking apartment"),
		[listing],
	);
	const today = useMemo(() => startOfDay(new Date()), []);
	const [dateRange, setDateRange] = useState<DateRange | undefined>(() => ({
		from: addDays(today, 1),
		to: addDays(today, 4),
	}));
	const details = listing.apartmentDetails;
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
			{
				label: "Living rooms",
				value: details ? String(details.livingRooms) : "Not listed",
				icon: Home,
			},
		],
		[details],
	);
	const amenities = [
		{ label: "Furnished", value: formatBoolean(Boolean(details?.furnished)) },
		{ label: "WiFi", value: formatBoolean(Boolean(details?.wifi)) },
		{ label: "Parking", value: formatBoolean(Boolean(details?.parking)) },
		{ label: "Balcony", value: formatBoolean(Boolean(details?.hasBalcony)) },
		{ label: "Security", value: formatBoolean(Boolean(details?.hasSecurity)) },
		{ label: "Floor", value: formatOptional(details?.floorNumber) },
	];

	return (
		<ListingStayDetailShell
			title={listing.title}
			locationLabel={locationLabel}
			metricsLabel="Apartment highlights"
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
					eyebrow="Apartment booking"
					ctaLabel="Reserve apartment"
					loginLabel="Sign in to reserve"
					footerNote="You will review the final booking details before paying."
					ctaIcon="door"
				/>
			}
		>
			<ListingStayGallery images={gallery} />

			<section className={styles.storyPanel}>
				<div
					className={styles.tabs}
					role="tablist"
					aria-label="Apartment details"
				>
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
							<span>Apartment overview</span>
						</div>
						<p>
							{listing.description ??
								listing.shortDescription ??
								"This approved Pluto Booking apartment is ready for customer review."}
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

				{activeTab === "amenities" ? (
					<section className={styles.tabPanel}>
						<div className={styles.sectionHeader}>
							<span>Apartment setup</span>
						</div>
						<div className={styles.amenityGrid}>
							{amenities.map((amenity) => (
								<div key={amenity.label}>
									<CheckCircle2 aria-hidden="true" />
									<span>{amenity.label}</span>
									<strong>{amenity.value}</strong>
								</div>
							))}
						</div>
						<ListingAmenitiesSection
							amenities={listing.amenities}
							title="Apartment amenities"
							description="Comfort, safety, and stay features selected for this apartment."
						/>
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

			<ApartmentReviewSection listing={listing} />

			<ListingLocationMap
				listing={listing}
				locationLabel={locationLabel}
				ariaLabel="Apartment map location"
				unavailableDescription="The partner has not attached exact coordinates to this apartment yet. Confirm arrival details before check-in."
			/>
		</ListingStayDetailShell>
	);
}

function ApartmentListingDetailSkeleton() {
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
