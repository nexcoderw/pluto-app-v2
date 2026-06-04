"use client";

import {
	useMemo,
	useState,
	useSyncExternalStore,
	type CSSProperties,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
	ArrowLeft,
	Bath,
	BedDouble,
	Building2,
	CalendarCheck,
	CheckCircle2,
	DoorOpen,
	Home,
	MapPin,
	RefreshCcw,
	ShieldCheck,
	Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserAuthProfile } from "@/services/api/auth";
import {
	getApartmentListing,
	type PublicListing,
} from "@/services/api/listings";
import {
	getCachedUserProfile,
	hasKnownUserSession,
	subscribeToUserSession,
} from "@/services/api/token-store";
import {
	formatBoolean,
	formatMoney,
	formatOptional,
	formatPricingUnit,
	getListingCoverImage,
} from "../listing-formatters";
import { ApartmentReviewSection } from "./apartment-review-section";
import styles from "./apartment-listing-detail-page.module.css";

type ApartmentDetailTab = "overview" | "amenities" | "location";

const detailTabs: Array<{ value: ApartmentDetailTab; label: string }> = [
	{ value: "overview", label: "Overview" },
	{ value: "amenities", label: "Amenities" },
	{ value: "location", label: "Location" },
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
			<ApartmentListingDetailError onRetry={() => listingQuery.refetch()} />
		);
	}

	return <ApartmentListingDetail listing={listingQuery.data.product} />;
}

