import type { PublicListing } from "@/services/api/listings";

export function getListingCoverImage(listing: PublicListing) {
	return listing.images.find((image) => image.isCover) ?? listing.images[0];
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

export function formatBoolean(value: boolean) {
	return value ? "Yes" : "No";
}

export function formatOptional(value: string | number | null | undefined) {
	return value === null || value === undefined || value === ""
		? "Not listed"
		: String(value);
}
