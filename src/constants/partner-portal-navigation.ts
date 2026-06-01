import {
	CalendarCheck2,
	CreditCard,
	LayoutDashboard,
	Settings,
	Store,
} from 'lucide-react';
import type { PortalNavItem } from '@/components/portal/portal-shell';

export const partnerPortalNavigation: PortalNavItem[] = [
	{
		href: '/partner/dashboard',
		label: 'Dashboard',
		icon: LayoutDashboard,
	},
	{
		href: '/partner/listings',
		label: 'Listings',
		icon: Store,
	},
	{
		href: '/partner/bookings',
		label: 'Bookings',
		icon: CalendarCheck2,
	},
	{
		href: '/partner/payments',
		label: 'Payments',
		icon: CreditCard,
	},
	{
		href: '/partner/settings',
		label: 'Settings',
		icon: Settings,
	},
];
