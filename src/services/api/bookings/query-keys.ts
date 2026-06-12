import type { ListBookingsRequest, ListingAvailabilityRequest } from "./types";

export const bookingQueryKeys = {
	all: ["bookings"] as const,
	myLists: () => [...bookingQueryKeys.all, "my-list"] as const,
	myList: (params: ListBookingsRequest) =>
		[...bookingQueryKeys.myLists(), normalizeListParams(params)] as const,
	myDetail: (bookingId: string) =>
		[...bookingQueryKeys.all, "my-detail", bookingId] as const,
	partnerLists: () => [...bookingQueryKeys.all, "partner-list"] as const,
	partnerList: (params: ListBookingsRequest) =>
		[...bookingQueryKeys.partnerLists(), normalizeListParams(params)] as const,
	availabilityLists: () =>
		[...bookingQueryKeys.all, "listing-availability"] as const,
	availability: (productId: string, params?: ListingAvailabilityRequest) =>
		[
			...bookingQueryKeys.availabilityLists(),
			productId,
			normalizeAvailabilityParams(params),
		] as const,
};

function normalizeListParams(params: ListBookingsRequest) {
	return {
		page: params.page ?? 1,
		limit: params.limit,
		search: params.search ?? "",
		status: params.status ?? "ALL",
		paymentStatus: params.paymentStatus ?? "ALL",
		category: params.category ?? "ALL",
		orderBy: params.orderBy ?? "createdAt",
		order: params.order ?? "desc",
	};
}

function normalizeAvailabilityParams(params?: ListingAvailabilityRequest) {
	return {
		startDate: params?.startDate ?? "",
		endDate: params?.endDate ?? "",
	};
}
