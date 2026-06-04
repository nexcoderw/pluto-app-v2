"use client";

import { useState } from "react";
import Image from "next/image";
import type { Swiper as SwiperInstance } from "swiper";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Skeleton } from "@/components/ui/skeleton";
import styles from "./listing-stay-gallery.module.css";

export type ListingStayGalleryImage = {
	id: string;
	src: string;
	alt: string;
};

type ListingStayGalleryProps = {
	images: ListingStayGalleryImage[];
	autoplayDelay?: number;
};

export function ListingStayGallery({
	images,
	autoplayDelay = 4500,
}: ListingStayGalleryProps) {
	const [activeImageId, setActiveImageId] = useState(
		images[0]?.id ?? "fallback",
	);
	const [gallerySwiper, setGallerySwiper] = useState<SwiperInstance | null>(
		null,
	);

	return (
		<section className={styles.panel}>
			<Swiper
				className={styles.swiper}
				modules={[Autoplay, Navigation, Pagination]}
				loop={images.length > 1}
				navigation={images.length > 1}
				pagination={{ clickable: true }}
				autoplay={
					images.length > 1
						? { delay: autoplayDelay, disableOnInteraction: false }
						: false
				}
				onSwiper={setGallerySwiper}
				onSlideChange={(swiper) => {
					const nextImage = images[swiper.realIndex];

					if (nextImage) {
						setActiveImageId(nextImage.id);
					}
				}}
			>
				{images.map((image, index) => (
					<SwiperSlide key={image.id}>
						<div className={styles.primaryImage}>
							<Image
								src={image.src}
								alt={image.alt}
								fill
								sizes="(max-width: 900px) 100vw, 64vw"
								priority={index === 0}
							/>
						</div>
					</SwiperSlide>
				))}
			</Swiper>
			<div className={styles.rail}>
				{images.slice(0, 5).map((image, index) => (
					<button
						key={image.id}
						type="button"
						data-active={image.id === activeImageId}
						onClick={() => {
							setActiveImageId(image.id);
							gallerySwiper?.slideToLoop(index);
						}}
					>
						<Image src={image.src} alt={image.alt} fill sizes="8rem" />
					</button>
				))}
			</div>
		</section>
	);
}

export function ListingStayGallerySkeleton() {
	return (
		<section className={styles.panel} aria-busy="true">
			<div className={styles.skeletonSwiperFrame}>
				<Skeleton className={styles.skeletonHeroImage} />
				<Skeleton className={styles.skeletonGalleryButtonLeft} />
				<Skeleton className={styles.skeletonGalleryButtonRight} />
				<div className={styles.skeletonDots}>
					<Skeleton />
					<Skeleton />
					<Skeleton />
				</div>
			</div>
			<div className={styles.rail}>
				{Array.from({ length: 5 }).map((_, index) => (
					<Skeleton key={index} className={styles.skeletonThumb} />
				))}
			</div>
		</section>
	);
}
