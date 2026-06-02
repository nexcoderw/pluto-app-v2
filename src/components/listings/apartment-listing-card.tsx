"use client";

import Image from "next/image";
import Link from "next/link";
import {
	ArrowRight,
	Bath,
	BedDouble,
	Building2,
	CircleDollarSign,
	DoorOpen,
	MapPin,
	ShieldCheck,
	Sofa,
	Users,
	Wifi,
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

export function ApartmentListingCard({
	listing,
	detailHref,
}: ApartmentListingCardProps) {
	const details = listing.apartmentDetails;
	const coverImage = getListingCoverImage(listing);
	const coverUrl = coverImage?.file.publicUrl;
	const livingLabel = details?.furnished ? "Furnished" : "Flexible living";

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
						<p className={styles.categoryName}>{livingLabel}</p>
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
						<strong>{details?.maxGuests ?? "-"}</strong>
						<span>Guests</span>
					</li>
				</ul>

				<div className={styles.amenities}>
					<span data-active={Boolean(details?.wifi)}>
						<Wifi aria-hidden="true" />
						WiFi
					</span>
					<span data-active={Boolean(details?.furnished)}>
						<Sofa aria-hidden="true" />
						Furnished
					</span>
					<span data-active={Boolean(details?.parking)}>
						<DoorOpen aria-hidden="true" />
						Parking
					</span>
				</div>

				<Link href={detailHref} className={styles.detailsLink}>
					View apartment
					<ArrowRight aria-hidden="true" />
				</Link>
			</div>
		</article>
	);
}
