"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	ArrowLeft,
	Bath,
	BedDouble,
	BriefcaseBusiness,
	CalendarCheck,
	CarFront,
	CheckCircle2,
	DoorOpen,
	Fuel,
	Hotel,
	House,
	ImageIcon,
	MapPin,
	RefreshCcw,
	ShieldCheck,
	Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	getAirbnbListing,
	getApartmentListing,
	getCarListing,
	getHotelRoomListing,
	type ListingCategorySlug,
	type PublicListing,
} from "@/services/api/listings";
import {
	formatBoolean,
	formatMoney,
	formatOptional,
	formatPricingUnit,
	getListingCoverImage,
} from "./listing-formatters";
import styles from "./public-listing-detail-page.module.css";

type DetailConfig = {
	label: string;
	backHref: string;
	backLabel: string;
	getListing: (listingId: string) => Promise<{ product: PublicListing }>;
};

const detailConfigs = {
	cars: {
		label: "Car listing",
		backHref: "/listings/cars",
		backLabel: "Back to cars",
		getListing: getCarListing,
	},
	apartments: {
		label: "Apartment listing",
		backHref: "/listings/apartments",
		backLabel: "Back to apartments",
		getListing: getApartmentListing,
	},
	"hotel-rooms": {
		label: "Hotel room listing",
		backHref: "/listings/hotel-rooms",
		backLabel: "Back to hotel rooms",
		getListing: getHotelRoomListing,
	},
	airbnb: {
		label: "AirBnB listing",
		backHref: "/listings/airbnb",
		backLabel: "Back to AirBnB homes",
		getListing: getAirbnbListing,
	},
} satisfies Record<ListingCategorySlug, DetailConfig>;

export function PublicListingDetailPage({
	categorySlug,
	listingId,
}: {
	categorySlug: ListingCategorySlug;
	listingId: string;
}) {
	const config = detailConfigs[categorySlug];
	const listingQuery = useQuery({
		queryKey: ["public-listing-detail", categorySlug, listingId],
		queryFn: () => config.getListing(listingId),
	});

	if (listingQuery.isPending) {
		return <ListingDetailSkeleton backHref={config.backHref} />;
	}

	if (listingQuery.isError || !listingQuery.data?.product) {
		return (
			<main className={styles.page}>
				<section className={styles.statePanel}>
					<RefreshCcw aria-hidden="true" />
					<h1>Listing unavailable</h1>
					<p>
						This listing may have been removed, paused, or moved to another
						category.
					</p>
					<div>
						<Button type="button" onClick={() => listingQuery.refetch()}>
							<RefreshCcw aria-hidden="true" />
							Retry
						</Button>
						<Link href={config.backHref}>
							<ArrowLeft aria-hidden="true" />
							{config.backLabel}
						</Link>
					</div>
				</section>
			</main>
		);
	}

	return <ListingDetail listing={listingQuery.data.product} config={config} />;
}

function ListingDetail({
	listing,
	config,
}: {
	listing: PublicListing;
	config: DetailConfig;
}) {
	const coverImage = getListingCoverImage(listing);
	const initialImage = coverImage?.file.publicUrl ?? null;
	const [activeImage, setActiveImage] = useState(initialImage);
	const facts = useMemo(() => buildListingFacts(listing), [listing]);
	const heroImage = activeImage ?? initialImage;

	return (
		<main className={styles.page}>
			<div className={styles.header}>
				<div>
					<Link href={config.backHref} className={styles.backLink}>
						<ArrowLeft aria-hidden="true" />
						{config.backLabel}
					</Link>
					<span className={styles.eyebrow}>
						<ShieldCheck aria-hidden="true" />
						{config.label}
					</span>
					<h1>{listing.title}</h1>
					<p>
						<MapPin aria-hidden="true" />
						{listing.city}, {listing.country}
					</p>
				</div>
				<div className={styles.pricePanel}>
					<span>Starting from</span>
					<strong>{formatMoney(listing.basePrice, listing.currency)}</strong>
					<small>per {formatPricingUnit(listing.pricingUnit)}</small>
				</div>
			</div>

			<section className={styles.layout}>
				<div className={styles.mainColumn}>
					<section className={styles.gallery}>
						<div className={styles.heroImage}>
							{heroImage ? (
								<Image
									src={heroImage}
									alt={coverImage?.altText ?? listing.title}
									fill
									sizes="(max-width: 900px) 100vw, 62vw"
									priority
								/>
							) : (
								<span>
									<ImageIcon aria-hidden="true" />
									Image coming soon
								</span>
							)}
						</div>
						{listing.images.length > 1 ? (
							<div className={styles.thumbnails}>
								{listing.images.map((image) => {
									const imageUrl = image.file.publicUrl;

									return (
										<button
											key={image.id}
											type="button"
											disabled={!imageUrl}
											data-active={imageUrl === heroImage}
											onClick={() => imageUrl && setActiveImage(imageUrl)}
										>
											{imageUrl ? (
												<Image
													src={imageUrl}
													alt={image.altText ?? listing.title}
													fill
													sizes="8rem"
												/>
											) : (
												<ImageIcon aria-hidden="true" />
											)}
										</button>
									);
								})}
							</div>
						) : null}
					</section>

					<section className={styles.descriptionPanel}>
						<div className={styles.sectionHeader}>
							<span>Overview</span>
							<h2>What customers should know</h2>
						</div>
						<p>
							{listing.description ??
								listing.shortDescription ??
								"This approved Pluto Booking listing is ready for customer review."}
						</p>
					</section>

					<section className={styles.factsPanel}>
						<div className={styles.sectionHeader}>
							<span>Details</span>
							<h2>Category information</h2>
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
					</section>
				</div>

				<aside className={styles.sidebar}>
					<section className={styles.bookingPanel}>
						<span>
							<CalendarCheck aria-hidden="true" />
							Ready for booking
						</span>
						<h2>{formatMoney(listing.basePrice, listing.currency)}</h2>
						<p>per {formatPricingUnit(listing.pricingUnit)}</p>
						<Link href="/login">
							Sign in to book
							<CalendarCheck aria-hidden="true" />
						</Link>
					</section>

					<section className={styles.partnerPanel}>
						<span>
							<ShieldCheck aria-hidden="true" />
							Verified partner
						</span>
						<strong>{listing.owner.fullName}</strong>
						<p>
							This partner completed Pluto Booking review before publishing this
							listing.
						</p>
					</section>
				</aside>
			</section>
		</main>
	);
}

