"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
	Bath,
	BedDouble,
	ChevronLeft,
	ChevronRight,
	Heart,
	Star,
	Users,
} from "lucide-react";
import type { PublicListing } from "@/services/api/listings";
import { formatMoney } from "./listing-formatters";
import styles from "./apartment-listing-card.module.css";

type ApartmentListingCardProps = {
	listing: PublicListing;
	detailHref: string;
	priorityImage?: boolean;
};

type ApartmentDetailsWithGuestAlias = NonNullable<
	PublicListing["apartmentDetails"]
> & {
	guests?: number;
};

const fallbackImage = "/hero/hero.jpg";

export function ApartmentListingCard({
	listing,
	detailHref,
	priorityImage = false,
}: ApartmentListingCardProps) {
	const details =
		listing.apartmentDetails as ApartmentDetailsWithGuestAlias | null;
	const [activeImageIndex, setActiveImageIndex] = useState(0);
	const [favorite, setFavorite] = useState(false);
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
		: [{ id: "fallback", src: fallbackImage, alt: "Pluto Booking apartment" }];
	const activeImage = gallery[activeImageIndex] ?? gallery[0];
	const activeImageSrc = failedImages.has(activeImage.id)
		? fallbackImage
		: activeImage.src;
	const guestCount = details?.maxGuests ?? details?.guests;
	const ratingLabel =
		listing.ratingAverage === null || listing.ratingAverage === undefined
			? "New"
			: `${listing.ratingAverage.toFixed(2)} (${listing.ratingCount ?? 0})`;

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
						sizes="(max-width: 720px) 100vw, 22rem"
						loading={priorityImage ? "eager" : "lazy"}
						priority={priorityImage}
						onError={() => markImageAsFailed(activeImage.id)}
					/>
				</Link>

				<span className={styles.statusPill}>Verified stay</span>

				{gallery.length > 1 ? (
					<>
						<button
							type="button"
							className={styles.galleryButton}
							data-position="left"
							aria-label="Show previous apartment image"
							onClick={showPreviousImage}
						>
							<ChevronLeft aria-hidden="true" />
						</button>
						<button
							type="button"
							className={styles.galleryButton}
							data-position="right"
							aria-label="Show next apartment image"
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
				<button
					type="button"
					className={styles.favoriteButton}
					aria-label={
						favorite ? "Remove apartment from favorites" : "Save apartment"
					}
					aria-pressed={favorite}
					onClick={() => setFavorite((current) => !current)}
				>
					<Heart aria-hidden="true" />
				</button>

				<Link href={detailHref} className={styles.titleLink}>
					<h2>{listing.title}</h2>
				</Link>

				<p className={styles.summary}>
					{listing.shortDescription ??
						`${details?.bedrooms ?? "-"} bedrooms close to ${listing.city}`}
				</p>

				<p className={styles.location}>
					{details?.bedrooms ?? "-"} bedrooms · {details?.bathrooms ?? "-"}{" "}
					baths · {guestCount ?? "-"} guests
				</p>

				<ul className={styles.specs} aria-label="Apartment highlights">
					<li>
						<BedDouble aria-hidden="true" />
						<span>{details?.bedrooms ?? "-"} beds</span>
					</li>
					<li>
						<Bath aria-hidden="true" />
						<span>{details?.bathrooms ?? "-"} baths</span>
					</li>
					<li>
						<Users aria-hidden="true" />
						<span>{guestCount ?? "-"} guests</span>
					</li>
				</ul>

				<div className={styles.footer}>
					<span className={styles.price}>
						<strong>{formatMoney(listing.basePrice, listing.currency)}</strong>
						<small>/{listing.pricingUnit.toLowerCase()}</small>
					</span>
					<span className={styles.rating}>
						<Star aria-hidden="true" />
						{ratingLabel}
					</span>
				</div>
			</div>
		</article>
	);
}
