"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	ArrowLeft,
	BriefcaseBusiness,
	CalendarCheck,
	CalendarDays,
	CarFront,
	CheckCircle2,
	Fuel,
	MapPin,
	RefreshCcw,
	ShieldCheck,
	Sparkles,
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserAuthProfile } from "@/services/api/auth";
import { getCarListing, type PublicListing } from "@/services/api/listings";
import {
	getCachedUserProfile,
	hasKnownUserSession,
	subscribeToUserSession,
} from "@/services/api/token-store";
import {
	formatBoolean,
	formatMoney,
	formatOptional,
	getListingCoverImage,
} from "../listing-formatters";
import {
	ListingDatePlanner,
	ListingDatePlannerSkeleton,
} from "../listing-date-planner";
import { ListingLoginDialog } from "../listing-login-dialog";
import {
	ListingVerifiedPartnerCard,
	ListingVerifiedPartnerCardSkeleton,
} from "../listing-verified-partner-card";
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

	if (listingQuery.isError || !listingQuery.data?.product) {
		return <CarListingDetailError onRetry={() => listingQuery.refetch()} />;
	}

	return <CarListingDetail listing={listingQuery.data.product} />;
}

function CarListingDetail({ listing }: { listing: PublicListing }) {
	const [activeTab, setActiveTab] = useState<CarDetailTab>("overview");
	const details = listing.carDetails;
	const gallery = useMemo(() => buildGallery(listing), [listing]);
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
										<Sparkles aria-hidden="true" />
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

				<CarBookingSidebar
					listing={listing}
					fromDate={fromDate}
					toDate={toDate}
					rentalDays={rentalDays}
					totalPrice={totalPrice}
					formattedRange={formattedRange}
				/>
			</section>
		</main>
	);
}

function CarBookingSidebar({
	listing,
	fromDate,
	toDate,
	rentalDays,
	totalPrice,
	formattedRange,
}: {
	listing: PublicListing;
	fromDate?: Date;
	toDate?: Date;
	rentalDays: number;
	totalPrice: number;
	formattedRange: string;
}) {
	const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
	const currentUser = useSyncExternalStore(
		(onStoreChange) => subscribeToUserSession(() => onStoreChange()),
		getUserSessionSnapshot,
		() => null,
	);

	return (
		<aside className={styles.sidebar}>
			<section className={styles.priceNotice}>
				<Tag aria-hidden="true" />
				<span>Your price is calculated from the selected dates.</span>
			</section>

			<section className={styles.bookingPanel}>
				<div className={styles.priceLine}>
					<strong>
						{formatMoney(
							Number.isFinite(totalPrice)
								? String(totalPrice)
								: listing.basePrice,
							listing.currency,
						)}
					</strong>
					<span>
						for {rentalDays} {rentalDays === 1 ? "day" : "days"}
					</span>
				</div>

				<div className={styles.dateSummary}>
					<p>{formattedRange}</p>
				</div>

				<div className={styles.dateFields}>
					<div>
						<span>Pickup</span>
						<strong>
							{fromDate ? format(fromDate, "M/d/yyyy") : "Add date"}
						</strong>
					</div>
					<div>
						<span>Return</span>
						<strong>{toDate ? format(toDate, "M/d/yyyy") : "Add date"}</strong>
					</div>
				</div>

				{currentUser ? (
					<Button type="button" className={styles.bookButton}>
						<CalendarDays aria-hidden="true" />
						Book this car
					</Button>
				) : (
					<button
						type="button"
						className={styles.loginPrompt}
						onClick={() => setIsLoginDialogOpen(true)}
					>
						Sign in to unlock booking
					</button>
				)}
				<p className={styles.chargeNote}>You will not be charged yet.</p>
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

				<aside className={styles.sidebar}>
					<section className={styles.priceNotice}>
						<Skeleton className={styles.skeletonIcon} />
						<Skeleton className={styles.skeletonNoticeText} />
					</section>
					<section className={styles.bookingPanel}>
						<Skeleton className={styles.skeletonPrice} />
						<Skeleton className={styles.skeletonDateText} />
						<div className={styles.dateFields}>
							<div>
								<Skeleton className={styles.skeletonMiniLine} />
								<Skeleton className={styles.skeletonDateValue} />
							</div>
							<div>
								<Skeleton className={styles.skeletonMiniLine} />
								<Skeleton className={styles.skeletonDateValue} />
							</div>
						</div>
						<Skeleton className={styles.skeletonBookButton} />
						<Skeleton className={styles.skeletonChargeNote} />
					</section>
					<ListingVerifiedPartnerCardSkeleton />
				</aside>
			</section>
		</main>
	);
}

function CarListingDetailError({ onRetry }: { onRetry: () => void }) {
	return (
		<main className={styles.page}>
			<section className={styles.statePanel}>
				<RefreshCcw aria-hidden="true" />
				<h1>Car listing unavailable</h1>
				<p>
					This car may have been removed, paused, or moved to another category.
				</p>
				<div>
					<Button type="button" onClick={onRetry} className="rounded-full">
						<RefreshCcw aria-hidden="true" />
						Retry
					</Button>
					<Link href="/listings/cars">
						<ArrowLeft aria-hidden="true" />
						Back to cars
					</Link>
				</div>
			</section>
		</main>
	);
}

function buildGallery(listing: PublicListing) {
	const images = listing.images
		.filter((image) => Boolean(image.file.publicUrl))
		.map((image) => ({
			id: image.id,
			src: image.file.publicUrl ?? "/hero/hero.jpg",
			alt: image.altText ?? listing.title,
		}));
	const coverImage = getListingCoverImage(listing);

	if (!images.length) {
		return [
			{
				id: "fallback",
				src: "/hero/hero.jpg",
				alt: "Pluto Booking car",
			},
		];
	}

	return images.sort((first, second) => {
		if (first.id === coverImage?.id) return -1;
		if (second.id === coverImage?.id) return 1;
		return 0;
	});
}

function getUserSessionSnapshot(): UserAuthProfile | null {
	return hasKnownUserSession() ? getCachedUserProfile() : null;
}
