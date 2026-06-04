"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	ArrowLeft,
	Bath,
	BedDouble,
	CalendarCheck,
	CalendarDays,
	CheckCircle2,
	DoorOpen,
	Home,
	House,
	KeyRound,
	MapPin,
	RefreshCcw,
	Sparkles,
	Users,
} from "lucide-react";
import {
	addDays,
	differenceInCalendarDays,
	format,
	startOfDay,
} from "date-fns";
import type { DateRange } from "react-day-picker";
import type { Swiper as SwiperInstance } from "swiper";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useQuery } from "@tanstack/react-query";
import type { StyleSpecification } from "maplibre-gl";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Map,
	MapControls,
	MapMarker,
	MarkerContent,
} from "@/components/ui/map";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserAuthProfile } from "@/services/api/auth";
import { getAirbnbListing, type PublicListing } from "@/services/api/listings";
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
import { ListingLoginDialog } from "../listing-login-dialog";
import {
	ListingVerifiedPartnerCard,
	ListingVerifiedPartnerCardSkeleton,
} from "../listing-verified-partner-card";
import { AirbnbReviewSection } from "./airbnb-review-section";
import styles from "./airbnb-listing-detail-page.module.css";

type AirbnbDetailTab = "overview" | "space" | "rules";

const detailTabs: Array<{ value: AirbnbDetailTab; label: string }> = [
	{ value: "overview", label: "Overview" },
	{ value: "space", label: "Space details" },
	{ value: "rules", label: "House rules" },
];

const kigaliCenter: [number, number] = [30.0619, -1.9441];
const kigaliNeighborhoods: Array<{
	keywords: string[];
	position: [number, number];
}> = [
	{ keywords: ["kimihurura"], position: [30.0894, -1.9507] },
	{ keywords: ["nyarutarama"], position: [30.1037, -1.9336] },
	{ keywords: ["kacyiru"], position: [30.0706, -1.9367] },
	{ keywords: ["kiyovu"], position: [30.0619, -1.9548] },
	{ keywords: ["kibagabaga"], position: [30.113, -1.937] },
	{ keywords: ["gacuriro"], position: [30.092, -1.925] },
	{ keywords: ["remera"], position: [30.102, -1.959] },
	{ keywords: ["kanombe"], position: [30.137, -1.972] },
	{ keywords: ["kicukiro"], position: [30.103, -2.001] },
	{ keywords: ["kagugu"], position: [30.083, -1.911] },
];

const airbnbDetailMapStyle: StyleSpecification = {
	version: 8,
	sources: {
		"osm-street-raster": {
			type: "raster",
			tiles: ["/api/map-tiles/osm/{z}/{x}/{y}"],
			tileSize: 256,
			attribution: "© OpenStreetMap contributors",
		},
	},
	layers: [
		{
			id: "street-map-background",
			type: "background",
			paint: {
				"background-color": "#eef0f6",
			},
		},
		{
			id: "osm-street-raster",
			type: "raster",
			source: "osm-street-raster",
			minzoom: 0,
			maxzoom: 20,
			paint: {
				"raster-opacity": 0.96,
				"raster-saturation": -0.18,
				"raster-contrast": 0.06,
			},
		},
	],
};

export function AirbnbListingDetailPage({ listingId }: { listingId: string }) {
	const listingQuery = useQuery({
		queryKey: ["public-airbnb-listing-detail", listingId],
		queryFn: () => getAirbnbListing(listingId),
	});

	if (listingQuery.isPending) {
		return <AirbnbListingDetailSkeleton />;
	}

	if (listingQuery.isError || !listingQuery.data?.product) {
		return <AirbnbListingDetailError onRetry={() => listingQuery.refetch()} />;
	}

	return <AirbnbListingDetail listing={listingQuery.data.product} />;
}

