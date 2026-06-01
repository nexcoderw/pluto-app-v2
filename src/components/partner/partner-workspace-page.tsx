'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
	ArrowRight,
	BadgeCheck,
	CalendarCheck2,
	CreditCard,
	RefreshCcw,
	Settings,
	ShieldCheck,
	Sparkles,
	Store,
	type LucideIcon,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { PortalAccessBoundary } from '@/components/portal/portal-access-boundary';
import {
	PortalShell,
	type PortalAction,
	type PortalMetric,
} from '@/components/portal/portal-shell';
import { partnerPortalNavigation } from '@/constants/partner-portal-navigation';
import {
	getPartnerProfile,
	type PartnerProfile,
} from '@/services/api/partner-profile';
import type { UserAuthProfile } from '@/services/api/auth';
import { PartnerStatusGate } from './partner-dashboard';
import styles from './partner-workspace-page.module.css';

type PartnerWorkspaceKey = 'listings' | 'bookings' | 'payments' | 'settings';

type PartnerWorkspaceConfig = {
	key: PartnerWorkspaceKey;
	eyebrow: string;
	title: string;
	description: string;
	icon: LucideIcon;
	stats: Array<{
		label: string;
		value: string;
		description: string;
	}>;
	steps: Array<{
		title: string;
		description: string;
	}>;
};

const workspaceConfig: Record<PartnerWorkspaceKey, PartnerWorkspaceConfig> = {
	listings: {
		key: 'listings',
		eyebrow: 'Listing operations',
		title: 'Listings workspace',
		description:
			'Prepare, review, and manage the listings customers will book through Pluto Booking.',
		icon: Store,
		stats: [
			{
				label: 'Draft listings',
				value: '0',
				description: 'Create your first listing from this workspace.',
			},
			{
				label: 'In review',
				value: '0',
				description: 'Admin-reviewed listings will be tracked here.',
			},
			{
				label: 'Published',
				value: '0',
				description: 'Approved listings become visible to customers.',
			},
		],
		steps: [
			{
				title: 'Create listing details',
				description:
					'Add title, location, pricing, availability rules, and customer-facing description.',
			},
			{
				title: 'Attach trusted media',
				description:
					'Upload clear images and documents so reviewers can validate the listing faster.',
			},
			{
				title: 'Submit for review',
				description:
					'Send listings to the admin team before they become available on the marketplace.',
			},
		],
	},
	bookings: {
		key: 'bookings',
		eyebrow: 'Booking control',
		title: 'Bookings workspace',
		description:
			'Track customer booking requests, approval states, and operational follow-ups from one place.',
		icon: CalendarCheck2,
		stats: [
			{
				label: 'New requests',
				value: '0',
				description: 'Fresh customer requests will appear here.',
			},
			{
				label: 'Confirmed',
				value: '0',
				description: 'Confirmed reservations stay visible for action.',
			},
			{
				label: 'Needs attention',
				value: '0',
				description: 'Conflicts and follow-ups will be highlighted.',
			},
		],
		steps: [
			{
				title: 'Review booking requests',
				description:
					'Confirm customer details, listing availability, and payment readiness before accepting.',
			},
			{
				title: 'Keep availability current',
				description:
					'Prevent double-booking by updating dates as soon as customer plans change.',
			},
			{
				title: 'Coordinate customer handoff',
				description:
					'Use booking status and notes to keep the customer journey consistent.',
			},
		],
	},
	payments: {
		key: 'payments',
		eyebrow: 'Financial operations',
		title: 'Payments workspace',
		description:
			'Monitor payout readiness, settlement status, and payment records tied to approved bookings.',
		icon: CreditCard,
		stats: [
			{
				label: 'Pending payouts',
				value: '0',
				description: 'Upcoming payouts will be summarized here.',
			},
			{
				label: 'Completed',
				value: '0',
				description: 'Settled payment records remain accessible.',
			},
			{
				label: 'Account status',
				value: 'Ready',
				description: 'Your approved partner profile can support payment setup.',
			},
		],
		steps: [
			{
				title: 'Complete payout settings',
				description:
					'Add financial account details when payment configuration becomes available.',
			},
			{
				title: 'Track settlement status',
				description:
					'Review payout timing and booking-linked payment records without leaving the portal.',
			},
			{
				title: 'Resolve payment issues',
				description:
					'Admin follow-ups and failed payment actions will be surfaced here.',
			},
		],
	},
	settings: {
		key: 'settings',
		eyebrow: 'Partner settings',
		title: 'Settings workspace',
		description:
			'Manage business preferences, profile readiness, and account controls for your partner workspace.',
		icon: Settings,
		stats: [
			{
				label: 'Profile',
				value: 'Approved',
				description: 'Your partner profile is approved for operations.',
			},
			{
				label: 'Security',
				value: 'Active',
				description: 'Protected account access is enforced on portal routes.',
			},
			{
				label: 'Notifications',
				value: 'Ready',
				description:
					'Preference controls will appear here as the portal expands.',
			},
		],
		steps: [
			{
				title: 'Review profile details',
				description:
					'Keep legal, business, and contact information aligned with admin-approved records.',
			},
			{
				title: 'Manage account security',
				description:
					'Use secure login controls and keep your contact channels accurate.',
			},
			{
				title: 'Tune operating preferences',
				description:
					'Notification, payout, and listing preferences will live in this workspace.',
			},
		],
	},
};

