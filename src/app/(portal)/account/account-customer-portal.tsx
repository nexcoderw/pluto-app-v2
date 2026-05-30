'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
	CalendarCheck2,
	CreditCard,
	Heart,
	Home,
	MapPin,
	Search,
	Settings,
	ShieldCheck,
	Sparkles,
	UserRound,
} from 'lucide-react';
import { PortalAccessBoundary } from '@/components/portal/portal-access-boundary';
import {
	PortalShell,
	type PortalAction,
	type PortalMetric,
	type PortalNavItem,
} from '@/components/portal/portal-shell';
import type { UserAuthProfile } from '@/services/api/auth';
import { RegistrationSuccessDialog } from './registration-success-dialog';
import shellStyles from '@/components/portal/portal-shell.module.css';

const customerNavigation: PortalNavItem[] = [
	{ href: '/account', label: 'Overview', icon: Home, active: true },
	{ href: '/', label: 'Explore', icon: Search },
	{ href: '/account', label: 'Bookings', icon: CalendarCheck2 },
	{ href: '/account', label: 'Favorites', icon: Heart },
	{ href: '/account', label: 'Payments', icon: CreditCard },
	{ href: '/account', label: 'Settings', icon: Settings },
];

const customerMetrics: PortalMetric[] = [
	{
		label: 'Active bookings',
		value: '0',
		description: 'Your confirmed reservations will appear here.',
		icon: CalendarCheck2,
	},
	{
		label: 'Saved listings',
		value: '0',
		description: 'Build a shortlist from properties and rentals.',
		icon: Heart,
	},
	{
		label: 'Account status',
		value: 'Secure',
		description: 'Session protected by Pluto Booking authentication.',
		icon: ShieldCheck,
	},
];

const customerActions: PortalAction[] = [
	{
		href: '/',
		label: 'Find stays and rentals',
		description: 'Browse curated Pluto Booking listings.',
		icon: MapPin,
	},
	{
		href: '/account',
		label: 'Manage profile',
		description: 'Profile tools will appear here as the portal expands.',
		icon: Settings,
	},
];

export function AccountCustomerPortal() {
	return (
		<Suspense fallback={null}>
			<AccountCustomerPortalContent />
		</Suspense>
	);
}
function AccountCustomerPortalContent() {
	const searchParams = useSearchParams();
	const showRegistrationDialog = searchParams.get('registered') === 'success';

	return (
		<PortalAccessBoundary allowedRole="CUSTOMER">
			{(user) => (
				<CustomerPortalContent
					user={user}
					showRegistrationDialog={showRegistrationDialog}
				/>
			)}
		</PortalAccessBoundary>
	);
}

function CustomerPortalContent({
	user,
	showRegistrationDialog,
}: {
	user: UserAuthProfile;
	showRegistrationDialog: boolean;
}) {
	return (
		<>
			<PortalShell
				variant="customer"
				user={user}
				eyebrow="Customer portal"
				title={`Welcome back, ${user.fullName}`}
				description="Manage bookings, saved listings, profile details, and secure account preferences from one focused workspace."
				homeHref="/"
				homeLabel="Explore Pluto Booking"
				navigation={customerNavigation}
				metrics={customerMetrics}
				actions={customerActions}
			>
				<section className={shellStyles.featureBand}>
					<div>
						<h2>Plan your next booking with less friction</h2>
						<p>
							Your customer portal keeps the booking journey organized while the
							platform grows into saved searches, reservations, and payment
							management.
						</p>
					</div>
					<ul className={shellStyles.featureList}>
						<li>
							<Sparkles aria-hidden="true" />
							Personalized account workspace
						</li>
						<li>
							<UserRound aria-hidden="true" />
							Secure profile and booking identity
						</li>
						<li>
							<ShieldCheck aria-hidden="true" />
							Role-protected customer access
						</li>
					</ul>
				</section>
			</PortalShell>

			<RegistrationSuccessDialog open={showRegistrationDialog} user={user} />
		</>
	);
}
