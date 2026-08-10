export type PublicNavigationLink = {
	href: string;
	label: string;
};

export const PUBLIC_NAVIGATION_LINKS: readonly PublicNavigationLink[] = [
	{ href: "/listings/cars", label: "Cars" },
	{ href: "/listings/apartments", label: "Apartments" },
	{ href: "/listings/hotel-rooms", label: "Hotel Rooms" },
	{ href: "/listings/airbnb", label: "AirBnB" },
	{ href: "/flights", label: "Flight" },
	{ href: "/#contact", label: "Contact us" },
];

export function isPublicNavigationLinkActive(
	pathname: string,
	href: string,
	hash = "",
): boolean {
	const [targetPath, targetHash] = href.split("#", 2);

	if (targetHash) {
		return pathname === targetPath && hash === `#${targetHash}`;
	}

	return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
}