export function PartnerWorkspacePage({ page }: { page: PartnerWorkspaceKey }) {
	const config = workspaceConfig[page];

	return (
		<PortalAccessBoundary
			allowedRole="PARTNER"
			loadingFallback={
				<PartnerStatusGate
					title="Opening partner workspace"
					description="Checking your secure partner session before loading business tools."
				/>
			}
		>
			{(user) => <PartnerWorkspaceContent config={config} user={user} />}
		</PortalAccessBoundary>
	);
}

function PartnerWorkspaceContent({
	config,
	user,
}: {
	config: PartnerWorkspaceConfig;
	user: UserAuthProfile;
}) {
	const router = useRouter();
	const profileQuery = useQuery({
		queryKey: ['partner-profile'],
		queryFn: getPartnerProfile,
	});
	const profile = profileQuery.data?.profile;
	const metrics = useMemo(
		() => buildWorkspaceMetrics(config, profile),
		[config, profile],
	);
	const actions = useMemo(() => buildWorkspaceActions(config), [config]);

	useEffect(() => {
		if (profile && profile.status !== 'APPROVED') {
			router.replace('/partner-onboarding');
		}
	}, [profile, router]);

	if (profileQuery.isPending || (profile && profile.status !== 'APPROVED')) {
		return (
			<PartnerStatusGate
				title="Checking partner approval"
				description="Only approved partners can open operational workspaces."
			/>
		);
	}

	if (profileQuery.isError || !profile) {
		return (
			<PartnerStatusGate
				title="Partner status unavailable"
				description="We could not confirm your approval status. Refresh before opening workspace tools."
				action={
					<Button type="button" onClick={() => profileQuery.refetch()}>
						<RefreshCcw aria-hidden="true" />
						Retry
					</Button>
				}
			/>
		);
	}

	return (
		<PortalShell
			variant="partner"
			user={user}
			eyebrow={config.eyebrow}
			title={config.title}
			description={config.description}
			homeHref="/"
			homeLabel="View marketplace"
			navigation={partnerPortalNavigation}
			metrics={metrics}
			actions={actions}
		>
			<PartnerWorkspaceBody config={config} profile={profile} />
		</PortalShell>
	);
}

function PartnerWorkspaceBody({
	config,
	profile,
}: {
	config: PartnerWorkspaceConfig;
	profile: PartnerProfile;
}) {
	const Icon = config.icon;

	return (
		<section className={styles.workspacePanel}>
			<div className={styles.workspaceHeader}>
				<span>
					<Icon aria-hidden="true" />
					{profile.partnerType === 'COMPANY'
						? 'Business partner'
						: 'Individual partner'}
				</span>
				<h2>{config.title} readiness</h2>
				<p>
					Use this workspace to keep partner operations focused, reviewed, and
					ready for customer activity.
				</p>
			</div>

			<div className={styles.stepGrid}>
				{config.steps.map((step, index) => (
					<article key={step.title}>
						<strong>{String(index + 1).padStart(2, '0')}</strong>
						<h3>{step.title}</h3>
						<p>{step.description}</p>
					</article>
				))}
			</div>
		</section>
	);
}

function buildWorkspaceMetrics(
	config: PartnerWorkspaceConfig,
	profile?: PartnerProfile,
): PortalMetric[] {
	const Icon = config.icon;

	return config.stats.map((stat, index) => ({
		...stat,
		value:
			index === 0 && config.key === 'settings'
				? (profile?.status ?? stat.value)
				: stat.value,
		icon: index === 0 ? Icon : index === 1 ? BadgeCheck : ShieldCheck,
	}));
}

function buildWorkspaceActions(config: PartnerWorkspaceConfig): PortalAction[] {
	return [
		{
			href: '/partner/dashboard',
			label: 'Back to dashboard',
			description: 'Return to your partner operations overview.',
			icon: ArrowRight,
		},
		{
			href: `/partner/${config.key}`,
			label: `Review ${config.key}`,
			description: 'Stay on this workspace and continue preparing tools.',
			icon: Sparkles,
		},
	];
}
