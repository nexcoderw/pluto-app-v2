"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	ArrowRight,
	ChevronLeft,
	ChevronRight,
	MapPin,
	ShieldCheck,
	Star,
} from "lucide-react";
import type { PublicListing } from "@/services/api/listings";
import { useCurrency } from "@/providers/currency-provider";
import { ListingFavoriteButton } from "../listing-favorite-button";
import {
	formatAverageRating,
	formatPricingUnit,
} from "../listing-formatters";
import styles from "./hotel-room-listing-card.module.css";

type HotelRoomListingCardProps = {
	listing: PublicListing;
	detailHref: string;
	priorityImage?: boolean;
};

const fallbackImage = "/hero/hero.jpg";

export function HotelRoomListingCard({
	listing,
	detailHref,
	priorityImage = false,
}: HotelRoomListingCardProps) {
	const { formatMoney } = useCurrency();
	const details = listing.hotelRoomDetails;
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
		: [{ id: "fallback", src: fallbackImage, alt: "Pluto Booking hotel room" }];
	const activeImage = gallery[activeImageIndex] ?? gallery[0];
	const activeImageSrc = failedImages.has(activeImage.id)
		? fallbackImage
		: activeImage.src;
	const ratingLabel =
		listing.ratingAverage === null || listing.ratingAverage === undefined
			? "New"
			: `${formatAverageRating(listing.ratingAverage)} (${listing.ratingCount ?? 0})`;
	const hotelName = details?.hotelName ?? "Verified hotel";
	const roomType = details?.roomType ?? "Curated room";

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
					Verified room
				</span>

				{gallery.length > 1 ? (
					<>
						<button
							type="button"
							className={styles.galleryButton}
							data-position="left"
							aria-label="Show previous hotel room image"
							onClick={showPreviousImage}
						>
							<ChevronLeft aria-hidden="true" />
						</button>
						<button
							type="button"
							className={styles.galleryButton}
							data-position="right"
							aria-label="Show next hotel room image"
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
						<p className={styles.roomType}>{roomType}</p>
						<Link href={detailHref} className={styles.titleLink}>
							<h2>{listing.title}</h2>
						</Link>
					</div>
					<ListingFavoriteButton
						productId={listing.id}
						listingTitle={listing.title}
						category={listing.category}
						price={Number(listing.basePrice)}
						currency={listing.currency}
						className={styles.favoriteButton}
						label="Save hotel room"
					/>
				</div>

				<p className={styles.location}>
					<MapPin aria-hidden="true" />
					{hotelName}
				</p>

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
						View room details
						<ArrowRight aria-hidden="true" />
					</Link>
				</div>
			</div>
		</article>
	);
}

export function HotelRoomListingCardSkeleton() {
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
						<span className={styles.skeletonRoomType} />
						<span className={styles.skeletonTitle} />
					</div>
					<span className={styles.skeletonFavoriteButton} />
				</div>

				<span className={styles.skeletonLocation} />

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
