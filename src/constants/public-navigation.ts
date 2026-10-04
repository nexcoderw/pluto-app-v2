import {
	BedDouble,
	Building2,
	CarFront,
	Hotel,
	House,
	Mail,
	Plane,
	type LucideIcon,
} from "lucide-react";

export type PublicNavigationLink = {
	href: string;
	label: string;
	icon: LucideIcon;
};

export const PUBLIC_NAVIGATION_LINKS: readonly PublicNavigationLink[] = [
	{ href: "/", label: "Home", icon: House },
	{ href: "/listings/cars", label: "Cars", icon: CarFront },
	{ href: "/listings/apartments", label: "Apartments", icon: Building2 },
	{ href: "/listings/hotel-rooms", label: "Hotel Rooms", icon: Hotel },
	{ href: "/listings/airbnb", label: "AirBnB", icon: BedDouble },
	{ href: "/flights", label: "Flight", icon: Plane },
	{ href: "/contact", label: "Contact us", icon: Mail },
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
