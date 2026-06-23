import {
	CalendarCheck2,
	CreditCard,
	Heart,
	LayoutDashboard,
	PlaneTakeoff,
	ShieldCheck,
	UserRound,
	type LucideIcon,
} from "lucide-react";

export type CustomerPortalNavigationItem = {
	href: string;
	label: string;
	icon: LucideIcon;
};

export const CUSTOMER_PORTAL_NAVIGATION: CustomerPortalNavigationItem[] = [
	{
		href: "/account",
		label: "Dashboard",
		icon: LayoutDashboard,
	},
	{
		href: "/account/bookings",
		label: "Bookings",
		icon: CalendarCheck2,
	},
	{
		href: "/account/favorites",
		label: "Favorites",
		icon: Heart,
	},
	{
		href: "/account/flight-requests",
		label: "Flight Requests",
		icon: PlaneTakeoff,
	},
	{
		href: "/account/payments",
		label: "Payments",
		icon: CreditCard,
	},
	{
		href: "/account/profile",
		label: "Profile",
		icon: UserRound,
	},
	{
		href: "/account/audit-logs",
		label: "Audit Logs",
		icon: ShieldCheck,
	},
];
