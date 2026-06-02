"use client";

import Image from "next/image";
import Link from "next/link";
import {
	ArrowRight,
	BedDouble,
	CircleDollarSign,
	Coffee,
	DoorOpen,
	Hotel,
	MapPin,
	ShieldCheck,
	ShowerHead,
	Snowflake,
	Users,
} from "lucide-react";
import type { PublicListing } from "@/services/api/listings";
import {
	formatMoney,
	formatPricingUnit,
	getListingCoverImage,
} from "./listing-formatters";
import styles from "./hotel-room-listing-card.module.css";

type HotelRoomListingCardProps = {
	listing: PublicListing;
	detailHref: string;
};

export function HotelRoomListingCard({
	listing,
	detailHref,
}: HotelRoomListingCardProps) {
	const details = listing.hotelRoomDetails;
	const coverImage = getListingCoverImage(listing);
	const coverUrl = coverImage?.file.publicUrl;
	const roomLabel = details?.roomType ?? "Hotel room";

	return (
		<article className={styles.card}>
			<Link href={detailHref} className={styles.media}>
				{coverUrl ? (
					<Image
						src={coverUrl}
						alt={coverImage.altText ?? listing.title}
						fill
						sizes="(max-width: 720px) 100vw, (max-width: 1280px) 31vw, 22vw"
					/>
				) : (
					<span className={styles.emptyMedia}>
						<Hotel aria-hidden="true" />
						Room image pending
					</span>
				)}
				<span className={styles.statusPill}>
					<ShieldCheck aria-hidden="true" />
					Approved room
				</span>
			</Link>

			<div className={styles.body}>
				<div className={styles.heading}>
					<div>
						<p className={styles.roomType}>{roomLabel}</p>
						<h2>{listing.title}</h2>
					</div>
					<span className={styles.price}>
						<CircleDollarSign aria-hidden="true" />
						<strong>{formatMoney(listing.basePrice, listing.currency)}</strong>
						<small>/{formatPricingUnit(listing.pricingUnit)}</small>
					</span>
				</div>

				<p className={styles.location}>
					<MapPin aria-hidden="true" />
					{details?.hotelName ? `${details.hotelName} - ` : null}
					{listing.city}, {listing.country}
				</p>

				<ul className={styles.specs} aria-label="Hotel room highlights">
					<li>
						<BedDouble aria-hidden="true" />
						<strong>{details?.bedType ?? "Listed"}</strong>
						<span>Bed type</span>
					</li>
					<li>
						<Users aria-hidden="true" />
						<strong>{details?.maxGuests ?? "-"}</strong>
						<span>Guests</span>
					</li>
					<li>
						<DoorOpen aria-hidden="true" />
						<strong>{details?.checkInTime ?? "--"}</strong>
						<span>Check-in</span>
					</li>
				</ul>

				<div className={styles.amenities}>
					<span data-active={Boolean(details?.breakfastIncluded)}>
						<Coffee aria-hidden="true" />
						Breakfast
					</span>
					<span data-active={Boolean(details?.hasAirConditioning)}>
						<Snowflake aria-hidden="true" />
						Air conditioning
					</span>
					<span data-active={Boolean(details?.hasPrivateBathroom)}>
						<ShowerHead aria-hidden="true" />
						Private bath
					</span>
				</div>

				<Link href={detailHref} className={styles.detailsLink}>
					View room
					<ArrowRight aria-hidden="true" />
				</Link>
			</div>
		</article>
	);
}
