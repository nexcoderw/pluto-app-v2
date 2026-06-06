"use client";

import Image from "next/image";
import Link from "next/link";
import {
	ArrowRight,
	CarFront,
	Fuel,
	Gauge,
	MapPin,
	ShieldCheck,
	Users,
} from "lucide-react";
import type { PublicListing } from "@/services/api/listings";
import { ListingFavoriteButton } from "../listing-favorite-button";
import {
	formatMoney,
	formatPricingUnit,
	getListingCoverImage,
} from "../listing-formatters";
import styles from "./car-listing-card.module.css";

type CarListingCardProps = {
	listing: PublicListing;
	detailHref: string;
};

export function CarListingCard({ listing, detailHref }: CarListingCardProps) {
	const details = listing.carDetails;
	const coverImage = getListingCoverImage(listing);
	const coverUrl = coverImage?.file.publicUrl;
	const vehicleName = details
		? `${details.brand} ${details.model}`
		: "Approved vehicle";

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
						<CarFront aria-hidden="true" />
						Vehicle image pending
					</span>
				)}
				<span className={styles.statusPill}>
					<ShieldCheck aria-hidden="true" className="h-4" />
					Approved
				</span>
			</Link>

			<div className={styles.body}>
				<div className={styles.heading}>
					<div>
						<p className={styles.vehicleName}>{vehicleName}</p>
						<h2>{listing.title}</h2>
					</div>
					<span className={styles.headingActions}>
						<ListingFavoriteButton
							productId={listing.id}
							listingTitle={listing.title}
							className={styles.favoriteButton}
							label="Save car"
						/>
						<span className={styles.price}>
							<strong>
								{formatMoney(listing.basePrice, listing.currency)}
							</strong>
							<small>/{formatPricingUnit(listing.pricingUnit)}</small>
						</span>
					</span>
				</div>

				<p className={styles.location}>
					<MapPin aria-hidden="true" />
					{listing.city}, {listing.country}
				</p>

				<ul className={styles.specs} aria-label="Car highlights">
					<li>
						<Users aria-hidden="true" />
						<strong>{details?.seats ?? "-"}</strong>
						<span>Seats</span>
					</li>
					<li>
						<Gauge aria-hidden="true" />
						<strong>{details?.transmission ?? "Listed"}</strong>
						<span>Gearbox</span>
					</li>
					<li>
						<Fuel aria-hidden="true" />
						<strong>{details?.fuelType ?? "Listed"}</strong>
						<span>Fuel</span>
					</li>
				</ul>

				<Link href={detailHref} className={styles.detailsLink}>
					View car details
					<ArrowRight aria-hidden="true" />
				</Link>
			</div>
		</article>
	);
}

export function CarListingCardSkeleton() {
	return (
		<article className={styles.card} aria-hidden="true">
			<div className={styles.media}>
				<span className={styles.skeletonMediaIcon} />
				<span className={styles.skeletonStatusPill} />
			</div>

			<div className={styles.body}>
				<div className={styles.heading}>
					<div>
						<span className={styles.skeletonVehicleName} />
						<span className={styles.skeletonTitle} />
					</div>
					<span className={styles.skeletonPrice} />
				</div>

				<span className={styles.skeletonLocation} />

				<ul className={styles.specs}>
					{Array.from({ length: 3 }).map((_, index) => (
						<li key={index} className={styles.skeletonSpec}>
							<span />
							<strong />
							<small />
						</li>
					))}
				</ul>

				<span className={styles.skeletonDetailsButton} />
			</div>
		</article>
	);
}
