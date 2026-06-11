import type { PublicListing } from "@/services/api/listings";

export function getListingCoverImage(listing: PublicListing) {
	return listing.images.find((image) => image.isCover) ?? listing.images[0];
}

export function buildListingGallery(
	listing: PublicListing,
	fallbackAlt: string,
	fallbackSrc = "/hero/hero.jpg",
) {
	const coverImage = getListingCoverImage(listing);
	const images = listing.images
		.filter((image) => Boolean(image.file.publicUrl))
		.map((image) => ({
			id: image.id,
			src: image.file.publicUrl ?? fallbackSrc,
			alt: image.altText ?? listing.title,
		}));

	if (!images.length) {
		return [
			{
				id: "fallback",
				src: fallbackSrc,
				alt: fallbackAlt,
			},
		];
	}

	return images.sort((first, second) => {
		if (first.id === coverImage?.id) return -1;
		if (second.id === coverImage?.id) return 1;
		return 0;
	});
}

export function formatMoney(value: string, currency: string) {
	const amount = Number(value);

	if (!Number.isFinite(amount)) {
		return `${currency} ${value}`;
	}

	return new Intl.NumberFormat("en-RW", {
		style: "currency",
		currency,
		maximumFractionDigits: 0,
	}).format(amount);
}

export function formatPricingUnit(value: string) {
	return value.toLowerCase();
}

export function formatAverageRating(value: number | null | undefined) {
	return value === null || value === undefined ? "New" : value.toFixed(1);
}

export function formatBoolean(value: boolean) {
	return value ? "Yes" : "No";
}

export function formatOptional(value: string | number | null | undefined) {
	return value === null || value === undefined || value === ""
		? "Not listed"
		: String(value);
}
