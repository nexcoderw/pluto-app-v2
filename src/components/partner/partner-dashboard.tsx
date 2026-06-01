'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
	BadgeCheck,
	Building2,
	CalendarClock,
	CarFront,
	Home,
	ListChecks,
	PackageCheck,
	RefreshCcw,
	ShieldCheck,
	Sparkles,
	UploadCloud,
	UserRoundCheck,
	type LucideIcon,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
	PortalShell,
	type PortalAction,
	type PortalMetric,
} from '@/components/portal/portal-shell';
import { partnerPortalNavigation } from '@/constants/partner-portal-navigation';
import {
	PartnerAccessBoundary,
	PartnerWorkspaceLoading,
} from './partner-access-boundary';
import {
	getPartnerProfile,
	type PartnerProfile,
} from '@/services/api/partner-profile';
import type { UserAuthProfile } from '@/services/api/auth';
import styles from './partner-dashboard.module.css';

const partnerDashboardActions: PortalAction[] = [
	{
		href: '/partner/dashboard',
		label: 'Create listing',
		description: 'Prepare a reviewed listing for customers.',
		icon: Building2,
	},
	{
		href: '/partner/dashboard',
		label: 'Manage availability',
		description: 'Keep customer-facing inventory accurate.',
		icon: CalendarClock,
	},
];

export function PartnerDashboard() {
	return (
		<PartnerAccessBoundary>
			{(user) => <PartnerDashboardContent user={user} />}
		</PartnerAccessBoundary>
	);
}

function PartnerDashboardContent({ user }: { user: UserAuthProfile }) {
	const router = useRouter();
	const profileQuery = useQuery({
		queryKey: ['partner-profile'],
		queryFn: getPartnerProfile,
	});
	const profile = profileQuery.data?.profile;
	const metrics = useMemo(() => buildDashboardMetrics(profile), [profile]);

	useEffect(() => {
		if (profile && profile.status !== 'APPROVED') {
			router.replace('/partner-onboarding');
		}
	}, [profile, router]);

	if (profileQuery.isPending || (profile && profile.status !== 'APPROVED')) {
		return (
			<PartnerWorkspaceLoading
				title="Checking partner approval"
				description="Only approved partners can open the operational dashboard."
			/>
		);
	}

	if (profileQuery.isError || !profile) {
		return (
			<PartnerStatusGate
				title="Partner status unavailable"
				description="We could not confirm your approval status. Refresh before opening dashboard tools."
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
			eyebrow="Approved partner portal"
			title={getDashboardTitle(profile)}
			description="Your partner profile is approved. Manage listings, availability, documents, and review activity from this secure workspace."
			homeHref="/"
			homeLabel="View marketplace"
			navigation={partnerPortalNavigation}
			metrics={metrics}
			actions={partnerDashboardActions}
		>
			<PartnerDashboardWorkspace profile={profile} />
		</PortalShell>
	);
}

function PartnerDashboardWorkspace({ profile }: { profile: PartnerProfile }) {
	const isCompany = profile.partnerType === 'COMPANY';

	return (
		<div className={styles.dashboardGrid}>
			<section className={styles.commandPanel}>
				<div className={styles.panelHeader}>
					<span>
						<Sparkles aria-hidden="true" />
						Operations
					</span>
					<h2>
						{isCompany
							? 'Business command center'
							: 'Individual command center'}
					</h2>
					<p>
						Start with listing quality, availability, and document readiness.
						Each action stays connected to your approved partner profile.
					</p>
				</div>

				<div className={styles.taskGrid}>
					<DashboardTask
						icon={CarFront}
						title="Prepare listings"
						description="Create clear listing content, pricing, and review-ready details before publishing."
					/>
					<DashboardTask
						icon={CalendarClock}
						title="Control availability"
						description="Keep dates, blackout periods, and booking readiness accurate for customers."
					/>
					<DashboardTask
						icon={UploadCloud}
						title="Manage media"
						description="Attach trusted photos and documents through the secure upload workflow."
					/>
					<DashboardTask
						icon={ListChecks}
						title="Track reviews"
						description="Follow admin decisions and required updates before listings go live."
					/>
				</div>
			</section>

			<aside>
				<section className={styles.activityPanel}>
					<div className={styles.panelHeader}>
						<span>
							<PackageCheck aria-hidden="true" />
							Account readiness
						</span>
						<h2>Approved profile</h2>
						<p>
							Your profile can now support operational marketplace activity.
						</p>
					</div>
					<ul className={styles.activityList}>
						<li>
							<ShieldCheck aria-hidden="true" />
							<span>
								<strong>Identity verified</strong>
								<small>{formatDate(profile.reviewedAt)}</small>
							</span>
						</li>
						<li>
							<BadgeCheck aria-hidden="true" />
							<span>
								<strong>
									{isCompany ? 'Business profile' : 'Individual profile'}
								</strong>
								<small>
									{profile.businessName ??
										profile.legalName ??
										'Profile approved'}
								</small>
							</span>
						</li>
						<li>
							<Home aria-hidden="true" />
							<span>
								<strong>Marketplace access</strong>
								<small>Listing tools are now available.</small>
							</span>
						</li>
					</ul>
				</section>

				<section className={styles.readinessPanel}>
					<div className={styles.panelHeader}>
						<span>Next milestone</span>
						<h2>Listing launch readiness</h2>
					</div>
					<div className={styles.readinessMeter} aria-hidden="true">
						<span />
					</div>
					<p>
						Add listings, media, and accurate availability to move from approved
						partner to customer-ready seller.
					</p>
				</section>
			</aside>
		</div>
	);
}

function DashboardTask({
	icon: Icon,
	title,
	description,
}: {
	icon: LucideIcon;
	title: string;
	description: string;
}) {
	return (
		<article className={styles.taskCard}>
			<Icon aria-hidden="true" />
			<strong>{title}</strong>
			<p>{description}</p>
		</article>
	);
}

export function PartnerStatusGate({
	title,
	description,
	action,
}: {
	title: string;
	description: string;
	action?: ReactNode;
}) {
	return (
		<main className={styles.statusPage} aria-label={title}>
			<section className={styles.statusPanel}>
				<div className={styles.statusIcon}>
					<ShieldCheck aria-hidden="true" />
				</div>
				<span>Partner access</span>
				<h1>{title}</h1>
				<p>{description}</p>
				{action}
			</section>
		</main>
	);
}

function buildDashboardMetrics(profile?: PartnerProfile): PortalMetric[] {
	return [
		{
			label: 'Profile status',
			value: profile?.status ?? 'Checking',
			description: 'Only approved partner profiles can open operations.',
			icon: BadgeCheck,
		},
		{
			label: 'Partner type',
			value: profile?.partnerType === 'COMPANY' ? 'Business' : 'Individual',
			description: 'Dashboard tools adapt to your approved profile type.',
			icon: profile?.partnerType === 'COMPANY' ? Building2 : UserRoundCheck,
		},
		{
			label: 'Listings',
			value: 'Ready',
			description: 'Create and track listings through admin review.',
			icon: PackageCheck,
		},
	];
}

function getDashboardTitle(profile: PartnerProfile) {
	return profile.partnerType === 'COMPANY'
		? 'Business partner dashboard'
		: 'Individual partner dashboard';
}

function formatDate(value?: string | null) {
	if (!value) {
		return 'Approved by the admin team';
	}

	return new Intl.DateTimeFormat('en', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}).format(new Date(value));
}
