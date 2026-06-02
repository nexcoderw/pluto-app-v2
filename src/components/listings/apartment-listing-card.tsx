"use client";

import Image from "next/image";
import Link from "next/link";
import {
	Bath,
	BedDouble,
	Building2,
	MapPin,
	ShieldCheck,
	Users,
} from "lucide-react";
import type { PublicListing } from "@/services/api/listings";
import {
	formatMoney,
	formatPricingUnit,
	getListingCoverImage,
} from "./listing-formatters";
import styles from "./apartment-listing-card.module.css";

type ApartmentListingCardProps = {
	listing: PublicListing;
	detailHref: string;
};

type ApartmentDetailsWithGuestAlias = NonNullable<
	PublicListing["apartmentDetails"]
> & {
	guests?: number;
};

export function ApartmentListingCard({
	listing,
	detailHref,
}: ApartmentListingCardProps) {
	const details =
		listing.apartmentDetails as ApartmentDetailsWithGuestAlias | null;
	const coverImage = getListingCoverImage(listing);
	const coverUrl = coverImage?.file.publicUrl;
	const guestCount = details?.maxGuests ?? details?.guests;

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
						<Building2 aria-hidden="true" />
						Apartment image pending
					</span>
				)}
				<span className={styles.statusPill}>
					<ShieldCheck aria-hidden="true" />
					Verified stay
				</span>
			</Link>

			<div className={styles.body}>
				<div className={styles.heading}>
					<div>
						<h2>{listing.title}</h2>
					</div>
					<span className={styles.price}>
						<strong>{formatMoney(listing.basePrice, listing.currency)}</strong>
						<small>/{formatPricingUnit(listing.pricingUnit)}</small>
					</span>
				</div>

				<p className={styles.location}>
					<MapPin aria-hidden="true" />
					{listing.city}, {listing.country}
				</p>

				<ul className={styles.specs} aria-label="Apartment highlights">
					<li>
						<BedDouble aria-hidden="true" />
						<strong>{details?.bedrooms ?? "-"}</strong>
						<span>Bedrooms</span>
					</li>
					<li>
						<Bath aria-hidden="true" />
						<strong>{details?.bathrooms ?? "-"}</strong>
						<span>Bathrooms</span>
					</li>
					<li>
						<Users aria-hidden="true" />
						<strong>{guestCount ?? "-"}</strong>
						<span>Guests</span>
					</li>
				</ul>
			</div>
		</article>
	);
}
