"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	ArrowLeft,
	BedDouble,
	CalendarCheck,
	CheckCircle2,
	DoorOpen,
	Hotel,
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
	getHotelRoomListing,
	type PublicListing,
} from "@/services/api/listings";
import {
	formatBoolean,
	formatMoney,
	formatOptional,
	formatPricingUnit,
	getListingCoverImage,
} from "../listing-formatters";
import styles from "./hotel-room-listing-detail-page.module.css";

export function HotelRoomListingDetailPage({
	listingId,
}: {
	listingId: string;
}) {
	const listingQuery = useQuery({
		queryKey: ["public-hotel-room-listing-detail", listingId],
		queryFn: () => getHotelRoomListing(listingId),
	});

	if (listingQuery.isPending) return <HotelRoomListingDetailSkeleton />;

	if (listingQuery.isError || !listingQuery.data?.product) {
		return (
			<HotelRoomListingDetailError onRetry={() => listingQuery.refetch()} />
		);
	}

	return <HotelRoomListingDetail listing={listingQuery.data.product} />;
}

function HotelRoomListingDetail({ listing }: { listing: PublicListing }) {
	const coverImage = getListingCoverImage(listing);
	const [activeImage, setActiveImage] = useState(
		coverImage?.file.publicUrl ?? null,
	);
	const heroImage = activeImage ?? coverImage?.file.publicUrl ?? null;
	const details = listing.hotelRoomDetails;
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
			{
				label: "Check-in",
				value: formatOptional(details?.checkInTime),
				icon: CalendarCheck,
			},
			{
				label: "Breakfast",
				value: details
					? formatBoolean(details.breakfastIncluded)
					: "Not listed",
				icon: CheckCircle2,
			},
		],
		[details],
	);
	const amenities = [
		{ label: "Check-out", value: formatOptional(details?.checkOutTime) },
		{
			label: "Room size",
			value: details?.roomSizeSqm ? `${details.roomSizeSqm} sqm` : "Not listed",
		},
		{
			label: "Private bathroom",
			value: details ? formatBoolean(details.hasPrivateBathroom) : "Not listed",
		},
		{
			label: "Air conditioning",
			value: details ? formatBoolean(details.hasAirConditioning) : "Not listed",
		},
	];

	return (
		<main className={styles.page}>
			<header className={styles.header}>
				<div>
					<Link href="/listings/hotel-rooms" className={styles.backLink}>
						<ArrowLeft aria-hidden="true" />
						Back to hotel rooms
					</Link>
					<span className={styles.eyebrow}>
						<Hotel aria-hidden="true" />
						Verified hotel room
					</span>
					<h1>{listing.title}</h1>
					<p>
						<MapPin aria-hidden="true" />
						{listing.location?.addressLine ??
							`${listing.city}, ${listing.country}`}
					</p>
				</div>
				<div className={styles.pricePanel}>
					<span>Starting from</span>
					<strong>{formatMoney(listing.basePrice, listing.currency)}</strong>
					<small>per {formatPricingUnit(listing.pricingUnit)}</small>
				</div>
			</header>

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
							<h2>Hotel room experience</h2>
						</div>
						<p>
							{listing.description ??
								listing.shortDescription ??
								"This approved Pluto Booking hotel room is ready for customer review."}
						</p>
					</section>

					<section className={styles.factsPanel}>
						<div className={styles.sectionHeader}>
							<span>Room details</span>
							<h2>Stay setup</h2>
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

					<section className={styles.policyPanel}>
						<div className={styles.sectionHeader}>
							<span>Amenities</span>
							<h2>Room inclusions</h2>
						</div>
						<div className={styles.policyGrid}>
							{amenities.map((amenity) => (
								<div key={amenity.label}>
									<span>{amenity.label}</span>
									<strong>{amenity.value}</strong>
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
							hotel room.
						</p>
					</section>
				</aside>
			</section>
		</main>
	);
}

function HotelRoomListingDetailSkeleton() {
	return (
		<main className={styles.page}>
			<Link href="/listings/hotel-rooms" className={styles.backLink}>
				<ArrowLeft aria-hidden="true" />
				Back to hotel rooms
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

function HotelRoomListingDetailError({ onRetry }: { onRetry: () => void }) {
	return (
		<main className={styles.page}>
			<section className={styles.statePanel}>
				<RefreshCcw aria-hidden="true" />
				<h1>Hotel room unavailable</h1>
				<p>
					This room may have been removed, paused, or moved to another category.
				</p>
				<div>
					<Button type="button" onClick={onRetry}>
						<RefreshCcw aria-hidden="true" />
						Retry
					</Button>
					<Link href="/listings/hotel-rooms">
						<ArrowLeft aria-hidden="true" />
						Back to hotel rooms
					</Link>
				</div>
			</section>
		</main>
	);
}
