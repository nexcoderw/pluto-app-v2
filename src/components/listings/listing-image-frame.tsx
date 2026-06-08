"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import styles from "./listing-image-frame.module.css";

type ListingImageFrameProps = {
	src: string;
	alt: string;
	sizes: string;
	className?: string;
	priority?: boolean;
	loading?: "eager" | "lazy";
	onError?: () => void;
};

export function ListingImageFrame({
	src,
	alt,
	sizes,
	className,
	priority = false,
	loading,
	onError,
}: ListingImageFrameProps) {
	return (
		<span className={cn(styles.frame, className)}>
			<Image
				src={src}
			alt=""
			fill
			sizes={sizes}
			priority={priority}
			loading={priority ? undefined : loading}
			className={styles.backdrop}
			aria-hidden="true"
		/>
			<Image
				src={src}
				alt={alt}
			fill
			sizes={sizes}
			priority={priority}
			loading={priority ? undefined : loading}
			className={styles.image}
			onError={onError}
		/>
		</span>
	);
}
