import { format } from "date-fns";
import type {
	BookingPaymentStatus,
	BookingProductCategory,
	BookingStatus,
} from "@/services/api/bookings";

export function formatBookingDate(value: string): string {
	return format(new Date(value), "MMM d, yyyy");
}

export function formatBookingDateTime(value: string): string {
	return format(new Date(value), "MMM d, yyyy, h:mm a");
}

export function formatBookingStatus(status: BookingStatus): string {
	return status
		.toLowerCase()
		.split("_")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

export function formatPaymentStatus(status: BookingPaymentStatus): string {
	return formatBookingStatus(status as BookingStatus);
}

export function formatBookingCategory(
	category: BookingProductCategory,
): string {
	const labels: Record<BookingProductCategory, string> = {
		CAR: "Car",
		APARTMENT: "Apartment",
		HOTEL_ROOM: "Hotel room",
		AIRBNB_HOUSE: "Airbnb",
	};

	return labels[category] ?? category;
}

export function formatBookingMoney(value: string, currency: string): string {
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

export function getBookingStatusTone(status: BookingStatus) {
	if (status === "CONFIRMED" || status === "COMPLETED") {
		return "success";
	}

	if (status === "PENDING") {
		return "pending";
	}

	if (
		status === "CANCELLED" ||
		status === "CANCELLED_BY_CUSTOMER" ||
		status === "CANCELLED_BY_PARTNER" ||
		status === "REJECTED" ||
		status === "EXPIRED"
	) {
		return "danger";
	}

	return "neutral";
}
