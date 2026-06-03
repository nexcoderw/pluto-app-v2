import type { ListingSidebarFilter } from "../category-listings-page";

export const hotelRoomFilters: ListingSidebarFilter[] = [
	{ key: "roomType", label: "Room type", kind: "text" },
	{ key: "bedType", label: "Bed type", kind: "text" },
	{ key: "guests", label: "Guests", kind: "number" },
];
