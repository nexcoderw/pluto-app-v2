import type { ListingSidebarFilter } from "../category-listings-page";

export const airbnbFilters: ListingSidebarFilter[] = [
	{ key: "propertyType", label: "Property type", kind: "text" },
	{ key: "bedrooms", label: "Bedrooms", kind: "number" },
	{ key: "bathrooms", label: "Bathrooms", kind: "number" },
	{ key: "guests", label: "Guests", kind: "number" },
];
