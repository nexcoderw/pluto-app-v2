"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	ArrowRight,
	Bath,
	BedDouble,
	ChevronLeft,
	ChevronRight,
	MapPin,
	ShieldCheck,
	Star,
	Users,
} from "lucide-react";
import type { PublicListing } from "@/services/api/listings";
import { ListingFavoriteButton } from "../listing-favorite-button";
import { formatMoney, formatPricingUnit } from "../listing-formatters";
import styles from "./airbnb-listing-card.module.css";

type AirbnbListingCardProps = {
	listing: PublicListing;
	detailHref: string;
	priorityImage?: boolean;
};

const fallbackImage = "/hero/hero.jpg";

export function AirbnbListingCard({
	listing,
	detailHref,
	priorityImage = false,
}: AirbnbListingCardProps) {
	const details = listing.airbnbDetails;
	const [activeImageIndex, setActiveImageIndex] = useState(0);
	const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
	const images = useMemo(
		() =>
			listing.images
				.filter((image) => Boolean(image.file.publicUrl))
				.map((image) => ({
					id: image.id,
					src: image.file.publicUrl ?? fallbackImage,
					alt: image.altText ?? listing.title,
				})),
		[listing.images, listing.title],
	);
	const gallery = images.length
		? images
		: [
				{
					id: "fallback",
					src: fallbackImage,
					alt: "Pluto Booking Airbnb stay",
				},
			];
	const activeImage = gallery[activeImageIndex] ?? gallery[0];
	const activeImageSrc = failedImages.has(activeImage.id)
		? fallbackImage
		: activeImage.src;
	const ratingLabel =
		listing.ratingAverage === null || listing.ratingAverage === undefined
			? "New"
			: `${listing.ratingAverage.toFixed(2)} (${listing.ratingCount ?? 0})`;
	const homeType = details?.houseType ?? "Curated stay";

	function showPreviousImage() {
		setActiveImageIndex((current) =>
			current === 0 ? gallery.length - 1 : current - 1,
		);
	}

	function showNextImage() {
		setActiveImageIndex((current) =>
			current === gallery.length - 1 ? 0 : current + 1,
		);
	}

	function markImageAsFailed(imageId: string) {
		setFailedImages((current) => {
			const next = new Set(current);
			next.add(imageId);
			return next;
		});
	}

	return (
		<article className={styles.card}>
			<div className={styles.media}>
				<Link href={detailHref} className={styles.imageLink}>
					<Image
						src={activeImageSrc}
						alt={activeImage.alt}
						fill
						sizes="(max-width: 720px) 100vw, (max-width: 1280px) 43vw, 19vw"
						loading={priorityImage ? "eager" : "lazy"}
						priority={priorityImage}
						onError={() => markImageAsFailed(activeImage.id)}
					/>
				</Link>
				<span className={styles.statusPill}>
					<ShieldCheck aria-hidden="true" />
					Verified stay
				</span>

				{gallery.length > 1 ? (
					<>
						<button
							type="button"
							className={styles.galleryButton}
							data-position="left"
							aria-label="Show previous Airbnb image"
							onClick={showPreviousImage}
						>
							<ChevronLeft aria-hidden="true" />
						</button>
						<button
							type="button"
							className={styles.galleryButton}
							data-position="right"
							aria-label="Show next Airbnb image"
							onClick={showNextImage}
						>
							<ChevronRight aria-hidden="true" />
						</button>
						<div className={styles.galleryDots} aria-hidden="true">
							{gallery.map((image, index) => (
								<span key={image.id} data-active={index === activeImageIndex} />
							))}
						</div>
					</>
				) : null}
			</div>

			<div className={styles.body}>
				<div className={styles.heading}>
					<div>
						<p className={styles.homeType}>{homeType}</p>
						<Link href={detailHref} className={styles.titleLink}>
							<h2>{listing.title}</h2>
						</Link>
					</div>
					<ListingFavoriteButton
						productId={listing.id}
						listingTitle={listing.title}
						className={styles.favoriteButton}
						label="Save Airbnb"
					/>
				</div>

				<p className={styles.location}>
					<MapPin aria-hidden="true" />
					{listing.city}, {listing.country}
				</p>

				<ul className={styles.specs} aria-label="Airbnb home highlights">
					<li>
						<BedDouble aria-hidden="true" />
						<span>{details?.bedrooms ?? "-"} bedrooms</span>
					</li>
					<li>
						<Bath aria-hidden="true" />
						<span>{details?.bathrooms ?? "-"} baths</span>
					</li>
					<li>
						<Users aria-hidden="true" />
						<span>{details?.maxGuests ?? "-"} guests</span>
					</li>
				</ul>

				<div className={styles.footer}>
					<span className={styles.price}>
						<strong>{formatMoney(listing.basePrice, listing.currency)}</strong>
						<small>/{formatPricingUnit(listing.pricingUnit)}</small>
					</span>
					<span className={styles.rating}>
						<Star aria-hidden="true" />
						{ratingLabel}
					</span>
				</div>

				<div className={styles.actionRow}>
					<Link href={detailHref} className={styles.detailsLink}>
						View stay details
						<ArrowRight aria-hidden="true" />
					</Link>
				</div>
			</div>
		</article>
	);
}

export function AirbnbListingCardSkeleton() {
	return (
		<article className={styles.card} aria-hidden="true">
			<div className={styles.media}>
				<span className={styles.skeletonImage} />
				<span className={styles.skeletonStatusPill} />
				<span className={styles.skeletonGalleryButton} data-position="left" />
				<span className={styles.skeletonGalleryButton} data-position="right" />
				<div className={styles.skeletonDots}>
					{Array.from({ length: 4 }).map((_, index) => (
						<span key={index} />
					))}
				</div>
			</div>

			<div className={styles.body}>
				<div className={styles.heading}>
					<div>
						<span className={styles.skeletonHomeType} />
						<span className={styles.skeletonTitle} />
					</div>
					<span className={styles.skeletonFavoriteButton} />
				</div>

				<span className={styles.skeletonLocation} />

				<ul className={styles.specs}>
					{Array.from({ length: 3 }).map((_, index) => (
						<li key={index} className={styles.skeletonSpec}>
							<span />
						</li>
					))}
				</ul>

				<div className={styles.footer}>
					<span className={styles.skeletonPrice} />
					<span className={styles.skeletonRating} />
				</div>

				<div className={styles.actionRow}>
					<span className={styles.skeletonDetailsLink} />
				</div>
			</div>
		</article>
	);
}
