'use client';

import {
	BadgeCheck,
	Building2,
	CalendarClock,
	ClipboardCheck,
	FileText,
	Home,
	LayoutDashboard,
	ListChecks,
	Settings,
	ShieldCheck,
	UploadCloud,
} from 'lucide-react';
import { PortalAccessBoundary } from '@/components/portal/portal-access-boundary';
import {
	PortalShell,
	type PortalAction,
	type PortalMetric,
	type PortalNavItem,
} from '@/components/portal/portal-shell';
import shellStyles from '@/components/portal/portal-shell.module.css';

const partnerNavigation: PortalNavItem[] = [
	{ href: '/partner-onboarding', label: 'Overview', icon: LayoutDashboard, active: true },
	{ href: '/partner-onboarding', label: 'Listings', icon: Building2 },
	{ href: '/partner-onboarding', label: 'Documents', icon: FileText },
	{ href: '/partner-onboarding', label: 'Review queue', icon: ClipboardCheck },
	{ href: '/partner-onboarding', label: 'Availability', icon: CalendarClock },
	{ href: '/partner-onboarding', label: 'Settings', icon: Settings },
];

const partnerMetrics: PortalMetric[] = [
	{
		label: 'Listings prepared',
		value: '0',
		description: 'Create your first property, room, or rental listing.',
		icon: Building2,
	},
	{
		label: 'Verification status',
		value: 'Pending',
		description: 'Submit business details before marketplace review.',
		icon: BadgeCheck,
	},
	{
		label: 'Portal access',
		value: 'Partner',
		description: 'Only partner accounts can access this workspace.',
		icon: ShieldCheck,
	},
];

const partnerActions: PortalAction[] = [
	{
		href: '/partner-onboarding',
		label: 'Create first listing',
		description: 'Prepare listing content, photos, pricing, and availability.',
		icon: Building2,
	},
	{
		href: '/partner-onboarding',
		label: 'Upload documents',
		description: 'Verification tools will appear here as onboarding expands.',
		icon: UploadCloud,
	},
];

export function PartnerPortal() {
	return (
		<PortalAccessBoundary allowedRole="PARTNER">
			{(user) => (
				<PortalShell
					variant="partner"
					user={user}
					eyebrow="Partner portal"
					title={`Welcome, ${user.fullName}`}
					description="Build and manage Pluto Booking listings with a partner workflow designed for review readiness, secure account access, and operational clarity."
					homeHref="/"
					homeLabel="View marketplace"
					navigation={partnerNavigation}
					metrics={partnerMetrics}
					actions={partnerActions}
				>
					<section className={shellStyles.featureBand}>
						<div>
							<h2>Prepare your marketplace presence</h2>
							<p>
								This partner workspace is structured for listing setup, document
								review, availability planning, and approval workflows before
								customer-facing publishing begins.
							</p>
						</div>
						<ul className={shellStyles.featureList}>
							<li>
								<ListChecks aria-hidden="true" />
								Step-by-step listing readiness
							</li>
							<li>
								<UploadCloud aria-hidden="true" />
								Verification and document preparation
							</li>
							<li>
								<Home aria-hidden="true" />
								Role-protected partner operations
							</li>
						</ul>
					</section>
				</PortalShell>
			)}
		</PortalAccessBoundary>
	);
}

