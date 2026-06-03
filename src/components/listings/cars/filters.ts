import type { ListingSidebarFilter } from "../category-listings-page";

export const carFilters: ListingSidebarFilter[] = [
	{ key: "make", label: "Make", kind: "text", placeholder: "Toyota" },
	{ key: "model", label: "Model", kind: "text", placeholder: "RAV4" },
	{ key: "transmission", label: "Transmission", kind: "text" },
	{ key: "fuelType", label: "Fuel type", kind: "text" },
	{ key: "seats", label: "Minimum seats", kind: "number" },
	{ key: "minYear", label: "Minimum year", kind: "number" },
];