function ApartmentListingDetail({ listing }: { listing: PublicListing }) {
	const [activeTab, setActiveTab] = useState<ApartmentDetailTab>("overview");
	const gallery = useMemo(() => buildGallery(listing), [listing]);
	const [activeImageId, setActiveImageId] = useState(
		gallery[0]?.id ?? "fallback",
	);
	const activeImage =
		gallery.find((image) => image.id === activeImageId) ?? gallery[0];
	const details = listing.apartmentDetails;
	const locationLabel =
		listing.location?.addressLine ?? `${listing.city}, ${listing.country}`;
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
					<Link href="/listings/apartments" className={styles.backLink}>
						<ArrowLeft aria-hidden="true" />
						Back to apartments
					</Link>
					<span className={styles.eyebrow}>
						<Building2 aria-hidden="true" />
						Verified apartment stay
					</span>
					<h1>{listing.title}</h1>
					<p>
						<MapPin aria-hidden="true" />
						{locationLabel}
					</p>
				</div>
				<div className={styles.heroMetrics} aria-label="Apartment highlights">
					<span>
						<strong>{details?.bedrooms ?? "..."}</strong>
						Bedrooms
					</span>
					<span>
						<strong>{details?.maxGuests ?? "..."}</strong>
						Guests
					</span>
					<span>
						<strong>
							{listing.ratingAverage ? listing.ratingAverage.toFixed(1) : "New"}
						</strong>
						Rating
					</span>
				</div>
			</header>

			<section className={styles.layout}>
				<div className={styles.mainColumn}>
					<section className={styles.galleryPanel}>
						<div className={styles.primaryImage}>
							<Image
								src={activeImage.src}
								alt={activeImage.alt}
								fill
								sizes="(max-width: 900px) 100vw, 64vw"
								priority
							/>
						</div>
						<div className={styles.galleryRail}>
							{gallery.slice(0, 5).map((image) => (
								<button
									key={image.id}
									type="button"
									data-active={image.id === activeImage.id}
									onClick={() => setActiveImageId(image.id)}
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
									<h2>Designed for comfortable stays in {listing.city}</h2>
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
									<h2>Useful details before you reserve</h2>
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

						{activeTab === "location" ? (
							<section className={styles.tabPanel}>
								<div className={styles.sectionHeader}>
									<span>Location</span>
									<h2>{locationLabel}</h2>
								</div>
								<div className={styles.locationPanel}>
									<div>
										<MapPin aria-hidden="true" />
										<strong>{listing.city}</strong>
										<span>{listing.country}</span>
									</div>
									<p>
										The exact apartment address and arrival instructions should
										be confirmed through Pluto Booking before check-in.
									</p>
								</div>
							</section>
						) : null}
					</section>

					<ApartmentReviewSection listing={listing} />
				</div>

				<ApartmentBookingSidebar listing={listing} />
			</section>
		</main>
	);
}

function ApartmentBookingSidebar({ listing }: { listing: PublicListing }) {
	const currentUser = useSyncExternalStore(
		(onStoreChange) => subscribeToUserSession(() => onStoreChange()),
		getUserSessionSnapshot,
		() => null,
	);
	const partnerInitials = getInitials(listing.owner.fullName);
	const partnerImageStyle =
		listing.owner.imageKey && listing.owner.imageKey.startsWith("http")
			? ({
					"--partner-avatar-image": `url("${listing.owner.imageKey}")`,
				} as CSSProperties)
			: undefined;

	return (
		<aside className={styles.sidebar}>
			<section className={styles.bookingPanel}>
				<span>
					<CalendarCheck aria-hidden="true" />
					Apartment booking
				</span>
				<div className={styles.priceLine}>
					<strong>{formatMoney(listing.basePrice, listing.currency)}</strong>
					<small>per {formatPricingUnit(listing.pricingUnit)}</small>
				</div>
				<div className={styles.datePreview}>
					<div>
						<span>Check-in</span>
						<strong>Add date</strong>
					</div>
					<div>
						<span>Checkout</span>
						<strong>Add date</strong>
					</div>
				</div>
				{currentUser ? (
					<Button type="button" className={styles.reserveButton}>
						<DoorOpen aria-hidden="true" />
						Reserve apartment
					</Button>
				) : (
					<Link href="/login" className={styles.loginPrompt}>
						Sign in to reserve
						<DoorOpen aria-hidden="true" />
					</Link>
				)}
				<p>You will review the final booking details before paying.</p>
			</section>

			<section className={styles.partnerPanel}>
				<span>
					<ShieldCheck aria-hidden="true" />
					Verified partner
				</span>
				<div className={styles.partnerIdentity}>
					<i
						className={styles.partnerAvatar}
						data-has-image={Boolean(partnerImageStyle)}
						style={partnerImageStyle}
						aria-hidden="true"
					>
						{partnerImageStyle ? null : partnerInitials}
					</i>
					<strong>{listing.owner.fullName}</strong>
				</div>
				<p>This partner completed Pluto Booking review before publishing.</p>
			</section>
		</aside>
	);
}

function ApartmentListingDetailSkeleton() {
	return (
		<main className={styles.page} aria-busy="true">
			<header className={styles.hero}>
				<div className={styles.heroCopy}>
					<Skeleton className={styles.skeletonBackLink} />
					<Skeleton className={styles.skeletonEyebrow} />
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
						<Skeleton className={styles.skeletonHeroImage} />
						<div className={styles.galleryRail}>
							{Array.from({ length: 5 }).map((_, index) => (
								<Skeleton key={index} className={styles.skeletonThumb} />
							))}
						</div>
					</section>
					<Skeleton className={styles.skeletonPanel} />
					<Skeleton className={styles.skeletonPanelLarge} />
				</div>
				<aside className={styles.sidebar}>
					<Skeleton className={styles.skeletonBooking} />
					<Skeleton className={styles.skeletonPartner} />
				</aside>
			</section>
		</main>
	);
}

function ApartmentListingDetailError({ onRetry }: { onRetry: () => void }) {
	return (
		<main className={styles.page}>
			<section className={styles.statePanel}>
				<RefreshCcw aria-hidden="true" />
				<h1>Apartment unavailable</h1>
				<p>
					This apartment may have been removed, paused, or moved to another
					category.
				</p>
				<div>
					<Button type="button" onClick={onRetry}>
						<RefreshCcw aria-hidden="true" />
						Retry
					</Button>
					<Link href="/listings/apartments">
						<ArrowLeft aria-hidden="true" />
						Back to apartments
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
				alt: "Pluto Booking apartment",
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

function getInitials(value: string) {
	const [first = "P", second = "B"] = value.trim().split(/\s+/).filter(Boolean);

	return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
}
