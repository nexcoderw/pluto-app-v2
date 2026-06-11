"use client";

import { useMemo, useState } from "react";
import {
	BedDouble,
	CheckCircle2,
	Clock3,
	DoorOpen,
	Hotel,
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
import {
	getHotelRoomListing,
	type PublicListing,
} from "@/services/api/listings";
import { buildListingGallery, formatOptional } from "../listing-formatters";
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
import { useListingBookingFlow } from "../use-listing-booking-flow";
import { HotelRoomReviewSection } from "./hotel-room-review-section";
import styles from "./hotel-room-listing-detail-page.module.css";

type HotelRoomDetailTab = "overview" | "room" | "amenities" | "policies";

const detailTabs: Array<{ value: HotelRoomDetailTab; label: string }> = [
	{ value: "overview", label: "Overview" },
	{ value: "room", label: "Room details" },
	{ value: "amenities", label: "Amenities" },
	{ value: "policies", label: "Stay rules" },
];

export function HotelRoomListingDetailPage({
	listingId,
}: {
	listingId: string;
}) {
	const listingQuery = useQuery({
		queryKey: ["public-hotel-room-listing-detail", listingId],
		queryFn: () => getHotelRoomListing(listingId),
	});

	if (listingQuery.isPending) {
		return <HotelRoomListingDetailSkeleton />;
	}

	if (
		isApiNotFoundError(listingQuery.error) ||
		(!listingQuery.isError && !listingQuery.data?.product)
	) {
		return (
			<NotFoundState
				title="Listing not found"
				description="This hotel room listing may have moved, expired, or is no longer available on Pluto Booking."
			/>
		);
	}

	if (listingQuery.isError) {
		return (
			<ListingDetailErrorState
				title="Hotel room unavailable"
				description="This room may have been removed, paused, or moved to another category."
				backHref="/listings/hotel-rooms"
				backLabel="Back to hotel rooms"
				onRetry={() => listingQuery.refetch()}
			/>
		);
	}

	return <HotelRoomListingDetail listing={listingQuery.data.product} />;
}

function HotelRoomListingDetail({ listing }: { listing: PublicListing }) {
	const [activeTab, setActiveTab] = useState<HotelRoomDetailTab>("overview");
	const gallery = useMemo(
		() => buildListingGallery(listing, "Pluto Booking hotel room"),
		[listing],
	);
	const today = useMemo(() => startOfDay(new Date()), []);
	const [dateRange, setDateRange] = useState<DateRange | undefined>(() => ({
		from: addDays(today, 1),
		to: addDays(today, 3),
	}));
	const details = listing.hotelRoomDetails;
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
	const bookingFlow = useListingBookingFlow({
		listing,
		today,
		dateRange,
		fromDate,
		toDate,
		durationCount: stayNights,
		durationLabel: stayNights === 1 ? "night" : "nights",
		totalPrice,
		formattedRange,
		onDateRangeChange: setDateRange,
	});
	const facts = useMemo(
		() => [
			{
				label: "Hotel",
				value: formatOptional(details?.hotelName),
				icon: Hotel,
			},
			{
				label: "Room type",
				value: formatOptional(details?.roomType),
				icon: DoorOpen,
			},
			{
				label: "Bed type",
				value: formatOptional(details?.bedType),
				icon: BedDouble,
			},
			{
				label: "Guests",
				value: details ? String(details.maxGuests) : "Not listed",
				icon: Users,
			},
		],
		[details],
	);
	const roomSetup = [
		{
			label: "Room size",
			value: details?.roomSizeSqm ? `${details.roomSizeSqm} sqm` : "Not listed",
		},
	];
	const policies = [
		{ label: "Check-in", value: formatOptional(details?.checkInTime) },
		{ label: "Checkout", value: formatOptional(details?.checkOutTime) },
		{ label: "Room number", value: formatOptional(details?.roomNumber) },
		{
			label: "Review status",
			value: listing.ratingAverage
				? `${listing.ratingAverage.toFixed(1)} from ${listing.ratingCount ?? 0} reviews`
				: "New listing",
		},
	];

	return (
		<ListingStayDetailShell
			title={listing.title}
			locationLabel={locationLabel}
			metricsLabel="Hotel room highlights"
			metrics={[
				`${details?.maxGuests ?? "..."} Guests`,
				`${details?.bedType ? "1" : "..."} Bed setup`,
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
					eyebrow="Hotel room booking"
					ctaLabel="Reserve room"
					loginLabel="Sign in to reserve"
					footerNote="You will review the final booking details before paying."
					ctaIcon="door"
					availabilityMessage={bookingFlow.availabilityMessage}
					isBookingPending={bookingFlow.isBookingPending}
					onReserve={bookingFlow.openBookingDialog}
				/>
			}
		>
			<ListingStayGallery images={gallery} autoplayDelay={4300} />

			<section className={styles.storyPanel}>
				<div
					className={styles.tabs}
					role="tablist"
					aria-label="Hotel room details"
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
							<span>Hotel room overview</span>
						</div>
						<p>
							{listing.description ??
								listing.shortDescription ??
								"This approved Pluto Booking hotel room is ready for customer review."}
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

				{activeTab === "room" ? (
					<section className={styles.tabPanel}>
						<div className={styles.sectionHeader}>
							<span>Room setup</span>
						</div>
						<div className={styles.amenityGrid}>
							{roomSetup.map((amenity) => (
								<div key={amenity.label}>
									<CheckCircle2 aria-hidden="true" />
									<span>{amenity.label}</span>
									<strong>{amenity.value}</strong>
								</div>
							))}
						</div>
					</section>
				) : null}

				{activeTab === "amenities" ? (
					<section className={styles.tabPanel}>
						<ListingAmenitiesSection
							amenities={listing.amenities}
							title="Room amenities"
							description="Guest-ready services and room features included with this stay."
						/>
					</section>
				) : null}

				{activeTab === "policies" ? (
					<section className={styles.tabPanel}>
						<div className={styles.sectionHeader}>
							<span>Stay rules</span>
						</div>
						<div className={styles.amenityGrid}>
							{policies.map((policy) => (
								<div key={policy.label}>
									<Clock3 aria-hidden="true" />
									<span>{policy.label}</span>
									<strong>{policy.value}</strong>
								</div>
							))}
						</div>
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
				resetRange={{ from: addDays(today, 1), to: addDays(today, 3) }}
				blockedRanges={bookingFlow.blockedRanges}
				availabilityMessage={bookingFlow.availabilityMessage}
				onUnavailableSelection={bookingFlow.rejectUnavailableDateRange}
				onDateRangeChange={bookingFlow.handleDateRangeChange}
			/>

			<HotelRoomReviewSection listing={listing} />

			<ListingLocationMap
				listing={listing}
				locationLabel={locationLabel}
				ariaLabel="Hotel room map location"
				unavailableDescription="The partner has not attached exact coordinates to this hotel room yet. Confirm arrival details before check-in."
			/>
			{bookingFlow.bookingDialog}
		</ListingStayDetailShell>
	);
}

function HotelRoomListingDetailSkeleton() {
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
