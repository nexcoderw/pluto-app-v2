'use client';

import type { ComponentType, CSSProperties, ReactNode } from 'react';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
	ArrowRight,
	LogOut,
	Menu,
	Search,
	UserRound,
	X,
	type LucideProps,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { logoutUser, type UserAuthProfile } from '@/services/api/auth';
import { PortalSignoutDialog } from './portal-signout-dialog';
import styles from './portal-shell.module.css';

export type PortalNavItem = {
	href: string;
	label: string;
	icon: ComponentType<LucideProps>;
	active?: boolean;
};

export type PortalMetric = {
	label: string;
	value: string;
	description: string;
	icon: ComponentType<LucideProps>;
};

export type PortalAction = {
	href: string;
	label: string;
	description: string;
	icon: ComponentType<LucideProps>;
};

type PortalShellProps = {
	variant: 'customer' | 'partner';
	user: UserAuthProfile;
	title: string;
	description: string;
	eyebrow: string;
	homeHref: string;
	homeLabel: string;
	navigation: PortalNavItem[];
	metrics: PortalMetric[];
	actions: PortalAction[];
	children?: ReactNode;
};

export function PortalShell({
	variant,
	user,
	title,
	description,
	eyebrow,
	homeHref,
	homeLabel,
	navigation,
	metrics,
	actions,
	children,
}: PortalShellProps) {
	const router = useRouter();
	const pathname = usePathname();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const userInitials = getUserInitials(user.fullName || user.email);
	const portalLabel =
		variant === 'partner' ? 'Partner portal' : 'Customer portal';
	const avatarStyle = user.imageUrl
		? ({
				'--portal-avatar-image': `url("${user.imageUrl}")`,
			} as CSSProperties)
		: undefined;

	// Event handlers: logout clears the secure refresh cookie and local access token.
	async function handleLogout() {
		setIsLoggingOut(true);

		try {
			await logoutUser();
			toast.success('You have been signed out.', {
				description: 'Your secure Pluto Booking session has ended.',
			});
		} catch {
			toast.warning('Your local session was cleared.', {
				description: 'Please sign in again before accessing protected pages.',
			});
		} finally {
			setIsLoggingOut(false);
			setIsLogoutDialogOpen(false);
			router.replace('/');
		}
	}

	return (
		<>
			<main className={styles.portalPage} data-variant={variant}>
				<section className={styles.portalFrame} aria-label={portalLabel}>
					<div
						className={styles.mobileBackdrop}
						data-open={isSidebarOpen}
						onClick={() => setIsSidebarOpen(false)}
						aria-hidden="true"
					/>

					<aside className={styles.sidebar} data-open={isSidebarOpen}>
						<div className={styles.sidebarBrand}>
							<Link href="/" aria-label="Go to Pluto Booking home">
								<span>
									<Image
										src="/logo-b.png"
										alt=""
										width={28}
										height={28}
										priority
									/>
								</span>
								<strong>Pluto Booking</strong>
							</Link>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className={styles.sidebarClose}
								aria-label={`Close ${portalLabel.toLowerCase()} menu`}
								onClick={() => setIsSidebarOpen(false)}
							>
								<X aria-hidden="true" />
							</Button>
						</div>

						<nav
							className={styles.sidebarNav}
							aria-label={`${portalLabel} navigation`}
						>
							{navigation.map((item) => {
								const Icon = item.icon;
								const isActive = item.active ?? pathname === item.href;

								return (
									<Link
										key={item.label}
										href={item.href}
										data-active={isActive}
										onClick={() => setIsSidebarOpen(false)}
									>
										<Icon aria-hidden="true" />
										{item.label}
									</Link>
								);
							})}
						</nav>
					</aside>

					<div className={styles.portalShell}>
						<header className={styles.portalTopbar}>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className={styles.menuButton}
								aria-label={`Open ${portalLabel.toLowerCase()} menu`}
								onClick={() => setIsSidebarOpen(true)}
							>
								<Menu aria-hidden="true" />
							</Button>
							<div className={styles.topbarActions}>
								<div className={styles.topbarIdentity}>
									<span
										className={styles.topbarAvatar}
										data-has-image={Boolean(user.imageUrl)}
										style={avatarStyle}
										aria-hidden="true"
									>
										{user.imageUrl ? null : userInitials}
									</span>
									<span className={styles.topbarCopy}>
										{/* <em>{portalLabel}</em> */}
										<strong>{user.fullName}</strong>
										<em>{user.email}</em>
									</span>
								</div>
								<Button
									type="button"
									variant="destructive"
									className={styles.topbarLogoutButton}
									aria-label="Sign out"
									onClick={() => setIsLogoutDialogOpen(true)}
								>
									<LogOut aria-hidden="true" />
									<span className={styles.logoutLabel}>Exit</span>
								</Button>
							</div>
						</header>

						<div className={styles.portalHero}>
							<div className={styles.avatarMark} aria-hidden="true">
								<UserRound />
							</div>
							<div>
								<p className={styles.eyebrow}>{eyebrow}</p>
								<h1>{title}</h1>
								<p>{description}</p>
							</div>
							<Link href={homeHref} className={styles.primaryAction}>
								<Search aria-hidden="true" />
								{homeLabel}
								<ArrowRight aria-hidden="true" />
							</Link>
						</div>

						<div
							className={styles.statusGrid}
							aria-label={`${portalLabel} overview`}
						>
							{metrics.map((metric) => {
								const Icon = metric.icon;

								return (
									<article key={metric.label}>
										<Icon aria-hidden="true" />
										<strong>{metric.value}</strong>
										<span>{metric.label}</span>
										<small>{metric.description}</small>
									</article>
								);
							})}
						</div>

						{children}

						<div className={styles.quickActions}>
							{actions.map((action) => {
								const Icon = action.icon;

								return (
									<Link key={action.label} href={action.href}>
										<Icon aria-hidden="true" />
										<span>
											<strong>{action.label}</strong>
											<small>{action.description}</small>
										</span>
										<ArrowRight aria-hidden="true" />
									</Link>
								);
							})}
						</div>
					</div>
				</section>
			</main>

			<PortalSignoutDialog
				open={isLogoutDialogOpen}
				isSigningOut={isLoggingOut}
				onOpenChange={setIsLogoutDialogOpen}
				onConfirm={() => void handleLogout()}
			/>
		</>
	);
}

function getUserInitials(value: string) {
	const [first = 'P', second = 'B'] = value.trim().split(/\s+/).filter(Boolean);

	return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
}
