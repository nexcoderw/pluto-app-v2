"use client";

import Image from "next/image";
import Link from "next/link";
import {
	ArrowRight,
	Bath,
	BedDouble,
	CircleDollarSign,
	House,
	KeyRound,
	MapPin,
	PawPrint,
	ShieldCheck,
	Users,
} from "lucide-react";
import type { PublicListing } from "@/services/api/listings";
import {
	formatMoney,
	formatPricingUnit,
	getListingCoverImage,
} from "./listing-formatters";
import styles from "./airbnb-listing-card.module.css";

type AirbnbListingCardProps = {
	listing: PublicListing;
	detailHref: string;
};

export function AirbnbListingCard({
	listing,
	detailHref,
}: AirbnbListingCardProps) {
	const details = listing.airbnbDetails;
	const coverImage = getListingCoverImage(listing);
	const coverUrl = coverImage?.file.publicUrl;
	const accessLabel = details?.entirePlace ? "Entire place" : "Hosted access";

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
						<House aria-hidden="true" />
						Home image pending
					</span>
				)}
				<span className={styles.statusPill}>
					<ShieldCheck aria-hidden="true" />
					Approved home
				</span>
			</Link>

			<div className={styles.body}>
				<div className={styles.heading}>
					<div>
						<p className={styles.homeType}>
							{details?.houseType ?? "Airbnb-style home"}
						</p>
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
					{listing.city}, {listing.country}
				</p>

				<ul className={styles.specs} aria-label="Airbnb home highlights">
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
						<strong>{details?.maxGuests ?? "-"}</strong>
						<span>Guests</span>
					</li>
				</ul>

				<div className={styles.amenities}>
					<span data-active={Boolean(details?.entirePlace)}>
						<House aria-hidden="true" />
						{accessLabel}
					</span>
					<span data-active={Boolean(details?.selfCheckIn)}>
						<KeyRound aria-hidden="true" />
						Self check-in
					</span>
					<span data-active={Boolean(details?.allowPets)}>
						<PawPrint aria-hidden="true" />
						Pets
					</span>
				</div>

				<Link href={detailHref} className={styles.detailsLink}>
					View home
					<ArrowRight aria-hidden="true" />
				</Link>
			</div>
		</article>
	);
}
