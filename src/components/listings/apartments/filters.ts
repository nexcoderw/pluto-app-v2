import type { ListingSidebarFilter } from "../category-listings-page";

export const apartmentFilters: ListingSidebarFilter[] = [
	{ key: "bedrooms", label: "Bedrooms", kind: "number" },
	{ key: "bathrooms", label: "Bathrooms", kind: "number" },
	{ key: "guests", label: "Guests", kind: "number" },
];
