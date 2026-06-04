"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
	Bath,
	BedDouble,
	CheckCircle2,
	Home,
	MapPin,
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
import { Skeleton } from "@/components/ui/skeleton";
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
import { ListingDetailErrorState } from "../listing-detail-error-state";
import {
	ListingLocationMap,
	ListingLocationMapSkeleton,
} from "../listing-location-map";
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

	if (listingQuery.isError || !listingQuery.data?.product) {
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
		<main className={styles.page}>
			<header className={styles.hero}>
				<div className={styles.heroCopy}>
					<h1>{listing.title}</h1>
					<p>
						<MapPin aria-hidden="true" />
						{locationLabel}
					</p>
				</div>
				<div className={styles.heroMetrics} aria-label="Apartment highlights">
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
				</div>

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
			</section>
		</main>
	);
}

function ApartmentListingDetailSkeleton() {
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
				</div>
				<ListingBookingSidebarSkeleton />
			</section>
		</main>
	);
}
