'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
	ArrowRight,
	CalendarCheck2,
	CreditCard,
	Heart,
	Home,
	LogOut,
	MapPin,
	Menu,
	Search,
	Settings,
	ShieldCheck,
	UserRound,
	X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
	logoutUser,
	refreshUserSession,
	type UserAuthProfile,
} from '@/services/api/auth';
import { RegistrationSuccessDialog } from './registration-success-dialog';
import styles from './portal-placeholder.module.css';

const sidebarLinks = [
	{ href: '/account', label: 'Overview', icon: Home, active: true },
	{ href: '/', label: 'Explore', icon: Search, active: false },
	{ href: '/account', label: 'Bookings', icon: CalendarCheck2, active: false },
	{ href: '/account', label: 'Favorites', icon: Heart, active: false },
	{ href: '/account', label: 'Payments', icon: CreditCard, active: false },
	{ href: '/account', label: 'Settings', icon: Settings, active: false },
] as const;

export function AccountCustomerPortal() {
	return (
		<Suspense fallback={<AccountPortalSkeleton />}>
			<AccountCustomerPortalContent />
		</Suspense>
	);
}

function AccountCustomerPortalContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [currentUser, setCurrentUser] = useState<UserAuthProfile | null>(null);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const showRegistrationDialog = searchParams.get('registered') === 'success';
	const userInitials = getUserInitials(
		currentUser?.fullName ?? currentUser?.email ?? 'Pluto Booking',
	);

	// Session snapshot: hydrate the customer portal with safe profile details only.
	useEffect(() => {
		let isActive = true;

		refreshUserSession()
			.then((response) => {
				if (isActive) {
					setCurrentUser(response.user);
				}
			})
			.catch(() => undefined);

		return () => {
			isActive = false;
		};
	}, []);

	// Event handlers: logout always clears local auth state and returns users home.
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
			<section className={styles.portalFrame} aria-label="Customer portal">
				<div
					className={styles.mobileBackdrop}
					data-open={isSidebarOpen}
					onClick={() => setIsSidebarOpen(false)}
					aria-hidden="true"
				/>

				<aside className={styles.sidebar} data-open={isSidebarOpen}>
					<div className={styles.sidebarBrand}>
						<Link href="/" aria-label="Go to Pluto Booking home">
							<span>PB</span>
							<strong>Pluto Booking</strong>
						</Link>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className={styles.sidebarClose}
							aria-label="Close customer menu"
							onClick={() => setIsSidebarOpen(false)}
						>
							<X aria-hidden="true" />
						</Button>
					</div>

					<div className={styles.sidebarProfile}>
						<span className={styles.sidebarAvatar}>{userInitials}</span>
						<span>
							<strong>{currentUser?.fullName ?? 'Customer'}</strong>
							<small>{currentUser?.email ?? 'Secure customer workspace'}</small>
						</span>
					</div>

					<nav className={styles.sidebarNav} aria-label="Customer portal navigation">
						{sidebarLinks.map((item) => {
							const Icon = item.icon;

							return (
								<Link
									key={item.label}
									href={item.href}
									data-active={item.active}
									onClick={() => setIsSidebarOpen(false)}
								>
									<Icon aria-hidden="true" />
									{item.label}
								</Link>
							);
						})}
					</nav>

					<div className={styles.sidebarFooter}>
						<div>
							<ShieldCheck aria-hidden="true" />
							<span>
								<strong>Protected session</strong>
								<small>Your account stays private on this device.</small>
							</span>
						</div>
						<Button
							type="button"
							variant="outline"
							className={styles.logoutButton}
							onClick={() => setIsLogoutDialogOpen(true)}
						>
							<LogOut aria-hidden="true" />
							Sign out
						</Button>
					</div>
				</aside>

				<div className={styles.portalShell}>
					<header className={styles.portalTopbar}>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className={styles.menuButton}
							aria-label="Open customer menu"
							onClick={() => setIsSidebarOpen(true)}
						>
							<Menu aria-hidden="true" />
						</Button>
						<div>
							<span>Customer portal</span>
							<strong>{currentUser?.fullName ?? 'Pluto customer'}</strong>
						</div>
						<Button
							type="button"
							variant="outline"
							className={styles.topbarLogoutButton}
							onClick={() => setIsLogoutDialogOpen(true)}
						>
							<LogOut aria-hidden="true" />
							Sign out
						</Button>
					</header>

					<div className={styles.portalHero}>
						<div className={styles.avatarMark} aria-hidden="true">
							<UserRound />
						</div>
						<div>
							<p className={styles.eyebrow}>Customer portal</p>
							<h1>
								{currentUser?.fullName
									? `Welcome back, ${currentUser.fullName}`
									: 'Welcome to your customer portal'}
							</h1>
							<p>
								Manage bookings, saved listings, profile details, and secure
								account preferences from one focused workspace.
							</p>
						</div>
						<Link href="/" className={styles.action}>
							<Search aria-hidden="true" />
							Explore Pluto Booking
							<ArrowRight aria-hidden="true" />
						</Link>
					</div>

					<div className={styles.statusGrid} aria-label="Account overview">
						<article>
							<CalendarCheck2 aria-hidden="true" />
							<strong>Bookings</strong>
							<span>No active booking yet</span>
						</article>
						<article>
							<Heart aria-hidden="true" />
							<strong>Saved listings</strong>
							<span>Start saving places you like</span>
						</article>
						<article>
							<ShieldCheck aria-hidden="true" />
							<strong>Account security</strong>
							<span>Session protected</span>
						</article>
					</div>

					<div className={styles.quickActions}>
						<Link href="/">
							<MapPin aria-hidden="true" />
							<span>
								<strong>Find stays and rentals</strong>
								<small>Browse Pluto Booking listings.</small>
							</span>
							<ArrowRight aria-hidden="true" />
						</Link>
						<Link href="/account">
							<Settings aria-hidden="true" />
							<span>
								<strong>Profile settings</strong>
								<small>Profile tools will appear here as the portal expands.</small>
							</span>
							<ArrowRight aria-hidden="true" />
						</Link>
					</div>
				</div>
			</section>

			<RegistrationSuccessDialog
				open={showRegistrationDialog}
				user={currentUser}
			/>

			<AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
				<AlertDialogContent className={styles.logoutDialog}>
					<AlertDialogHeader>
						<AlertDialogTitle>Sign out of Pluto Booking?</AlertDialogTitle>
						<AlertDialogDescription>
							Your secure session will end on this device. You will be returned
							to the homepage and must sign in again before viewing protected
							customer portal pages.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isLoggingOut}>
							<X aria-hidden="true" />
							Stay signed in
						</AlertDialogCancel>
						<AlertDialogAction
							disabled={isLoggingOut}
							onClick={(event) => {
								event.preventDefault();
								void handleLogout();
							}}
						>
							<LogOut aria-hidden="true" />
							{isLoggingOut ? 'Signing out...' : 'Sign out'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

function AccountPortalSkeleton() {
	return <section className={styles.portalFrame} aria-hidden="true" />;
}

function getUserInitials(value: string) {
	const [first = 'P', second = 'B'] = value
		.trim()
		.split(/\s+/)
		.filter(Boolean);

	return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
}