function ListingDetailSkeleton({ backHref }: { backHref: string }) {
	return (
		<main className={styles.page}>
			<Link href={backHref} className={styles.backLink}>
				<ArrowLeft aria-hidden="true" />
				Back to listings
			</Link>
			<section className={styles.layout}>
				<div className={styles.mainColumn}>
					<Skeleton className={styles.skeletonHero} />
					<Skeleton className={styles.skeletonLine} />
					<Skeleton className={styles.skeletonText} />
					<Skeleton className={styles.skeletonText} />
				</div>
				<aside className={styles.sidebar}>
					<Skeleton className={styles.skeletonPanel} />
				</aside>
			</section>
		</main>
	);
}

function buildListingFacts(listing: PublicListing) {
	if (listing.carDetails) {
		const details = listing.carDetails;

		return [
			{
				label: "Vehicle",
				value: `${details.brand} ${details.model}`,
				icon: CarFront,
			},
			{ label: "Year", value: String(details.year), icon: CalendarCheck },
			{
				label: "Transmission",
				value: details.transmission,
				icon: BriefcaseBusiness,
			},
			{ label: "Fuel", value: details.fuelType, icon: Fuel },
			{ label: "Seats", value: `${details.seats}`, icon: Users },
			{
				label: "Driver included",
				value: formatBoolean(details.driverIncluded),
				icon: CheckCircle2,
			},
		];
	}

	if (listing.apartmentDetails) {
		const details = listing.apartmentDetails;

		return [
			{ label: "Bedrooms", value: `${details.bedrooms}`, icon: BedDouble },
			{ label: "Bathrooms", value: `${details.bathrooms}`, icon: Bath },
			{ label: "Guests", value: `${details.maxGuests}`, icon: Users },
			{
				label: "Furnished",
				value: formatBoolean(details.furnished),
				icon: CheckCircle2,
			},
			{ label: "WiFi", value: formatBoolean(details.wifi), icon: CheckCircle2 },
			{
				label: "Parking",
				value: formatBoolean(details.parking),
				icon: CheckCircle2,
			},
		];
	}

	if (listing.hotelRoomDetails) {
		const details = listing.hotelRoomDetails;

		return [
			{ label: "Hotel", value: details.hotelName, icon: Hotel },
			{ label: "Room type", value: details.roomType, icon: DoorOpen },
			{ label: "Bed type", value: details.bedType, icon: BedDouble },
			{ label: "Guests", value: `${details.maxGuests}`, icon: Users },
			{
				label: "Breakfast",
				value: formatBoolean(details.breakfastIncluded),
				icon: CheckCircle2,
			},
			{ label: "Check-in", value: details.checkInTime, icon: CalendarCheck },
		];
	}

	if (listing.airbnbDetails) {
		const details = listing.airbnbDetails;

		return [
			{ label: "House type", value: details.houseType, icon: House },
			{ label: "Bedrooms", value: `${details.bedrooms}`, icon: BedDouble },
			{ label: "Bathrooms", value: `${details.bathrooms}`, icon: Bath },
			{ label: "Guests", value: `${details.maxGuests}`, icon: Users },
			{
				label: "Entire place",
				value: formatBoolean(details.entirePlace),
				icon: CheckCircle2,
			},
			{
				label: "Rules",
				value: formatOptional(details.houseRules),
				icon: ShieldCheck,
			},
		];
	}

	return [
		{ label: "Category", value: listing.category, icon: ShieldCheck },
		{
			label: "Location",
			value: `${listing.city}, ${listing.country}`,
			icon: MapPin,
		},
	];
}