function AirbnbListingDetail({ listing }: { listing: PublicListing }) {
	const [activeTab, setActiveTab] = useState<AirbnbDetailTab>("overview");
	const gallery = useMemo(() => buildGallery(listing), [listing]);
	const [activeImageId, setActiveImageId] = useState(
		gallery[0]?.id ?? "fallback",
	);
	const [gallerySwiper, setGallerySwiper] = useState<SwiperInstance | null>(
		null,
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
			label: "Entire place",
			value: details ? formatBoolean(details.entirePlace) : "Not listed",
			icon: Home,
		},
		{
			label: "Self check-in",
			value: details ? formatBoolean(details.selfCheckIn) : "Not listed",
			icon: KeyRound,
		},
		{
			label: "Cleaning fee",
			value: details?.cleaningFee
				? formatMoney(details.cleaningFee, listing.currency)
				: "Not listed",
			icon: Sparkles,
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
			label: "Pets",
			value: details ? formatBoolean(details.allowPets) : "Not listed",
		},
		{
			label: "Smoking",
			value: details ? formatBoolean(details.allowSmoking) : "Not listed",
		},
		{
			label: "Parties",
			value: details ? formatBoolean(details.allowParties) : "Not listed",
		},
		{
			label: "House notes",
			value: details?.houseRules ? "Provided" : "Not listed",
		},
	];

	return (
		<main className={styles.page}>
			<header className={styles.hero}>
				<div className={styles.heroCopy}>
					<h1>{listing.title}</h1>
					<p>
						<MapPin aria-hidden="true" />
						{locationLabel}
					</p>
				</div>
				<div className={styles.heroMetrics} aria-label="Airbnb highlights">
					<span>{details?.bedrooms ?? "..."} Bedrooms</span>
					<span>{details?.maxGuests ?? "..."} Guests</span>
					<span>
						{listing.ratingAverage ? listing.ratingAverage.toFixed(1) : "New"}{" "}
						Rating
					</span>
				</div>
			</header>

			<section className={styles.layout}>
				<div className={styles.mainColumn}>
					<section className={styles.galleryPanel}>
						<Swiper
							className={styles.swiper}
							modules={[Autoplay, Navigation, Pagination]}
							loop={gallery.length > 1}
							navigation={gallery.length > 1}
							pagination={{ clickable: true }}
							autoplay={
								gallery.length > 1
									? { delay: 4500, disableOnInteraction: false }
									: false
							}
							onSwiper={setGallerySwiper}
							onSlideChange={(swiper) => {
								const nextImage = gallery[swiper.realIndex];

								if (nextImage) {
									setActiveImageId(nextImage.id);
								}
							}}
						>
							{gallery.map((image, index) => (
								<SwiperSlide key={image.id}>
									<div className={styles.primaryImage}>
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
						<div className={styles.galleryRail}>
							{gallery.slice(0, 5).map((image, index) => (
								<button
									key={image.id}
									type="button"
									data-active={image.id === activeImageId}
									onClick={() => {
										setActiveImageId(image.id);
										gallerySwiper?.slideToLoop(index);
									}}
								>
									<Image src={image.src} alt={image.alt} fill sizes="8rem" />
								</button>
							))}
						</div>
					</section>

					<section className={styles.storyPanel}>
						<div
							className={styles.tabs}
							role="tablist"
							aria-label="Airbnb details"
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

					<AirbnbDatePlanner
						today={today}
						dateRange={dateRange}
						fromDate={fromDate}
						toDate={toDate}
						formattedRange={formattedRange}
						onDateRangeChange={setDateRange}
					/>

					<AirbnbReviewSection listing={listing} />

					<AirbnbLocationMap listing={listing} locationLabel={locationLabel} />
				</div>

				<AirbnbBookingSidebar
					listing={listing}
					fromDate={fromDate}
					toDate={toDate}
					stayNights={stayNights}
					totalPrice={totalPrice}
					formattedRange={formattedRange}
				/>
			</section>
		</main>
	);
}

function AirbnbLocationMap({
	listing,
	locationLabel,
}: {
	listing: PublicListing;
	locationLabel: string;
}) {
	const latitude = Number(listing.location?.latitude);
	const longitude = Number(listing.location?.longitude);
	const hasExactPosition = isValidCoordinatePair(longitude, latitude);
	const fallbackPosition = getFallbackPosition(listing);
	const mapPosition = hasExactPosition
		? { longitude, latitude, isApproximate: false }
		: fallbackPosition
			? {
					longitude: fallbackPosition[0],
					latitude: fallbackPosition[1],
					isApproximate: true,
				}
			: null;
	const mapCenter: [number, number] = mapPosition
		? [mapPosition.longitude, mapPosition.latitude]
		: kigaliCenter;
	const directionsUrl = hasExactPosition
		? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
		: null;

	return (
		<section className={styles.mapSection} aria-label="Airbnb map location">
			<div className={styles.mapHeader}>
				<div>
					<span>
						<MapPin aria-hidden="true" />
						Map location
					</span>
					<h2>{locationLabel}</h2>
				</div>
				{directionsUrl ? (
					<a href={directionsUrl} target="_blank" rel="noreferrer">
						<MapPin aria-hidden="true" />
						Open directions
					</a>
				) : null}
			</div>

			<div
				className={styles.mapCanvas}
				data-exact={hasExactPosition}
				data-approximate={Boolean(mapPosition?.isApproximate)}
			>
				{mapPosition ? (
					<Map
						className={styles.mapViewport}
						center={mapCenter}
						zoom={mapPosition.isApproximate ? 12.3 : 14.2}
						pitch={22}
						bearing={-4}
						theme="light"
						styles={{
							light: airbnbDetailMapStyle,
							dark: airbnbDetailMapStyle,
						}}
					>
						<MapControls
							position="top-right"
							showCompass
							showFullscreen
							className={styles.mapControls}
						/>
						<MapMarker
							longitude={mapPosition.longitude}
							latitude={mapPosition.latitude}
						>
							<MarkerContent className={styles.markerPortal}>
								<span
									className={styles.locationMarker}
									data-approximate={mapPosition.isApproximate}
								>
									<MapPin aria-hidden="true" />
								</span>
							</MarkerContent>
						</MapMarker>
					</Map>
				) : (
					<div className={styles.mapUnavailable}>
						<MapPin aria-hidden="true" />
						<strong>Map coordinates unavailable</strong>
						<p>
							The partner has not attached exact coordinates to this stay yet.
							Confirm arrival details before check-in.
						</p>
					</div>
				)}
				{mapPosition?.isApproximate ? (
					<div className={styles.mapApproximateNote}>
						<MapPin aria-hidden="true" />
						<span>
							Approximate area based on the listing location. Confirm the exact
							address before check-in.
						</span>
					</div>
				) : null}
			</div>
		</section>
	);
}

function AirbnbDatePlanner({
	today,
	dateRange,
	fromDate,
	toDate,
	formattedRange,
	onDateRangeChange,
}: {
	today: Date;
	dateRange: DateRange | undefined;
	fromDate?: Date;
	toDate?: Date;
	formattedRange: string;
	onDateRangeChange: (range: DateRange | undefined) => void;
}) {
	return (
		<section className={styles.datePlanner}>
			<div className={styles.datePlannerHeader}>
				<div>
					<span>
						<CalendarDays aria-hidden="true" />
						Stay dates
					</span>
					<p>{formattedRange}</p>
				</div>
				<div className={styles.datePreview}>
					<div>
						<span>Check-in</span>
						<strong>
							{fromDate ? format(fromDate, "M/d/yyyy") : "Add date"}
						</strong>
					</div>
					<div>
						<span>Checkout</span>
						<strong>{toDate ? format(toDate, "M/d/yyyy") : "Add date"}</strong>
					</div>
				</div>
			</div>

			<div className={styles.calendarShell}>
				<Calendar
					mode="range"
					numberOfMonths={2}
					selected={dateRange}
					onSelect={onDateRangeChange}
					disabled={{ before: today }}
					className={styles.calendar}
					showOutsideDays={false}
				/>
			</div>

			<button
				type="button"
				className={styles.clearDatesButton}
				onClick={() =>
					onDateRangeChange({
						from: addDays(today, 1),
						to: addDays(today, 4),
					})
				}
			>
				Clear dates
			</button>
		</section>
	);
}

function AirbnbBookingSidebar({
	listing,
	fromDate,
	toDate,
	stayNights,
	totalPrice,
	formattedRange,
}: {
	listing: PublicListing;
	fromDate?: Date;
	toDate?: Date;
	stayNights: number;
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
			<section className={styles.bookingPanel}>
				<span>
					<CalendarCheck aria-hidden="true" />
					Private stay booking
				</span>
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
						for {stayNights} {stayNights === 1 ? "night" : "nights"}
					</small>
				</div>
				<p className={styles.rangeSummary}>{formattedRange}</p>
				<div className={styles.datePreview}>
					<div>
						<span>Check-in</span>
						<strong>
							{fromDate ? format(fromDate, "M/d/yyyy") : "Add date"}
						</strong>
					</div>
					<div>
						<span>Checkout</span>
						<strong>{toDate ? format(toDate, "M/d/yyyy") : "Add date"}</strong>
					</div>
				</div>
				{currentUser ? (
					<Button type="button" className={styles.reserveButton}>
						<DoorOpen aria-hidden="true" />
						Reserve stay
					</Button>
				) : (
					<button
						type="button"
						className={styles.loginPrompt}
						onClick={() => setIsLoginDialogOpen(true)}
					>
						Sign in to reserve
						<DoorOpen aria-hidden="true" />
					</button>
				)}
				<p>You will review the final booking details before paying.</p>
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

function AirbnbListingDetailSkeleton() {
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
				<div className={styles.mainColumn}>
					<section className={styles.galleryPanel}>
						<div className={styles.skeletonSwiperFrame}>
							<Skeleton className={styles.skeletonHeroImage} />
							<Skeleton className={styles.skeletonGalleryButtonLeft} />
							<Skeleton className={styles.skeletonGalleryButtonRight} />
							<div className={styles.skeletonDots}>
								<Skeleton />
								<Skeleton />
								<Skeleton />
							</div>
						</div>
						<div className={styles.galleryRail}>
							{Array.from({ length: 5 }).map((_, index) => (
								<Skeleton key={index} className={styles.skeletonThumb} />
							))}
						</div>
					</section>
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
					<section className={styles.datePlanner}>
						<div className={styles.datePlannerHeader}>
							<div>
								<Skeleton className={styles.skeletonSectionLabel} />
								<Skeleton className={styles.skeletonDateText} />
							</div>
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
						</div>
						<div className={styles.calendarShell}>
							<div className={styles.skeletonCalendar}>
								{Array.from({ length: 2 }).map((_, monthIndex) => (
									<div key={monthIndex} className={styles.skeletonMonth}>
										<Skeleton className={styles.skeletonMonthTitle} />
										<div className={styles.skeletonWeekdays}>
											{Array.from({ length: 7 }).map((__, index) => (
												<Skeleton key={index} />
											))}
										</div>
										<div className={styles.skeletonDays}>
											{Array.from({ length: 35 }).map((__, index) => (
												<Skeleton key={index} />
											))}
										</div>
									</div>
								))}
							</div>
						</div>
						<Skeleton className={styles.skeletonClearDates} />
					</section>
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
					<section className={styles.mapSection}>
						<div className={styles.mapHeader}>
							<div>
								<Skeleton className={styles.skeletonSectionLabel} />
								<Skeleton className={styles.skeletonParagraphShort} />
							</div>
							<Skeleton className={styles.skeletonBackLink} />
						</div>
						<Skeleton className={styles.skeletonMap} />
					</section>
				</div>
				<aside className={styles.sidebar}>
					<section className={styles.bookingPanel}>
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
						<Skeleton className={styles.skeletonReserveButton} />
						<Skeleton className={styles.skeletonChargeNote} />
					</section>
					<ListingVerifiedPartnerCardSkeleton />
				</aside>
			</section>
		</main>
	);
}

function AirbnbListingDetailError({ onRetry }: { onRetry: () => void }) {
	return (
		<main className={styles.page}>
			<section className={styles.statePanel}>
				<RefreshCcw aria-hidden="true" />
				<h1>Airbnb stay unavailable</h1>
				<p>
					This stay may have been removed, paused, or moved to another category.
				</p>
				<div>
					<Button type="button" onClick={onRetry}>
						<RefreshCcw aria-hidden="true" />
						Retry
					</Button>
					<Link href="/listings/airbnb">
						<ArrowLeft aria-hidden="true" />
						Back to Airbnb homes
					</Link>
				</div>
			</section>
		</main>
	);
}

function buildGallery(listing: PublicListing) {
	const coverImage = getListingCoverImage(listing);
	const images = listing.images
		.filter((image) => Boolean(image.file.publicUrl))
		.map((image) => ({
			id: image.id,
			src: image.file.publicUrl ?? "/hero/hero.jpg",
			alt: image.altText ?? listing.title,
		}));

	if (!images.length) {
		return [
			{
				id: "fallback",
				src: "/hero/hero.jpg",
				alt: "Pluto Booking Airbnb stay",
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

function isValidCoordinatePair(longitude: number, latitude: number) {
	return (
		Number.isFinite(latitude) &&
		Number.isFinite(longitude) &&
		latitude >= -90 &&
		latitude <= 90 &&
		longitude >= -180 &&
		longitude <= 180
	);
}

function getFallbackPosition(listing: PublicListing): [number, number] | null {
	const searchableText = [
		listing.title,
		listing.shortDescription,
		listing.description,
		listing.location?.name,
		listing.location?.addressLine,
		listing.location?.city,
		listing.city,
	]
		.filter(Boolean)
		.join(" ")
		.toLowerCase();
	const neighborhood = kigaliNeighborhoods.find((item) =>
		item.keywords.some((keyword) => searchableText.includes(keyword)),
	);

	if (neighborhood) {
		return neighborhood.position;
	}

	if (
		[
			listing.location?.city,
			listing.city,
			listing.location?.country,
			listing.country,
		]
			.filter(Boolean)
			.join(" ")
			.toLowerCase()
			.includes("kigali")
	) {
		return deterministicKigaliOffset(listing.id);
	}

	return null;
}

function deterministicKigaliOffset(listingId: string): [number, number] {
	const hash = Array.from(listingId).reduce(
		(total, char) => total + char.charCodeAt(0),
		0,
	);
	const angle = (hash % 360) * (Math.PI / 180);
	const radius = 0.012 + (hash % 9) * 0.002;

	return [
		Number((kigaliCenter[0] + Math.cos(angle) * radius).toFixed(6)),
		Number((kigaliCenter[1] + Math.sin(angle) * radius).toFixed(6)),
	];
}
