"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
	BriefcaseBusiness,
	CalendarCheck,
	CarFront,
	CheckCircle2,
	Fuel,
	MapPin,
	ShieldCheck,
	Star,
	Tag,
	Users,
} from "lucide-react";
import {
	addDays,
	differenceInCalendarDays,
	format,
	startOfDay,
} from "date-fns";
import type { DateRange } from "react-day-picker";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { NotFoundState } from "@/components/shared/not-found-state";
import { isApiNotFoundError } from "@/services/api/errors";
import { getCarListing, type PublicListing } from "@/services/api/listings";
import {
	buildListingGallery,
	formatBoolean,
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
import { ListingDetailErrorState } from "../listing-detail-error-state";
import { CarReviewSection } from "./reviews/car-review-section";
import styles from "./car-listing-detail-page.module.css";

type CarDetailTab = "overview" | "details" | "review";

const tabs: Array<{ value: CarDetailTab; label: string }> = [
	{ value: "overview", label: "Overview" },
	{ value: "details", label: "Details" },
	{ value: "review", label: "Listing review" },
];

export function CarListingDetailPage({ listingId }: { listingId: string }) {
	const listingQuery = useQuery({
		queryKey: ["public-car-listing-detail", listingId],
		queryFn: () => getCarListing(listingId),
	});

	if (listingQuery.isPending) {
		return <CarListingDetailSkeleton />;
	}

	if (
		isApiNotFoundError(listingQuery.error) ||
		(!listingQuery.isError && !listingQuery.data?.product)
	) {
		return (
			<NotFoundState
				title="Listing not found"
				description="This car listing may have moved, expired, or is no longer available on Pluto Booking."
			/>
		);
	}

	if (listingQuery.isError) {
		return (
			<ListingDetailErrorState
				title="Car listing unavailable"
				description="This car may have been removed, paused, or moved to another category."
				backHref="/listings/cars"
				backLabel="Back to cars"
				onRetry={() => listingQuery.refetch()}
			/>
		);
	}

	return <CarListingDetail listing={listingQuery.data.product} />;
}

function CarListingDetail({ listing }: { listing: PublicListing }) {
	const [activeTab, setActiveTab] = useState<CarDetailTab>("overview");
	const details = listing.carDetails;
	const gallery = useMemo(
		() => buildListingGallery(listing, "Pluto Booking car"),
		[listing],
	);
	const today = useMemo(() => startOfDay(new Date()), []);
	const [dateRange, setDateRange] = useState<DateRange | undefined>(() => ({
		from: addDays(today, 1),
		to: addDays(today, 4),
	}));
	const facts = useMemo(
		() => [
			{
				label: "Vehicle",
				value: details ? `${details.brand} ${details.model}` : "Not listed",
				icon: CarFront,
			},
			{
				label: "Year",
				value: details ? String(details.year) : "Not listed",
				icon: CalendarCheck,
			},
			{
				label: "Transmission",
				value: formatOptional(details?.transmission),
				icon: BriefcaseBusiness,
			},
			{
				label: "Fuel",
				value: formatOptional(details?.fuelType),
				icon: Fuel,
			},
			{
				label: "Seats",
				value: details ? String(details.seats) : "Not listed",
				icon: Users,
			},
			{
				label: "Driver included",
				value: details ? formatBoolean(details.driverIncluded) : "Not listed",
				icon: CheckCircle2,
			},
		],
		[details],
	);
	const policies = [
		{
			label: "Insurance included",
			value: details ? formatBoolean(details.insuranceIncluded) : "Not listed",
		},
		{
			label: "Daily mileage",
			value: details?.mileageLimitPerDay
				? `${details.mileageLimitPerDay} km`
				: "Flexible",
		},
		{
			label: "Minimum driver age",
			value: details?.minimumDriverAge
				? `${details.minimumDriverAge}+`
				: "Ask partner",
		},
		{
			label: "Deposit",
			value: details?.requiresDeposit
				? formatMoney(details.depositAmount ?? "0", listing.currency)
				: "No deposit listed",
		},
	];
	const fromDate = dateRange?.from;
	const toDate = dateRange?.to;
	const rentalDays =
		fromDate && toDate
			? Math.max(1, differenceInCalendarDays(toDate, fromDate))
			: 1;
	const totalPrice = Number(listing.basePrice) * rentalDays;
	const formattedRange =
		fromDate && toDate
			? `${format(fromDate, "MMM d, yyyy")} - ${format(toDate, "MMM d, yyyy")}`
			: "Select your pickup and return dates";

	return (
		<main className={styles.page}>
			<header className={styles.hero}>
				<div className={styles.heroCopy}>
					<h1>{listing.title}</h1>
					<p>
						<MapPin aria-hidden="true" />
						{listing.city}, {listing.country}
					</p>
				</div>
				<div className={styles.heroMetrics} aria-label="Listing highlights">
					<span>{details ? `${details.seats} seats` : "Seats listed"}</span>
					<span>{formatOptional(details?.transmission)}</span>
					<span>{formatOptional(details?.fuelType)}</span>
				</div>
			</header>

			<section className={styles.layout}>
				<div className={styles.mainColumn}>
					<section className={styles.gallerySection}>
						<Swiper
							className={styles.swiper}
							modules={[Autoplay, Navigation, Pagination]}
							loop={gallery.length > 1}
							navigation={gallery.length > 1}
							pagination={{ clickable: true }}
							autoplay={
								gallery.length > 1
									? { delay: 4200, disableOnInteraction: false }
									: false
							}
						>
							{gallery.map((image, index) => (
								<SwiperSlide key={image.id}>
									<div className={styles.slideImage}>
										<Image
											src={image.src}
											alt={image.alt}
											fill
											sizes="(max-width: 900px) 100vw, 64vw"
											priority={index === 0}
										/>
									</div>
								</SwiperSlide>
							))}
						</Swiper>
					</section>

					<section className={styles.contentPanel}>
						<div
							className={styles.tabs}
							role="tablist"
							aria-label="Listing detail tabs"
						>
							{tabs.map((tab) => (
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
									<span>Overview</span>
								</div>
								<p>
									{listing.description ??
										listing.shortDescription ??
										"This approved Pluto Booking car is ready for customer review."}
								</p>
								<div className={styles.quickGrid}>
									{facts.slice(0, 3).map((fact) => (
										<div key={fact.label}>
											<fact.icon aria-hidden="true" />
											<span>{fact.label}</span>
											<strong>{fact.value}</strong>
										</div>
									))}
								</div>
							</section>
						) : null}

						{activeTab === "details" ? (
							<section className={styles.tabPanel}>
								<div className={styles.sectionHeader}>
									<span>Details</span>
								</div>
								<div className={styles.factGrid}>
									{facts.map((fact) => (
										<div key={fact.label} className={styles.factItem}>
											<fact.icon aria-hidden="true" />
											<span>{fact.label}</span>
											<strong>{fact.value}</strong>
										</div>
									))}
								</div>
								<div className={styles.policyGrid}>
									{policies.map((policy) => (
										<div key={policy.label}>
											<span>{policy.label}</span>
											<strong>{policy.value}</strong>
										</div>
									))}
								</div>
							</section>
						) : null}

						{activeTab === "review" ? (
							<section className={styles.tabPanel}>
								<div className={styles.sectionHeader}>
									<span>Listing review</span>
								</div>
								<div className={styles.reviewGrid}>
									<div>
										<ShieldCheck aria-hidden="true" />
										<strong>Verified partner</strong>
										<span>{listing.owner.fullName}</span>
									</div>
									<div>
										<Star aria-hidden="true" />
										<strong>Rating</strong>
										<span>
											{listing.ratingAverage
												? `${listing.ratingAverage.toFixed(2)} / 5`
												: "New listing"}
										</span>
									</div>
									<div>
										<Tag aria-hidden="true" />
										<strong>Listing number</strong>
										<span>{listing.productNo}</span>
									</div>
								</div>
							</section>
						) : null}
					</section>

					<ListingDatePlanner
						eyebrow="Trip dates"
						fromLabel="Pickup"
						toLabel="Return"
						today={today}
						dateRange={dateRange}
						fromDate={fromDate}
						toDate={toDate}
						formattedRange={formattedRange}
						resetRange={{ from: addDays(today, 1), to: addDays(today, 4) }}
						onDateRangeChange={setDateRange}
					/>

					<CarReviewSection listing={listing} />
				</div>

				<ListingBookingSidebar
					listing={listing}
					fromDate={fromDate}
					toDate={toDate}
					durationCount={rentalDays}
					durationSingular="day"
					durationPlural="days"
					totalPrice={totalPrice}
					formattedRange={formattedRange}
					fromLabel="Pickup"
					toLabel="Return"
					ctaLabel="Book this car"
					loginLabel="Sign in to unlock booking"
					footerNote="You will not be charged yet."
					ctaIcon="calendar"
					notice="Your price is calculated from the selected dates."
				/>
			</section>
		</main>
	);
}

function CarListingDetailSkeleton() {
	return (
		<main className={styles.page} aria-busy="true">
			<header className={styles.hero}>
				<div className={styles.heroCopy}>
					<Skeleton className={styles.skeletonTitle} />
					<Skeleton className={styles.skeletonLocation} />
				</div>
				<div className={styles.heroMetrics} aria-label="Loading highlights">
					<Skeleton className={styles.skeletonStatPill} />
					<Skeleton className={styles.skeletonStatPill} />
					<Skeleton className={styles.skeletonStatPill} />
				</div>
			</header>

			<section className={styles.layout}>
				<div className={styles.mainColumn}>
					<section className={styles.gallerySection}>
						<div className={styles.skeletonGalleryFrame}>
							<Skeleton className={styles.skeletonGallery} />
							<Skeleton className={styles.skeletonGalleryButtonLeft} />
							<Skeleton className={styles.skeletonGalleryButtonRight} />
							<div className={styles.skeletonDots}>
								<Skeleton />
								<Skeleton />
								<Skeleton />
							</div>
						</div>
					</section>

					<section className={styles.contentPanel}>
						<div className={styles.tabs}>
							<Skeleton className={styles.skeletonTab} />
							<Skeleton className={styles.skeletonTab} />
							<Skeleton className={styles.skeletonTab} />
						</div>
						<section className={styles.tabPanel}>
							<div className={styles.sectionHeader}>
								<Skeleton className={styles.skeletonSectionLabel} />
							</div>
							<Skeleton className={styles.skeletonParagraph} />
							<Skeleton className={styles.skeletonParagraphShort} />
							<div className={styles.quickGrid}>
								{Array.from({ length: 3 }).map((_, index) => (
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

					<section className={styles.skeletonReviews}>
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
				</div>

				<ListingBookingSidebarSkeleton hasNotice />
			</section>
		</main>
	);
}
